import { useLocalSearchParams } from 'expo-router';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Share,
  View,
  ViewToken,
} from 'react-native';

import FactItem from '@/components/FactItem';
import Navbar, { NavItemName, TNavbarItem } from '@/components/Navbar';
import Skeleton from '@/components/Skeleton';
import CategoriesIcon from '@/components/svg/CategoriesIcon';
import TextFileIcon from '@/components/svg/TextFileIcon';
import UserIcon from '@/components/svg/UserIcon';
import { Text } from '@/components/Text';
import { SHARE_TITLE } from '@/core/constants';
import {
  FACT_GROUP_LIMIT,
  FACTS_LEFT_TO_FETCH_NEW_ITEMS,
  FACTS_LENGTH_TO_DECREASE_LIST,
} from '@/core/constants/facts';
import { useSession } from '@/core/context/SessionProvider';
import { initFactDataInLocalDb } from '@/core/helpers/db/init';
import {
  addFactsOnScroll,
  getFactDataFromLocalDb,
  increaseFactOffset,
  initCategoryDataInLocalDb,
  truncateFactsOnScroll,
  updateCursorTable,
  updateFavoritesTable,
} from '@/core/helpers/db/main';
import { logMessage, wait } from '@/core/helpers/misc';
import { TFactCursor } from '@/core/types/db';
import { TFactItem } from '@/core/types/fact';

// get the height of device window
const windowHeight = Dimensions.get('window').height;

const ANIM_DURATION = 200;

// FlatList config
const viewabilityConfig = {
  waitForInteraction: true,
  minimumViewTime: 100,
  itemVisiblePercentThreshold: 25,
};

const animTimingConfig = {
  duration: ANIM_DURATION,
  useNativeDriver: true,
};

type TOnViewableItemsChangedArgs = {
  viewableItems: ViewToken<TFactItem>[];
  changed: ViewToken<TFactItem>[];
};

const navItems: TNavbarItem[] = [
  {
    name: NavItemName.categories,
    href: '/categories',
    icon: <CategoriesIcon />,
  },
  {
    name: NavItemName.facts,
    href: `/facts`,
    icon: <TextFileIcon />,
  },
  {
    name: NavItemName.profile,
    href: '/profile',
    icon: <UserIcon />,
  },
];

const SCROLL_DELAY = 500;

const Facts = () => {
  const { session } = useSession();
  if (!session?.token) return null;

  const { category: factCategory, nextIndex } = useLocalSearchParams();

  const [fetching, setFetching] = useState(false);
  const [cursor, setCursor] = useState<TFactCursor>();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [facts, setFacts] = useState<TFactItem[]>([]);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const fadeListRef = useRef(new Animated.Value(0)).current;
  const fadeSkeletonRef = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<TFactItem>>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userId = session.user.id;
  const token = session.token;
  const factsLength = facts.length;
  const category = factCategory ? (factCategory as string) : null;
  const nextFactIndex = nextIndex ? (nextIndex as string) : null;

  const fadeInList = () => {
    Animated.timing(fadeListRef, {
      toValue: 1,
      delay: 100,
      ...animTimingConfig,
    }).start();
  };

  const fadeOutList = () => {
    Animated.timing(fadeListRef, {
      toValue: 0,
      ...animTimingConfig,
    }).start();
  };

  const fadeInSkeleton = () => {
    Animated.timing(fadeSkeletonRef, {
      toValue: 1,
      ...animTimingConfig,
    }).start();
  };

  const fadeOutSkeleton = () => {
    Animated.timing(fadeSkeletonRef, {
      toValue: 0,
      ...animTimingConfig,
    }).start();
  };

  const setFetchingCb = async (newFetching: boolean) => {
    if (!fetching && newFetching) fadeInSkeleton();
    if (fetching && !newFetching) fadeOutSkeleton();
    await wait(ANIM_DURATION);
    setFetching(newFetching);
  };

  const handleLike = async (factId: string, category: string) => {
    const favoritesUpd = [...favorites];
    const index = favoritesUpd.indexOf(factId);
    const isLike = index === -1;
    if (isLike) {
      favoritesUpd.push(factId);
    } else {
      favoritesUpd.splice(index, 1);
    }
    setFavorites(favoritesUpd);

    // update data in favorites table
    const operation = isLike ? 'add' : 'remove';
    await updateFavoritesTable({ operation, factId });
  };

  const handleShare = async (title: string) => {
    try {
      const result = await Share.share({
        title: SHARE_TITLE,
        message: title,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      await logMessage('[ FC ] unable to share', 'error');
    }
  };

  /** Scrolls the FlatList to a specific element */
  const scrollToItem = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: false,
    });
  };

  const preventFastScrolling = () => {
    setScrollEnabled(false);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(
      () => setScrollEnabled(true),
      SCROLL_DELAY
    );
  };

  const handleScroll = async (item: TFactItem) => {
    preventFastScrolling();

    // update cursor data
    const prevLeftInGroup = cursor!.leftInGroup;
    const newLeftInGroup = facts.length - item.index - 1;
    const isUpdate = newLeftInGroup < prevLeftInGroup;
    const leftInGroup = isUpdate ? newLeftInGroup : prevLeftInGroup;
    const prevLeftInStorage = cursor!.leftInStorage;
    const prevStorageOffset = cursor!.storageOffset;
    const leftInStorage = isUpdate ? prevLeftInStorage - 1 : prevLeftInStorage;
    const storageOffset = isUpdate ? prevStorageOffset + 1 : prevStorageOffset;
    let updCursor: TFactCursor = {
      curFactId: item.id,
      curFactIndex: item.index,
      groupLength: facts.length,
      leftInGroup: leftInGroup,
      leftInStorage: leftInStorage,
      storageOffset: storageOffset,
      done: cursor!.done,
    };
    if (category) {
      updCursor.category = category;
    }

    try {
      // get new facts from the local db in the end of the fact list
      if (leftInGroup === FACTS_LEFT_TO_FETCH_NEW_ITEMS) {
        const addFactsResult = await addFactsOnScroll({
          category,
          currentGroup: facts,
          cursor: updCursor,
        });
        if (!addFactsResult) return;

        const { newCursor, newGroup } = addFactsResult;
        updCursor = newCursor;

        // update local state
        setFacts((prev) => (prev = newGroup));
      }

      // remove old facts if the fact list length is greater than FACTS_LENGTH_TO_DECREASE_LIST
      if (
        updCursor.curFactIndex >= FACT_GROUP_LIMIT &&
        facts.length >= FACTS_LENGTH_TO_DECREASE_LIST
      ) {
        const cropFactsResult = await truncateFactsOnScroll({
          category,
          currentGroup: facts,
          cursor: updCursor,
        });
        if (!cropFactsResult) return;

        const { newCursor, newGroup } = cropFactsResult;
        updCursor = newCursor;

        // update local state
        setFacts((prev) => (prev = newGroup));
        setCursor(updCursor);
        scrollToItem(newCursor.curFactIndex);
      } else {
        setCursor(updCursor);
      }

      // save updated cursor in local db
      const updateCursorSuccess = await updateCursorTable(updCursor, category);
      if (!updateCursorSuccess) {
        await logMessage(`[ FC ] unable to update cursor`, 'error');
        return;
      }
      if (isUpdate) {
        // update fact offset for the category in the fact_offset table
        const increaseOffset = await increaseFactOffset({
          category: item.category,
        });
        if (!increaseOffset) {
          await logMessage(`[ FC ] unable to update fact offset`, 'error');
        }
      }
      // // dev
      // const factOffsetMap = await createOffsetMapFromTableData();
      // console.log('offsetMap', factOffsetMap);
    } catch (err: any) {
      console.error(err);
    }
  };

  const onViewableItemsChanged = async ({
    viewableItems,
  }: TOnViewableItemsChangedArgs) => {
    if (viewableItems.length && viewableItems[0]) {
      handleScroll(viewableItems[0].item);
    }
  };

  const getItemLayout = useCallback(
    (data: ArrayLike<TFactItem> | null | undefined, index: number) => {
      return {
        length: windowHeight,
        offset: windowHeight * index,
        index,
      };
    },
    []
  );

  const handleNavbarPress = async (name: NavItemName) => {
    fadeOutList();
  };

  const initFactData = async () => {
    // initialize the local db tables, if necessary
    const { success } = await initFactDataInLocalDb({
      authData: { userId, token },
      setFetchingCb,
    });
    if (!success) return;

    // get data from the local db
    const data = await getFactDataFromLocalDb();
    if (!data) return;
    await logMessage('[ FC ] facts data recieved from local db');

    setCursor((d) => (d = data.cursor));
    setFavorites((d) => (d = data.favorites));
    setFacts((d) => (d = data.facts));

    await wait(10);
    const index = nextFactIndex ? +nextFactIndex : data.cursor.curFactIndex;
    scrollToItem(index);
  };

  // handle fact category data if the url contains a 'category' search param
  const initCategoryData = async () => {
    await logMessage('[ FC ] init category data');

    // get data for a certain category from the local db
    const data = await initCategoryDataInLocalDb(category!);
    if (!data) return;
    await logMessage('[ FC ] category data recieved from local db');

    setCursor((d) => (d = data.cursor));
    setFavorites((d) => (d = data.favorites));
    setFacts((d) => (d = data.facts));

    await wait(10);
    scrollToItem(data.cursor.curFactIndex);
  };

  // initialize data on mount, clear timeout on dismount
  useEffect(() => {
    // handle the `category` url search param if provided
    if (category) initCategoryData();
    else initFactData();

    // clear timeout on component unmount
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // fade in list
  useEffect(() => {
    if (factsLength) fadeInList();
  }, [factsLength]);

  return (
    <View className="h-full relative">
      <View className="absolute inset-x-0 top-14">
        <View className="flex-row flex-wrap justify-evenly">
          <View className="m-2">
            <Text
              colorName="muted"
              className="opacity-80 bg-black px-2 rounded-full"
            >
              category
            </Text>
            <Text
              colorName="muted"
              className="opacity-80 bg-black px-2 rounded-full"
            >
              store offset
            </Text>
          </View>
          <View className="m-2">
            <Text colorName="muted" className="bg-black px-2 rounded-full">
              {cursor?.category}
            </Text>
            <Text colorName="muted" className="bg-black px-2 rounded-full">
              {cursor?.storageOffset}
            </Text>
          </View>
          <View className="m-2">
            <Text
              colorName="muted"
              className="opacity-80 bg-black px-2 rounded-full"
            >
              group length
            </Text>
            <Text
              colorName="muted"
              className="opacity-80 bg-black px-2 rounded-full"
            >
              left in store
            </Text>
          </View>
          <View className="m-2">
            <Text colorName="muted" className="bg-black px-2 rounded-full">
              {cursor?.groupLength}
            </Text>
            <Text colorName="muted" className="bg-black px-2 rounded-full">
              {cursor?.leftInStorage}
            </Text>
          </View>
        </View>
      </View>
      <Navbar navItems={navItems} onPress={handleNavbarPress} />
      {factsLength && cursor?.curFactId ? (
        <Animated.View style={{ opacity: fadeListRef }}>
          <FlatList
            ref={flatListRef}
            data={facts}
            className="relative"
            snapToAlignment="start" // 'start' - important to avoid item displacement on lazy load
            decelerationRate="normal"
            initialNumToRender={FACT_GROUP_LIMIT}
            maxToRenderPerBatch={FACT_GROUP_LIMIT}
            scrollEnabled={scrollEnabled} // control scrolling dynamically
            snapToInterval={windowHeight}
            keyExtractor={(item) => item.id}
            getItemLayout={getItemLayout}
            disableIntervalMomentum={true}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            renderItem={({ item }) => (
              <FactItem
                itemData={item}
                factsTotal={factsLength}
                favorites={favorites}
                onLike={handleLike}
                onShare={handleShare}
              />
            )}
          />
        </Animated.View>
      ) : fetching ? (
        <Animated.View
          className="flex-1 items-center justify-center"
          style={{ opacity: fadeSkeletonRef }}
        >
          <Skeleton containerClassName="h-[480px] -translate-y-16 p-4">
            <Text className="h-4 w-1/5 -mt-4 rounded-full bg-slate-600 opacity-80"></Text>
            <Text className="h-8 w-full mt-10 rounded-full bg-slate-600 opacity-80"></Text>
            <Text className="h-8 w-3/5 mt-4 rounded-full bg-slate-600 opacity-80"></Text>
          </Skeleton>
        </Animated.View>
      ) : null}
    </View>
  );
};

export default memo(Facts);
