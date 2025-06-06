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
        <Stack.Screen name="index" options={{headersShown: false}}/>
        <Stack.Screen name="questions/index" options={{headersShown: false}}/>
        <Stack.Screen name="questions/[questionID]" options={{headersShown: false}}/>
      </Stack>
    </QuestProvider>
  )
}
