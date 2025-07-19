import { QuestProvider } from "@/src/components/questProvider";
import { Stack, useLocalSearchParams } from "expo-router";

export default function Layout () {

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
        <Stack.Screen name="practice/index" options={{headerShown: false}}/>
        <Stack.Screen name="practice/[practiceID]" options={{headerShown: false}}/>
      </Stack>
    </QuestProvider>
  )
}
