import SettingsGroup from "@/src/components/settings/SettingsGroup";
import { ThemedView } from "@/src/components/ThemedView";
import { useRouter } from "expo-router";
import { ScrollView, Linking, View, Alert } from "react-native";
import TextInputModal from "@/src/components/modals/TextInputModal";
import { useEffect, useState } from "react";
import ConfirmModal from "@/src/components/modals/ConfirmModal";
import BaseModal from "@/src/components/modals/BaseModal";
import { auth, db } from "@/src/config/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { validateUsername } from "@/src/functions/validation";
import { useAuth } from "@/src/hooks/useAuth";
import { ThemedText } from "@/src/components/ThemedText";
import { useThemeColor } from "@/src/hooks/useThemeColor";
import { Colors } from "@/src/constants/Colors";

export default function SettingsScreen() {
  const version = "0.0.0";
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const {userState} = useAuth();
  const userdoc = doc(
    db,
    'users',
    userState.uid
  );

  useEffect(() => {
    getDoc( userdoc ).then((doc) => {
      setUsername(doc.get("username"));
    });
  }, [router, userdoc]);

  const _modalVisibility = {
    "username": false,
    "reset": false,
    "version": false,
  }
  const [modalVisibility, setVisibility] = useState(_modalVisibility);


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
              signOut( auth ).then(() => {
              });
            },
            color: useThemeColor({light: Colors.red, dark: Colors.lightred}, "text" )
          },
          {
            title: "Reset Pet",
            action: () => {
              openModal("reset")
            },
            color: useThemeColor({light: Colors.red, dark: Colors.lightred}, "text" )
          },
        ]}/>
      </ScrollView>

      <TextInputModal
        isVisible={modalVisibility.username}
        title="Change Username"
        defaultValue={username}
        onClose={()=>closeModal("username")}
        onConfirm={(inputText)=>{
          updateDoc(userdoc, {"username": inputText}).then(()=>{
            setUsername(inputText);
          }).catch((err)=>{
            Alert.alert("Couldn't Change Username", "Please try again later, or report an issue.");
            console.error(`Error setting Username: ${err}`)
          })
        }}
        validation={validateUsername}
        />
      <ConfirmModal
        isVisible={modalVisibility.reset}
        onClose={()=>closeModal("reset")}
        onConfirm={()=>{
          setDoc(userdoc, {
            "current_level": 0,
            "current_xp": 0,
            "financial_goals": [],
            "pet_name": "",
          }).then(()=>{
            router.navigate("/welcome")
          }).catch((err)=>{
            Alert.alert("Couldn't Reset Your Pet", "Please try again later, or report an issue.");
            console.error(`Error resetting pet: ${err}`)
          });
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
