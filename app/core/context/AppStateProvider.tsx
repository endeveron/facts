import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { AppState } from 'react-native';

import { consoleClors } from '@/core/constants/colors';
import { TAppStateContext } from '@/core/types/common';

const { cyan, green, reset } = consoleClors;

const AppStateContext = createContext<TAppStateContext>({
  appState: typeof AppState.currentState,
});

export const useAppState = () => {
  const value = useContext(AppStateContext);
  return value;
};

export const AppStateProvider = ({ children }: PropsWithChildren) => {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // if (
      //   appState.current.match(/inactive|background/) &&
      //   nextAppState === 'active'
      // ) {
      //   console.log('App has come to the foreground!');
      // }

      appState.current = nextAppState;
      console.info(
        `${green}%s${cyan}%s${reset}`,
        `[ AS ] `,
        `${appState.current}`
      );
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const value = {
    appState: appState.current,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};
