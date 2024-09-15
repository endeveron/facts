import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';

import FactItem from '@/components/FactItem';
import HomeIcon from '@/components/svg/HomeIcon';
import { FACTS_LENGTH_TO_FETCH_NEW_ITEMS } from '@/core/constants';
import { useAppContext } from '@/core/context/AppContext';
import { showAlert } from '@/core/helpers/alert';
import {
  getFactsStateFromAsyncStorage,
  saveFactsStateInAsyncStorage,
} from '@/core/helpers/store';
import { getFacts } from '@/core/services/fact';
import { postEvaluateFact } from '@/core/services/user';
import { TCurrentItem, TFactItem } from '@/core/types/facts';
import Card from '@/components/Card';

// Get the height of device window
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
  liked: string[];
  notShownNum: number | null;
};

const Facts = () => {
  const { auth } = useAppContext();
  const authSession = auth.session;
  if (authSession === null) return null;

  const [isFetching, setIsFetching] = useState(false);
  const [noMoreFacts, setNoMoreFacts] = useState(false);
  const [state, setState] = useState<TFactsState>({
    facts: [],
    current: null,
    liked: [],
    notShownNum: null,
  });

  const userId = authSession.user.id;
  const token = authSession.token;
  const factsLength = state.facts.length;

  const handleLike = async (factId: string) => {
    const likedUpd = [...state.liked];
    const index = likedUpd.indexOf(factId);
    if (index === -1) {
      likedUpd.push(factId);
    } else {
      likedUpd.splice(index, 1);
    }
    setState(({ liked, ...rest }) => {
      return {
        liked: likedUpd,
        ...rest,
      };
    });
    // Send request to server
    await postEvaluateFact({
      userId,
      factId,
      token,
    });
  };

  const onViewableItemsChanged = async ({
    viewableItems,
  }: // changed,
  TOnViewableItemsChangedArgs) => {
    // Add info: console.log('Changed in this iteration', changed);
    if (viewableItems.length && viewableItems[0]) {
      const item = viewableItems[0];
      if (item.index == null) return;
      const updCurrent = {
        id: item.item.id,
        index: item.index,
      };

      // Calculate the number of facts not shown
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

  const handleGoHome = async () => {
    if (state.current !== null && state.notShownNum !== null) {
      const freshFacts = state.facts.slice(state.current.index);
      await saveFactsStateInAsyncStorage({
        facts: freshFacts,
        current: state.current,
        liked: state.liked,
        notShownNum: state.notShownNum,
      });
    }
    router.push('/');
  };

  const fetchData = async () => {
    if (isFetching || noMoreFacts) return;
    setIsFetching(true);
    console.info('Fetching facts data...');

    let fetchedFacts: TFactItem[] = [];
    let fetchedLiked: string[] = [];
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

    // Save facts and liked facts to local state
    if (result?.data) {
      setIsFetching(false);
      console.info('Facts data fetched.');
      fetchedFacts = result.data.facts;
      fetchedLiked = result.data.liked;
      setState(({ facts, liked, ...rest }) => {
        updFacts = [...facts, ...fetchedFacts];
        updFactsLength = updFacts.length;
        return {
          facts: updFacts,
          liked: fetchedLiked,
          ...rest,
        };
      });
      if (!fetchedFacts.length) setNoMoreFacts(true);
    }

    // Save the data of the current item in the local state
    // and recalculate the number of facts not shown
    if (state.current === null) {
      // Initialize data
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
      // Refetch data
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
        liked: state.liked,
        notShownNum: updNotShownNum,
      });
    }
  };

  // Initialize data
  useEffect(() => {
    const init = async () => {
      // Check if the facts data is persist in the storage
      const factsStateFromStorage = await getFactsStateFromAsyncStorage();
      if (factsStateFromStorage) {
        const { facts, current, liked, notShownNum } = factsStateFromStorage;
        if (facts.length > FACTS_LENGTH_TO_FETCH_NEW_ITEMS) {
          setState({
            facts,
            current,
            liked,
            notShownNum,
          });
        } else {
          fetchData();
        }
      } else {
        // Otherwise, fetch data from server
        fetchData();
      }
    };
    init();
  }, []);

  // Fetch new items only if the user has not viewed the last N facts.
  useEffect(() => {
    if (
      !isFetching &&
      state.notShownNum &&
      state.notShownNum <= FACTS_LENGTH_TO_FETCH_NEW_ITEMS
    ) {
      fetchData();
    }
  }, [state.notShownNum]);

  // // Dev Log
  // useEffect(() => {
  //   console.log('');
  //   console.log('facts        ', factsLength);
  //   console.log('current      ',
  //     state.current ? state.current.index + 1 : null
  //   );
  //   console.log('liked        ', liked.length);
  //   console.log('notShownNum  ', state.notShownNum);
  // }, [state.current, factsLength, state.notShownNum]);

  return (
    <View className="h-full relative">
      <View className="absolute bottom-4 right-4 z-50">
        <TouchableOpacity onPress={handleGoHome}>
          <Card addClassName="p-4 rounded-full">
            <HomeIcon />
          </Card>
        </TouchableOpacity>
      </View>

      <FlatList
        data={state.facts}
        className="relative"
        snapToAlignment="center"
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
            liked={state.liked}
            onLike={handleLike}
          />
        )}
      />
    </View>
  );
};

export default Facts;
