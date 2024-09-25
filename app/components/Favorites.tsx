import { useEffect, useState } from 'react';
import { View } from 'react-native';

import FavoriteItem from '@/components/FavoriteItem';
import HeartIcon from '@/components/svg/HeartIcon';
import { Text } from '@/components/Text';
import { KEY_FACTS_FAVORITES } from '@/core/constants';
import { heartColor } from '@/core/constants/colors';
import { useAppContext } from '@/core/context/AppContext';
import { showAlert } from '@/core/helpers/alert';
import { getFavorites, postEvaluateFact } from '@/core/services/user';
import { TFactItem } from '@/core/types/fact';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TFavoritesState = {
  favorites: TFactItem[];
};

const Favorites = () => {
  const { auth } = useAppContext();
  const authSession = auth.session;
  if (!authSession) return null;

  const [state, setState] = useState<TFavoritesState>({
    favorites: [],
  });

  const userId = authSession.user.id;
  const token = authSession.token;

  const handleDislike = async (factId: string, category: string) => {
    const updFavorites = [...state.favorites].filter(
      (data) => data.id !== factId
    );

    // send request to server
    postEvaluateFact({
      userId,
      factId,
      category,
      token,
    });

    // update local state
    setState(({ favorites, ...state }) => ({
      favorites: updFavorites,
      ...state,
    }));

    // store updated favorites in AsyncStorage.
    const favoritesStr = JSON.stringify(updFavorites);
    await AsyncStorage.setItem(KEY_FACTS_FAVORITES, favoritesStr);
  };

  const fetchFavorites = async () => {
    const result = await getFavorites({
      userId,
      token,
    });
    if (result?.error) {
      showAlert(result.error.message);
    }
    if (result?.data) {
      const fetchedFavorites = result.data.favorites;
      setState(({ favorites, ...state }) => ({
        favorites: fetchedFavorites,
        ...state,
      }));
    }
  };

  // init
  useEffect(() => {
    fetchFavorites();
  }, []);

  return state.favorites.length ? (
    <View className="pb-28">
      <View className="flex-row items-center px-4 pb-2">
        <View className="mr-3">
          <HeartIcon size={20} color={heartColor} />
        </View>
        <Text className="text-xl font-pbold">My Favorites</Text>
      </View>

      {state.favorites.map((data) => (
        <FavoriteItem itemData={data} onDislike={handleDislike} key={data.id} />
      ))}
    </View>
  ) : null;
};

export default Favorites;
