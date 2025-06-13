import SettingsGroup from "@/src/components/settings/SettingsGroup";
import { ThemedView } from "@/src/components/ThemedView";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";

export default function SettingsScreen() {
  return (
    <ThemedView style={{paddingTop: 30, height: "100%"}}>
      <ScrollView>
        <SettingsGroup groupName="General" settings={[
          {
            title: "Edit Profile",
            action: () => {}
          },
          {
            title: "Log Out",
            action: () => {},
            color: "#F00"
          }
        ]}/>
      </ScrollView>
    </ThemedView>
  );

}
