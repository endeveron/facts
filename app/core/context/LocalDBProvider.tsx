import { SQLiteProvider } from 'expo-sqlite';
import { PropsWithChildren } from 'react';

const LocalDBProvider = ({ children }: PropsWithChildren) => {
  return <SQLiteProvider databaseName="facts.db">{children}</SQLiteProvider>;
};

export default LocalDBProvider;
