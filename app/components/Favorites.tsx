import { useEffect, useState } from 'react';
import { View } from 'react-native';

import FavoriteItem from '@/components/FavoriteItem';
import HeartIcon from '@/components/svg/HeartIcon';
import { Text } from '@/components/Text';
import { KEY_FACTS_FAVORITES } from '@/core/constants';
import { useSession } from '@/core/context/SessionContext';
import { useToast } from '@/core/hooks/useToast';
import { getFavorites, postEvaluateFact } from '@/core/services/users';
import { TFactItem } from '@/core/types/fact';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColor } from '@/core/hooks/useThemeColor';

type TFavoritesState = {
  favorites: TFactItem[];
};

const Favorites = () => {
  const { session } = useSession();
  if (!session) return null;

  const { showToast } = useToast();
  const heartIconColor = useThemeColor('heartIcon');

  const [state, setState] = useState<TFavoritesState>({
    favorites: [],
  });

  const userId = session.user.id;
  const token = session.token;

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
      showToast(result.error.message);
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
    <View className="mt-6 pb-28">
      <View className="flex-row items-center px-4 mb-2">
        <Text colorName="muted" className="text-base font-psemibold">
          My Favorites
        </Text>
      </View>

      {state.favorites.map((data) => (
        <FavoriteItem itemData={data} onDislike={handleDislike} key={data.id} />
      ))}
    </View>
  ) : null;
};

export default Favorites;
