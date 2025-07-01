import SettingsGroup from "@/src/components/settings/SettingsGroup";
import { ThemedView } from "@/src/components/ThemedView";
import { useRouter } from "expo-router";
import { ScrollView, Linking, View, Alert } from "react-native";
import TextInputModal from "@/src/components/modals/TextInputModal";
import { useEffect, useState } from "react";
import ConfirmModal from "@/src/components/modals/ConfirmModal";
import BaseModal from "@/src/components/modals/BaseModal";
import { db } from "@/src/config/firebase";
import { signOut } from "@firebase/auth";
import { doc, getDoc, updateDoc } from "@firebase/firestore";
import { validateUsername } from "@/src/functions/validation";
import { useAuth } from "@/src/hooks/useRequiresAuth";
import { ThemedText } from "@/src/components/ThemedText";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { Colors } from "@/src/constants/Colors";

export default function SettingsScreen() {
  const version = "0.0.0";
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const {user, auth} = useAuth();
  
  const _modalVisibility = {
    "username": false,
    "reset": false,
    "version": false,
  }
  const [modalVisibility, setVisibility] = useState(_modalVisibility);

  // Move useThemeColor hook to the top to prevent conditional calls
  const redColor = useThemeColor({light: Colors.red, dark: Colors.lightred}, "text");

  const userdoc = doc(db, 'users', user.uid);

  useEffect(() => {
    if (userdoc) {
      getDoc(userdoc).then((doc) => {
        if (doc.exists()) {
          setUsername(doc.get("username") || "");
        }
      }).catch((error) => {
        console.error("Error fetching username:", error);
      });
    } else {
      setUsername("");
    }
  }, [userdoc]);

  function closeModal(modalName: keyof typeof _modalVisibility) {
    setVisibility((prev)=>({...prev, [modalName]: false }));
  }

  function openModal(modalName: keyof typeof _modalVisibility) {
    setVisibility((prev)=>({...prev, [modalName]: true }));
  }

  return (
    <ThemedView style={{paddingTop: 30, height: "100%", paddingHorizontal: 10}}>
      <ScrollView>
        <SettingsGroup groupName="General" settings={[
          {
            title: "Edit Username",
            subtitle: `Username: ${username}`,
            action: () => {
              openModal("username");
            }
          },
          {
            title: "Report an issue",
            action: () => {
              Linking.openURL("mailto:support@fipet.com?subject=Issue%20Report");
            },
          },
          {
            title: `Version ${version}`,
            action: () => {
              openModal("version")
            },
          },
          {
            title: "Log Out",
            action: () => {
              router.replace('/landing');
              signOut(auth).then(() => {
                // Sign out completed successfully
              }).catch((error) => {
                console.error("Error signing out:", error);
              });
            },
            color: redColor
          },
          {
            title: "Reset Pet",
            action: () => {
              openModal("reset")
            },
            color: redColor
          },
        ]}/>
      </ScrollView>

      <TextInputModal
        isVisible={modalVisibility.username}
        title="Change Username"
        defaultValue={username}
        onClose={()=>closeModal("username")}
        onConfirm={(inputText)=>{
          if (userdoc) {
            updateDoc(userdoc, {"username": inputText}).then(()=>{
              setUsername(inputText);
            }).catch((err)=>{
              Alert.alert("Couldn't Change Username", "Please try again later, or report an issue.");
              console.error(`Error setting Username: ${err}`)
            })
          }
        }}
        validation={validateUsername}
        />
      <ConfirmModal
        isVisible={modalVisibility.reset}
        onClose={()=>closeModal("reset")}
        onConfirm={()=>{
          if (userdoc) {
            updateDoc(userdoc, {
              "current_level": 0,
              "current_xp": 0,
            }).then(()=>{
              router.navigate("/welcome")
            }).catch((err)=>{
              Alert.alert("Couldn't Reset Your Pet", "Please try again later, or report an issue.");
              console.error(`Error resetting pet: ${err}`)
            });
          }
        }}
        onCancel={()=>{}}
        text="Resetting your pet will delete any progress you have made!"
        />
      <BaseModal isVisible={modalVisibility.version} title="App Info" onClose={()=>closeModal("version")}>
        <View style={{padding: 30}}>
          <ThemedText lightColor="#000" darkColor="#FFF">Version: {version}</ThemedText>
        </View>
      </BaseModal>

    </ThemedView>
  );

}
