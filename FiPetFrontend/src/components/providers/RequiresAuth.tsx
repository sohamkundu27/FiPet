import { useAuth } from "@/src/hooks/useAuth";
import { Auth, User } from "@firebase/auth";
import { Redirect } from "expo-router";
import { createContext } from "react";

type RequiresAuthContextType = {
  auth: Auth,
  user: User,
};

export const RequiresAuthContext = createContext<RequiresAuthContextType>(null!);

export const RequiresAuth = ({ children }: { children: any }) => {

  const {user, auth} = useAuth();

  if ( !user || !auth ) {
    return (
      <Redirect href="/login"/>
    );
  }

  return (
    <RequiresAuthContext.Provider value={{ user: user, auth: auth }}>
      {children}
    </RequiresAuthContext.Provider>
  );
}
