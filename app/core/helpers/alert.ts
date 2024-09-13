import { Alert } from 'react-native';

export const showAlert = (message: string, title?: string) => {
  Alert.alert(title ?? 'Oops!', message);
};
