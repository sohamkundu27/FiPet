/**
 * This file defines the QuestProvider which provides subsequent pages with information about a single quest.
 *
 * FEATURES:
 * Uses Firebase quests with real-time questID support
 * Firebase integration for quest completion tracking
 * Real-time user progress synchronization
 * XP tracking and persistence
 *
 * NOTES:
 * I considered whether or not to make the instance of this provider provide multiple quests,
 * but I decided I'd keep it simple for now. This could be a possible change in the future,
 * mainly if /quests/index.tsx wants to use information from this component.
 */
import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { UserQuest, UserQuestInterface } from "../services/quest/UserQuest";
import { db } from '../config/firebase';
import { useAuth } from "../hooks/useRequiresAuth";

/**
 * The type that useQuest returns.
 */
type QuestContextType = {
  loading: boolean,
  error: string | null,
  quest: UserQuestInterface | null,
};

export const QuestContext = React.createContext<QuestContextType>(null!);

export const QuestProvider = ({ children, questID }: { children: any, questID: string }) => {
  const [quest, setQuest] = useState<UserQuest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch quest and questions on mount
  useEffect(() => {
    UserQuest.fromFirebaseId(db, questID, user, true, true).then((quest) => {
      setQuest(quest);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setError("Failed to load quest!");
      setLoading(false);
    });
  }, [user, questID]);

  // Always render the children and provide loading state through context
  // This allows individual pages to handle loading states while keeping navigation intact
  return (
    <QuestContext.Provider value={{ 
      loading,
      error,
      quest,
    }}>
      {children}
    </QuestContext.Provider>
  );
};
