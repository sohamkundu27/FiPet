import { auth } from "@/src/config/firebase";
import { Auth, User } from "@firebase/auth";
import { createContext, useEffect, useState } from "react";

type AuthContextType = {
  auth: Auth|null,
  user: User|null,
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
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user: userState, auth: authState, ready }}>
      {children}
    </AuthContext.Provider>
  );
}
