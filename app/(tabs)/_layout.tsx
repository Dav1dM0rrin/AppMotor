import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen 
        name="index"
        options={{
          title: 'Login',
          // si quieres un icono:
          // tabBarIcon: ({ color }) => <Ionicons name="log-in" size={24} color={color} />
        }}
      />
      <Tabs.Screen 
        name="control"
        options={{
          title: 'Control',
          // tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />
        }}
      />
      <Tabs.Screen 
        name="explorer"
        options={{
          title: 'Explorer',
          // tabBarIcon: ({ color }) => <Ionicons name="folder" size={24} color={color} />
        }}
      />
      <Tabs.Screen 
        name="reporte"
        options={{
          title: 'Reporte',
          // tabBarIcon: ({ color }) => <Ionicons name="folder" size={24} color={color} />
        }}
        />
    </Tabs>
    
  
  );
}