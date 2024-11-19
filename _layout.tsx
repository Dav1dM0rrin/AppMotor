import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { enableScreens } from 'react-native-screens';

export default function RootLayout() {
  useEffect(() => {
    enableScreens(true);
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}