import { RequiresAuthContext } from "@/src/components/providers/RequiresAuth";
import { useContext } from "react";

export const useAuth = () => useContext(RequiresAuthContext);
