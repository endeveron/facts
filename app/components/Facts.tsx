import * as Clipboard from 'expo-clipboard';
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
import UserIcon from '@/components/svg/UserIcon';
import { FACTS_LENGTH_TO_FETCH_NEW_ITEMS } from '@/core/constants';
import { useAppContext } from '@/core/context/AppContext';
import { showAlert } from '@/core/helpers/alert';
import {
  getFactsStateFromAsyncStorage,
  saveFactsStateInAsyncStorage,
} from '@/core/helpers/store';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import { getFacts } from '@/core/services/fact';
import { postEvaluateFact } from '@/core/services/user';
import { TCurrentItem, TFactItem } from '@/core/types/fact';

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

type TFactsState = {
  facts: TFactItem[];
  current: TCurrentItem | null;
  favorites: string[];
  notShownNum: number | null;
};

const navItems: TNavbarItem[] = [
  {
    name: NavItemName.categories,
    href: '/categories',
    icon: <CategoriesIcon />,
  },
  {
    name: NavItemName.profile,
    href: '/profile',
    icon: <UserIcon />,
    // className: 'w-6 -translate-x-[6px]',
  },
];

const Facts = () => {
  const { auth } = useAppContext();
  const authSession = auth.session;
  if (authSession === null) return null;

  const accentColor = useThemeColor('accent');

  const [isFetching, setIsFetching] = useState(false);
  const [noMoreFacts, setNoMoreFacts] = useState(false);
  const [state, setState] = useState<TFactsState>({
    facts: [],
    current: null,
    favorites: [],
    notShownNum: null,
  });

  const flatListRef = useRef<FlatList<TFactItem>>(null);

  const userId = authSession.user.id;
  const token = authSession.token;
  const factsLength = state.facts.length;

  const handleCopy = async (text: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
  };

  const handleLike = async (factId: string, category: string) => {
    const favoritesUpd = [...state.favorites];
    const index = favoritesUpd.indexOf(factId);
    if (index === -1) {
      favoritesUpd.push(factId);
    } else {
      favoritesUpd.splice(index, 1);
    }
    setState(({ favorites, ...rest }) => {
      return {
        favorites: favoritesUpd,
        ...rest,
      };
    });
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
  }: // changed,
  TOnViewableItemsChangedArgs) => {
    // add info: console.log('Changed in this iteration', changed);
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
        facts: freshFacts,
        current: state.current,
        favorites: state.favorites,
        notShownNum: state.notShownNum,
      });
    }
  };

  const fetchData = async () => {
    if (isFetching || noMoreFacts) return;
    setIsFetching(true);
    console.info('Fetching facts data...');

    let fetchedFacts: TFactItem[] = [];
    let fetchedFavorites: string[] = [];
    let updFacts: TFactItem[] = [];
    let updFactsLength: number = 0;
    let updCurrent: TCurrentItem | null = null;
    let updNotShownNum: number | null = null;

    const result = await getFacts({ userId, token });
    if (result?.error) {
      setIsFetching(false);
      showAlert(result.error.message);
      return;
    }

    // save facts and favorites facts to local state
    if (result?.data) {
      setIsFetching(false);
      console.info('Facts data fetched.');
      fetchedFacts = result.data.facts;
      fetchedFavorites = result.data.favorites;
      setState(({ facts, favorites, ...rest }) => {
        updFacts = [...facts, ...fetchedFacts];
        updFactsLength = updFacts.length;
        return {
          facts: updFacts,
          favorites: fetchedFavorites,
          ...rest,
        };
      });
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
        facts: updFacts,
        current: updCurrent,
        favorites: fetchedFavorites,
        notShownNum: updNotShownNum,
      });
    }
  };

  // initialize data
  useEffect(() => {
    const init = async () => {
      // check if the facts data is persist in the storage
      const factsStateFromStorage = await getFactsStateFromAsyncStorage();
      if (factsStateFromStorage !== null) {
        const { facts, current, favorites, notShownNum } =
          factsStateFromStorage;
        if (facts.length > FACTS_LENGTH_TO_FETCH_NEW_ITEMS) {
          setState({
            facts,
            current,
            favorites,
            notShownNum,
          });
        } else {
          fetchData();
        }
      } else {
        // otherwise, fetch data from server
        fetchData();
      }
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

  // // Dev
  // useEffect(() => {
  //   console.log('');
  //   console.log('facts        ', factsLength);
  //   console.log('current      ',
  //     state.current ? state.current.index + 1 : null
  //   );
  //   console.log('favorites        ', favorites.length);
  //   console.log('notShownNum  ', state.notShownNum);
  // }, [state.current, factsLength, state.notShownNum]);

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
              favorites={state.favorites}
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
