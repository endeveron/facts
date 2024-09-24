import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  View,
  ViewToken,
} from 'react-native';

import FactItem from '@/components/FactItem';
import Navbar, { NavItemName, TNavbarItem } from '@/components/Navbar';
import CategoriesIcon from '@/components/svg/CategoriesIcon';
import TextFileIcon from '@/components/svg/TextFileIcon';
import UserIcon from '@/components/svg/UserIcon';
import { FACTS_LENGTH_TO_FETCH_NEW_ITEMS } from '@/core/constants/facts';
import { useAppContext } from '@/core/context/AppContext';
import { showAlert } from '@/core/helpers/alert';
import {
  getFactsStateFromAsyncStorage,
  saveFactsStateInAsyncStorage,
} from '@/core/helpers/store';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import { getFacts } from '@/core/services/fact';
import { postEvaluateFact } from '@/core/services/user';
import {
  EFactsStateKey,
  TCurrentItem,
  TFactItem,
  TFactsState,
} from '@/core/types/fact';

import { consoleClors } from '@/core/constants/colors';
const { cyan, gray, green, yellow, reset } = consoleClors;

// get the height of device window
const windowHeight = Dimensions.get('window').height;

// FlatList config
const viewabilityConfig = {
  waitForInteraction: true,
  minimumViewTime: 500,
  itemVisiblePercentThreshold: 75,
};

type TOnViewableItemsChangedArgs = {
  viewableItems: ViewToken<{
    title: string;
    id: string;
  }>[];
  changed: ViewToken<{
    title: string;
    id: string;
  }>[];
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
  const { category } = useLocalSearchParams();
  const { auth } = useAppContext();
  const authSession = auth.session;
  if (authSession === null) return null;

  const accentColor = useThemeColor('accent');

  const [isFetching, setIsFetching] = useState(false);
  const [noMoreFacts, setNoMoreFacts] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [state, setState] = useState<TFactsState>({
    facts: [],
    current: null,
    notShownNum: null,
  });

  // init the facts state key for the AsyncStorage
  // if the category
  const stateKey = category
    ? EFactsStateKey.FACTS_STATE_CAT
    : EFactsStateKey.FACTS_STATE;

  const flatListRef = useRef<FlatList<TFactItem>>(null);

  const userId = authSession.user.id;
  const token = authSession.token;
  const factsLength = state.facts.length;

  const handleCopy = async (text: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
  };

  const handleLike = async (factId: string, category: string) => {
    const favoritesUpd = [...favorites];
    const index = favoritesUpd.indexOf(factId);
    if (index === -1) {
      favoritesUpd.push(factId);
    } else {
      favoritesUpd.splice(index, 1);
    }
    setFavorites(favoritesUpd);
    // send request to server
    await postEvaluateFact({
      userId,
      factId,
      category,
      token,
    });
  };

  const onViewableItemsChanged = async ({
    viewableItems,
  }: TOnViewableItemsChangedArgs) => {
    if (viewableItems.length && viewableItems[0]) {
      const item = viewableItems[0];
      if (item.index == null) return;
      const updCurrent = {
        id: item.item.id,
        index: item.index,
      };

      // calculate the number of facts not shown
      let updNotShownNum = state.notShownNum as number;
      const calcNotShownNum = factsLength - updCurrent.index - 1;
      if (updNotShownNum > calcNotShownNum) {
        updNotShownNum = calcNotShownNum;
      }

      setState(({ current, notShownNum, ...rest }) => {
        return {
          current: updCurrent,
          notShownNum: updNotShownNum,
          ...rest,
        };
      });
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
    if (state.current !== null && state.notShownNum !== null) {
      const freshFacts = state.facts.slice(state.current.index);
      await saveFactsStateInAsyncStorage({
        stateKey,
        state: {
          facts: freshFacts,
          current: state.current,
          notShownNum: state.notShownNum,
        },
        favorites,
      });
      console.info(`${yellow}%s${reset}\n`, 'Leaving Facts');
    }
  };

  const fetchData = async () => {
    if (isFetching || noMoreFacts) return;
    setIsFetching(true);
    console.info(`${cyan}%s${reset}`, 'Fetching facts data...');

    let fetchedFacts: TFactItem[] = [];
    let fetchedFavorites: string[] = [];
    let updFacts: TFactItem[] = [];
    let updFactsLength: number = 0;
    let updCurrent: TCurrentItem | null = null;
    let updNotShownNum: number | null = null;

    const result = await getFacts({
      userId,
      category: (category as string) ?? 'all',
      token,
    });
    if (result?.error) {
      setIsFetching(false);
      showAlert(result.error.message);
      return;
    }

    // save facts and favorites in the local state
    if (result?.data) {
      setIsFetching(false);
      // console.info('Facts data fetched.');
      fetchedFacts = result.data.facts;
      setState(({ facts, ...rest }) => {
        updFacts = [...facts, ...fetchedFacts];
        updFactsLength = updFacts.length;
        return {
          facts: updFacts,
          ...rest,
        };
      });

      fetchedFavorites = result.data.favorites;
      setFavorites(fetchedFavorites);
      if (!fetchedFacts.length) setNoMoreFacts(true);
    }

    // save the data of the current item in the local state
    // and recalculate the number of facts not shown
    if (state.current === null) {
      // initialize data
      updCurrent = {
        id: fetchedFacts[0].id,
        index: 0,
      };
      updNotShownNum = updFactsLength - 1;
      setState(({ current, notShownNum, ...rest }) => ({
        current: updCurrent,
        notShownNum: updNotShownNum,
        ...rest,
      }));
    } else {
      // refetch data
      // scroll to current item
      flatListRef.current?.scrollToIndex({
        index: state.current.index,
        animated: false,
      });

      updNotShownNum = updFactsLength - state.current.index - 1;
      setState(({ notShownNum, ...rest }) => {
        return {
          notShownNum: updNotShownNum,
          ...rest,
        };
      });
    }

    if (updCurrent && updNotShownNum) {
      await saveFactsStateInAsyncStorage({
        stateKey,
        state: {
          facts: updFacts,
          current: updCurrent,
          notShownNum: updNotShownNum,
        },
        favorites: fetchedFavorites,
      });
    }
  };

  // initialize data
  useEffect(() => {
    // if the url contains `category` prop in the search parameters
    // fetch facts for a certain category from the server
    if (category) {
      fetchData();
      return;
    }

    // otherwise initialize the facts of all categories
    const init = async () => {
      // check whether the facts data is stored in the storage
      const factsStateFromStorage = await getFactsStateFromAsyncStorage(
        stateKey
      );

      if (!factsStateFromStorage) {
        // fetch data from the server
        await fetchData();
        return;
      }

      // fetch the new facts from the server if the stored data does not meet
      // the minimum threshold defined by `FACTS_LENGTH_TO_FETCH_NEW_ITEMS`
      const {
        state: { current, facts, notShownNum },
      } = factsStateFromStorage;
      // if (state.facts.length <= FACTS_LENGTH_TO_FETCH_NEW_ITEMS) {
      //   await fetchData();
      // }

      // restore facts state from the storage
      setState({
        facts,
        current,
        notShownNum,
      });
      // must be separated from the state
      setFavorites(factsStateFromStorage.favorites);
    };
    init();
  }, []);

  // fetch the new items only if the user has not viewed the last N facts.
  useEffect(() => {
    if (
      !isFetching &&
      state.notShownNum &&
      state.notShownNum <= FACTS_LENGTH_TO_FETCH_NEW_ITEMS
    ) {
      fetchData();
    }
  }, [state.notShownNum]);

  return (
    <View className="h-full relative">
      <Navbar navItems={navItems} onPress={handleNavbarPress} />

      {state.current === null && isFetching ? (
        <View className="-translate-y-24 h-full items-center justify-center">
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={state.facts}
          className="relative"
          snapToAlignment="start" // 'start' - important to avoid item displacement on lazy load
          decelerationRate="normal"
          snapToInterval={windowHeight}
          keyExtractor={(item) => item.id}
          getItemLayout={getItemLayout}
          disableIntervalMomentum={true}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item, index }) => (
            <FactItem
              itemData={{ index, ...item }}
              factsTotal={factsLength}
              favorites={favorites}
              onCopy={handleCopy}
              onLike={handleLike}
            />
          )}
        />
      )}
    </View>
  );
};

export default Facts;
