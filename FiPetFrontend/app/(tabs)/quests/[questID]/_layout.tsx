import { QuestProvider } from "@/src/components/questProvider";
import { Stack, useLocalSearchParams, useNavigation  } from "expo-router";
import { useEffect } from "react";

export default function Layout () {

  const navigation = useNavigation('/(tabs)');
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: {
        display: "none",
      }
    });
  }, [navigation]);

  const { questID } = useLocalSearchParams<{ questID?: string }>();
  if ( ! questID ) {
    throw new Error( "No Quest ID" );
  }

  return (
    <QuestProvider questID={questID}>
      <Stack>
        <Stack.Screen name="index" options={{headerShown: false}}/>
        <Stack.Screen name="questions/index" options={{headerShown: false}}/>
        <Stack.Screen name="questions/[questionID]" options={{headerShown: false}}/>
      </Stack>
    </QuestProvider>
  )
}
