import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF7A00',      
        tabBarInactiveTintColor: '#888',      
        tabBarStyle: {
          backgroundColor: '#ffe291',
          borderTopColor: '#ddd',
          height: 80,                        
          paddingBottom: 10,                 
        },
        tabBarLabelStyle: {
          fontSize: 13,
         // marginTop: -5,                    
          paddingBottom: 10,                  
        },
        tabBarIconStyle: {
          marginTop: 10,                      
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={30} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quest"
        options={{
          title: 'Quests',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={30} name="list" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
