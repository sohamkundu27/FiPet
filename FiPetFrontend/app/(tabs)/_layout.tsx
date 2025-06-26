import { GamificationProvider } from '@/src/components/providers/GamificationProvider';
import { RequiresAuth } from '@/src/components/providers/RequiresAuth';
import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { useThemeColor } from '@/src/hooks/useThemeColor';

export default function TabLayout() {
  const headerBG = useThemeColor({light: Colors.primary.default, dark: Colors.primary.darker}, 'background')
  const headerText = useThemeColor({light: "#000", dark: "#FFF"}, 'background')

  const settingsOptions = {
      headerStyle: {
        backgroundColor: headerBG,
      },
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerTintColor: headerText,
  }

  return (
    <RequiresAuth>
      <GamificationProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#FF7A00',
            tabBarInactiveTintColor: '#888',
            tabBarStyle: {
              backgroundColor: '##E9E9E9',
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
              tabBarShowLabel: false,
              tabBarIcon: ({ focused }) => (
                <Image
                  source={
                    focused
                      ? require('@/src/assets/images/home-selected.png')
                      : require('@/src/assets/images/home.png')
                  }
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Tabs.Screen
            name="quests"
            options={{
              title: 'Quests',
              headerShown: false,
              tabBarShowLabel: false,
              tabBarIcon: ({ focused }) => (
                <Image
                  source={
                    focused
                      ? require('@/src/assets/images/quest-selected.png')
                      : require('@/src/assets/images/quest.png')
                  }
                  style={{ width: 50, height: 50 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              ...settingsOptions,
              tabBarShowLabel: true,
              tabBarIcon: ({ focused }) => (
                <Image
                  source={
                    focused
                      ? require('@/src/assets/images/settings.png')
                      : require('@/src/assets/images/settings.png')
                  }
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
              ),
            }}
          />
        </Tabs>
      </GamificationProvider>
    </RequiresAuth>
  );
}
