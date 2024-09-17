import { useEffect, useState } from 'react';
import { View } from 'react-native';

import FavouriteItem from '@/components/FavouriteItem';
import { useAppContext } from '@/core/context/AppContext';
import { showAlert } from '@/core/helpers/alert';
import { getFavourites, postEvaluateFact } from '@/core/services/user';
import { TFactItem } from '@/core/types/facts';

type TFavouritesState = {
  liked: TFactItem[];
};

const Favourites = () => {
  const { auth } = useAppContext();
  const authSession = auth.session;
  if (authSession === null) return null;

  const [state, setState] = useState<TFavouritesState>({
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

  const fetchFavourites = async () => {
    const result = await getFavourites({
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
    fetchFavourites();
  }, []);

  return (
    <View className="-mt-2">
      {state.liked.map((data) => (
        <FavouriteItem
          itemData={data}
          onDislike={handleDislike}
          key={data.id}
        />
      ))}
    </View>
  );
};

export default Favourites;
