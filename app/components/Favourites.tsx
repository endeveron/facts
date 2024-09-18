import { useEffect, useState } from 'react';
import { View } from 'react-native';

import FavouriteItem from '@/components/FavouriteItem';
import { useAppContext } from '@/core/context/AppContext';
import { showAlert } from '@/core/helpers/alert';
import { getFavourites, postEvaluateFact } from '@/core/services/user';
import { TFactItem } from '@/core/types/fact';
import HeartIcon from '@/components/svg/HeartIcon';
import { heartColor } from '@/core/constants/colors';
import { Text } from '@/components/Text';

type TFavouritesState = {
  favourites: TFactItem[];
};

const Favourites = () => {
  const { auth } = useAppContext();
  const authSession = auth.session;
  if (authSession === null) return null;

  const [state, setState] = useState<TFavouritesState>({
    favourites: [],
  });

  const userId = authSession.user.id;
  const token = authSession.token;

  const handleDislike = async (factId: string, category: string) => {
    const updFavourites = [...state.favourites].filter(
      (data) => data.id !== factId
    );
    // Update local state
    setState(({ favourites, ...state }) => ({
      favourites: updFavourites,
      ...state,
    }));
    // Send request to server
    await postEvaluateFact({
      userId,
      factId,
      category,
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
      const fetchedFavourites = result.data.favourites;
      setState(({ favourites, ...state }) => ({
        favourites: fetchedFavourites,
        ...state,
      }));
    }
  };

  // Init
  useEffect(() => {
    fetchFavourites();
  }, []);

  return (
    <View className="pb-28">
      <View className="flex-row items-center px-4 pb-2">
        <View className="mr-3">
          <HeartIcon size={20} color={heartColor} />
        </View>
        <Text className="text-xl font-pbold">My Favourites</Text>
      </View>

      {state.favourites.map((data) => (
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
