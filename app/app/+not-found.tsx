import { Redirect } from 'expo-router';

import { DEFAULT_REDIRECT_URL } from '@/core/constants';

const notFound = () => {
  return <Redirect href={DEFAULT_REDIRECT_URL} />;
};

export default notFound;
