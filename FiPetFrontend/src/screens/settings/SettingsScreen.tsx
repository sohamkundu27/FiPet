import { ThemedText } from "@/src/components/ThemedText";
import { ThemedView } from "@/src/components/ThemedView";
import { Link } from "expo-router";

export default function SettingsScreen() {
  return (
    <ThemedView>
      <ThemedText>
        Settings Screen
      </ThemedText>
      <Link href="/settings/profile">Profile</Link>
    </ThemedView>
  );

}
