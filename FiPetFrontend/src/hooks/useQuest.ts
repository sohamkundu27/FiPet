import { useContext } from "react";
import { QuestContext } from "../components/questProvider";

export const useQuest = () => useContext(QuestContext);
