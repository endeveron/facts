import CreateFact from '@/components/CreateFact';
import ScrollScreen from '@/components/ScrollScreen';

const create = () => {
  return (
    <ScrollScreen title="Add Fact">
      <CreateFact />
    </ScrollScreen>
  );
};

export default create;
