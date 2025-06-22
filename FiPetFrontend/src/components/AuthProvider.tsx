import LoginScreen from "@/app/login";
import { auth } from "@/src/config/firebase";
import { useRouter } from "expo-router";
import { Auth, User } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { Text, View } from "react-native";

type AuthContextType = {
  userState: User | null,
  authState: Auth,
  ready: boolean,
};

export const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: any }) => {

  const [userState, setUser] = useState<User|null>(null);
  const [authState, setAuth] = useState<Auth|null>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    auth.authStateReady().then(()=>{
      setAuth(auth);
      setReady(true);
    }).catch(()=>{
      setReady(true);
    });

    let unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      // Don't automatically redirect - let the app handle navigation
    });

    return unsubscribe;
  }, []);

  if ( ! ready ) {
    return (
      <View><Text>Loading...</Text></View>
    );
  }

  // Only show LoginScreen if user is not authenticated and we're on a protected route
  // For now, let the app handle navigation naturally
  if ( !userState || !authState ) {
    return (
      <AuthContext.Provider value={{ userState: null, authState: auth, ready }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ userState, authState, ready }}>
      {children}
    </AuthContext.Provider>
  );
}
