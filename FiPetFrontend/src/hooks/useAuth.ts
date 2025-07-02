import { useContext } from "react";
import { AuthContext } from "@/src/components/providers/AuthProvider";

export const useAuth = () => useContext(AuthContext);
