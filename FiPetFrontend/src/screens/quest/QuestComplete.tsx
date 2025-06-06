// Goal: Page shows XP/rewards and completion screen.
// STATUS: NOT IMPLEMENTED
import { ThemedView } from "@/src/components/ThemedView";
import { Link } from "expo-router";
import { Text } from "react-native";

export default function QuestComplete() {
  return (
    <ThemedView style={{height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20}}>
      <Text style={{fontSize: 36}}>Completed!</Text>
      <Link href="/home" style={{fontSize: 26, backgroundColor: 'blue', color: 'white', borderRadius: 5, width: "70%", textAlign: "center", padding: 7, margin: 10}}>Home</Link>
    </ThemedView>
  );
}
