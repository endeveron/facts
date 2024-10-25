import { useEffect, useState } from 'react';
import { View } from 'react-native';

import FavoriteItem from '@/components/FavoriteItem';
import { Text } from '@/components/Text';
import { useSession } from '@/core/context/SessionProvider';
import { useToast } from '@/core/hooks/useToast';
import { postEvaluateFact } from '@/core/services/users';
import { TFactItem } from '@/core/types/fact';
import {
  getFavoriteFacts,
  getFavoriteIdArray,
  updateFavoritesTable,
} from '@/core/helpers/db/main';
import { useSQLiteContext } from 'expo-sqlite';

type TFavoritesState = {
  favorites: TFactItem[];
};

const Favorites = () => {
  const { session } = useSession();
  if (!session) return null;

  // const db = useSQLiteContext();
  // const { showToast } = useToast();

  const [state, setState] = useState<TFavoritesState>({
    favorites: [],
  });

  const userId = session.user.id;
  const token = session.token;

  const handleDislike = async (factId: string, category: string) => {
    const updFavorites = [...state.favorites].filter(
      (data) => data.id !== factId
    );

    // // send request to server
    // postEvaluateFact({
    //   userId,
    //   factId,
    //   category,
    //   token,
    // });

    // update local state
    setState(({ favorites, ...state }) => ({
      favorites: updFavorites,
      ...state,
    }));

    // update data in favorites table
    await updateFavoritesTable({ operation: 'remove', factId });
  };

  // init
  useEffect(() => {
    (async () => {
      // get favorite id array from local db
      const favItems = await getFavoriteFacts();
      if (favItems) {
        setState(({ favorites, ...state }) => ({
          favorites: favItems,
          ...state,
        }));
      }

      // get favorite id array from remote db
      // const result = await getFavorites({
      //   userId,
      //   token,
      // });
      // if (result?.error) {
      //   showToast(result.error.message);
      // }
      // if (result?.data) {
      //   const fetchedFavorites = result.data.favorites;
      //   setState(({ favorites, ...state }) => ({
      //     favorites: fetchedFavorites,
      //     ...state,
      //   }));
      // }
    })();
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
