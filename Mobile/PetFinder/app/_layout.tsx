import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Adiciona a tela "landing" à navegação, e ela será a primeira tela a ser exibida. */}
        <Stack.Screen name="landing" options={{ headerShown: false }} />

        {/* A navegação de abas agora é uma tela separada na pilha. */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* A tela "not-found" é para lidar com rotas que não existem. */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}