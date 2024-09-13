import { useEffect, useState } from 'react';
import { View } from 'react-native';

import FavoriteItem from '@/components/FavoriteItem';
import { useAppContext } from '@/core/context/AppContext';
import { showAlert } from '@/core/helpers/alert';
import { getFavorites, postEvaluateFact } from '@/core/services/user';
import { TFactItem } from '@/core/types/facts';

type TFavoritesState = {
  liked: TFactItem[];
};

const Favorites = () => {
  const { auth } = useAppContext();
  const authSession = auth.session;
  if (authSession === null) return null;

  const [state, setState] = useState<TFavoritesState>({
    liked: [],
  });

  const userId = authSession.user.id;
  const token = authSession.token;

  const handleDislike = async (factId: string) => {
    const updLiked = [...state.liked].filter((data) => data.id !== factId);
    // Update local state
    setState(({ liked, ...state }) => ({
      liked: updLiked,
      ...state,
    }));
    // Send request to server
    await postEvaluateFact({
      userId,
      factId,
      token,
    });
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
      const likedFacts = result.data.liked;
      setState(({ liked, ...state }) => ({
        liked: likedFacts,
        ...state,
      }));
    }
  };

  // Init
  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <View className="-mt-2">
      {state.liked.map((data) => (
        <FavoriteItem itemData={data} onDislike={handleDislike} key={data.id} />
      ))}
    </View>
  );
};

export default Favorites;
