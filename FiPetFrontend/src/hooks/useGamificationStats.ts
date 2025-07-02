import { GamificationContext } from "../components/providers/GamificationProvider";
import { useContext } from "react";

export const useGamificationStats = () => {
  const context = useContext(GamificationContext)
  if ( context === null ) {
    throw "Gamification Context is null??";
  }
  return context;
};
