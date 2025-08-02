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
    });
  }, [user, questID]);

  // Show loading or error state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Loading quest...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: 'red', textAlign: 'center' }}>Error: {error}</Text>
      </View>
    );
  }

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
