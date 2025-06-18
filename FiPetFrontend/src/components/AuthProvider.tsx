import LoginScreen from "@/app/login";
import { auth } from "@/src/config/firebase";
import { useRouter } from "expo-router";
import { Auth, User } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { Text, View } from "react-native";

type AuthContextType = {
  userState: User,
  authState: Auth,
  ready: boolean,
};

export const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: any }) => {

  const [userState, setUser] = useState<User|null>(null);
  const [authState, setAuth] = useState<Auth|null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    auth.authStateReady().then(()=>{
      setAuth(auth);
      setReady(true);
    }).catch(()=>{
      setReady(true);
    });

    let unsubscribe = auth.onAuthStateChanged((user) => {
      if ( ! user ) {
        router.navigate("/login");
        return;
      }
      setUser(user);
    });

    return unsubscribe;
  }, [router]);

  if ( ! ready ) {
    return (
      <View><Text>Loading...</Text></View>
    );
  }

  if ( !userState || !authState ) {
    return (
      <LoginScreen/>
    );
  }

  return (
    <AuthContext.Provider value={{ userState, authState, ready }}>
      {children}
    </AuthContext.Provider>
  );
}
