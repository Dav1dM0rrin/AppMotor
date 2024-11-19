import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './(tabs)/types';
import LoginScreen from './(tabs)/index';
import ControlScreen from './(tabs)/control';
import ReporteScreen from './(tabs)/reporte';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Control" component={ControlScreen} />
        <Stack.Screen name="Reporte" component={ReporteScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}