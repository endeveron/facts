import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import CategoriesIcon from '@/components/svg/CategoriesIcon';
import TextFileIcon from '@/components/svg/TextFileIcon';
import UserIcon from '@/components/svg/UserIcon';
import { Text } from '@/components/Text';
import { SHARE_TITLE } from '@/core/constants';
import { FACTS_LEFT_TO_FETCH_NEW_ITEMS } from '@/core/constants/facts';
import { useSession } from '@/core/context/SessionProvider';
import {
  addFactsToCategoryGroup,
  addFactsToGroup,
  getFactDataFromLocalDb,
  increaseFactOffset,
  initCategoryDataInLocalDb,
  updateCursorTable,
  updateFavoritesTable,
} from '@/core/helpers/db/index';
import { initFactDataInLocalDb } from '@/core/helpers/db/init';
import { logMessage, sleep } from '@/core/helpers/misc';
import { TAddFactsToGroupResult, TFactCursor } from '@/core/types/db';
import { TFactItem } from '@/core/types/fact';
import Skeleton from '@/components/Skeleton';

// get the height of device window
const windowHeight = Dimensions.get('window').height;

// FlatList config
const viewabilityConfig = {
  waitForInteraction: true,
  minimumViewTime: 100,
  itemVisiblePercentThreshold: 25,
};

const animTimingConfig = {
  duration: 200,
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

const Facts = () => {
  const { session } = useSession();
  const db = useSQLiteContext();
  if (!session?.token) return null;

  const { category: factCategory, index: factIndex } = useLocalSearchParams();

  const [fetching, setFetching] = useState(false);
  const [cursor, setCursor] = useState<TFactCursor>();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [facts, setFacts] = useState<TFactItem[]>([]);

  const flatListRef = useRef<FlatList<TFactItem>>(null);
  const fadeList = useRef(new Animated.Value(0)).current;
  const fadeSkeleton = useRef(new Animated.Value(0)).current;

  const userId = session.user.id;
  const token = session.token;
  const factsLength = facts.length;
  const category = factCategory ? (factCategory as string) : null;
  const nextFactIndex = factIndex ? (factIndex as string) : null;

  const fadeInList = () => {
    Animated.timing(fadeList, {
      toValue: 1,
      delay: 100,
      ...animTimingConfig,
    }).start();
  };

  const fadeOutList = () => {
    Animated.timing(fadeList, {
      toValue: 0,
      ...animTimingConfig,
    }).start();
  };

  const fadeInSkeleton = () => {
    Animated.timing(fadeSkeleton, {
      toValue: 1,
      ...animTimingConfig,
    }).start();
  };

  const fadeOutSkeleton = () => {
    Animated.timing(fadeSkeleton, {
      toValue: 0,
      ...animTimingConfig,
    }).start();
  };

  const setFetchingCb = async (newFetching: boolean) => {
    if (!fetching && newFetching) fadeInSkeleton();
    if (fetching && !newFetching) fadeOutSkeleton();
    await sleep(200);
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
    await updateFavoritesTable({ operation, factId }, db);

    // !! keep that code
    // // send request to server
    // await postEvaluateFact({
    //   userId,
    //   factId,
    //   category,
    //   token,
    // });
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
      logMessage('[ FC ] unable to share', 'error');
    }
  };

  /** Scrolls the FlatList to a specific element */
  const scrollToItem = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: false,
      // animated: true,
    });
  };

  const handleScroll = async (item: TFactItem) => {
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
      // process the end of the fact list, get new facts from the local db
      if (leftInGroup === FACTS_LEFT_TO_FETCH_NEW_ITEMS) {
        let addFactsResult: TAddFactsToGroupResult = null;
        if (category) {
          addFactsResult = await addFactsToCategoryGroup({
            category,
            currentGroup: facts,
            cursor: updCursor,
            db,
          });
        } else {
          addFactsResult = await addFactsToGroup({
            currentGroup: facts,
            cursor: updCursor,
            db,
          });
        }
        if (!addFactsResult) {
          logMessage(`[ FC ] unable to get new facts`, 'error');
          return;
        }

        if (category) {
          // update cursor data
          addFactsResult.newCursor.storageOffset += 1;
          addFactsResult.newCursor.leftInStorage -= 1;
          addFactsResult.newCursor.leftInGroup -= 1;
        }

        const { newCursor, newGroup } = addFactsResult;
        setFacts((prev) => (prev = newGroup));
        updCursor = newCursor;
      }

      setCursor(updCursor);
      // save updated cursor in local db
      const updateCursorSuccess = await updateCursorTable(
        updCursor,
        db,
        category
      );
      if (!updateCursorSuccess) {
        logMessage(`[ FC ] unable to update cursor`, 'error');
        return;
      }

      if (isUpdate) {
        // update fact offset for the category in the fact_offset table
        const increaseOffset = await increaseFactOffset({
          category: item.category,
          db,
        });
        if (!increaseOffset) {
          logMessage(`[ FC ] unable to update fact offset`, 'error');
        }
      }

      // // dev
      // const factOffsetMap = await createOffsetMapFromTableData(db);
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

  // const fetchData = async () => {
  //   let fetchedFacts: TFactItem[] = [];
  //   let fetchedFavorites: string[] = [];
  //   let currentUpd: TCurrentItem | null = null;

  //   /**
  //    * - fetch data from db { facts: TFactItem[]; favorites: TFavorites }
  //    * - save facts and favorites in the local state
  //    * - save the data of the current item in the local state
  //    * - recalculate the number of facts not shown
  //    * - if no curItem init
  //    * - scroll to curItem
  //    * - save data in AsyncStorage
  //    */

  //   const result = await getFacts({
  //     userId,
  //     category: category as string,
  //     token,
  //   });
  //   if (result?.error) {
  //     showToast('Unable to fetch data from db');
  //     logMessage(
  //       `[ FC ] unable to fetch data from db: ${result.error.message}`,
  //       'error'
  //     );
  //     return;
  //   }

  //   // save facts and favorites in the local state
  //   if (result?.data) {
  //     logMessage('[ FC ] data fetched from db');
  //     fetchedFacts = result.data.facts;
  //     // fadeInList();
  //     fetchedFavorites = result.data.favorites;
  //     setFavorites(fetchedFavorites);
  //     // if (!fetchedFacts.length) setNoMoreFacts(true);
  //   }

  //   // save the data of the current item in the local state
  //   // and recalculate the number of facts not shown
  //   if (!cursor?.curFactId) {
  //     // initialize data
  //     logMessage('[ FC ] init current item');
  //     currentUpd = {
  //       id: fetchedFacts[0].id,
  //       index: 0,
  //     };
  //   } else {
  //     // refetch data
  //     // scroll to current item
  //     scrollToItem(cursor.curFactIndex);
  //   }
  // };

  const initFactData = async () => {
    // initialize local db tables
    const { success } = await initFactDataInLocalDb({
      authData: { userId, token },
      db,
      setFetchingCb,
    });
    if (!success) return;

    // get data from the local db
    const data = await getFactDataFromLocalDb(db);
    if (!data) return;
    logMessage('[ FC ] data recieved from local db');

    setCursor((d) => (d = data.cursor));
    setFavorites((d) => (d = data.favorites));
    setFacts((d) => (d = data.facts));

    await sleep(1);
    const index = nextFactIndex ? +nextFactIndex : data.cursor.curFactIndex;
    scrollToItem(index);
  };

  // handle fact category data if the url contains a 'category' search param
  const initCategoryData = async () => {
    logMessage('[ FC ] init category data');

    // get data for a certain category from the local db
    const data = await initCategoryDataInLocalDb({ category: category!, db });
    if (!data) return;
    logMessage('[ FC ] category data recieved from local db');

    setCursor((d) => (d = data.cursor));
    setFavorites((d) => (d = data.favorites));
    setFacts((d) => (d = data.facts));

    await sleep(1);
    scrollToItem(data.cursor.curFactIndex);
  };

  // initialize data, handle the `category` url search param if provided
  useEffect(() => {
    (async () => {
      if (category) initCategoryData();
      else initFactData();
    })();
  }, []);

  // fade in list
  useEffect(() => {
    if (factsLength) fadeInList();
  }, [factsLength]);

  // // fade in skeleton
  // useEffect(() => {
  //   if (!factsLength) fadeInSkeleton();
  // }, [factsLength]);

  // useEffect(() => {
  //   if (!category) return;
  //   const cb = async () => {
  //     // const facts = await getFactGroup({ category, db });
  //     const query = `SELECT * FROM category_group;`;
  //     const facts: TFactItem[] = await db.getAllAsync<TFactGroupTableItem>(
  //       query
  //     );
  //     console.log('CatGroup', facts);
  //   };
  //   cb();
  // }, [category]);

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
        <Animated.View style={{ opacity: fadeList }}>
          <FlatList
            ref={flatListRef}
            data={facts}
            className="relative"
            snapToAlignment="start" // 'start' - important to avoid item displacement on lazy load
            decelerationRate="normal"
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
          style={{ opacity: fadeSkeleton }}
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

export default Facts;
