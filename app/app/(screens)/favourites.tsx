import Favourites from '@/components/Favourites';
import ScrollScreen from '@/components/ScrollScreen';

const favourites = () => {
  return (
    <ScrollScreen title="My Favourites">
      <Favourites />
    </ScrollScreen>
  );
};

export default favourites;
