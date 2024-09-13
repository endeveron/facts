import Favorites from '@/components/Favorites';
import ScrollScreen from '@/components/ScrollScreen';

const favorites = () => {
  return (
    <ScrollScreen title="My Favorites">
      <Favorites />
    </ScrollScreen>
  );
};

export default favorites;
