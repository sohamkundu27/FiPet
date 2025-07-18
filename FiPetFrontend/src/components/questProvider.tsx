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
import { Quest, UserQuestInterface } from "../services/quest/Quest";
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { Question } from "../services/quest/Question";

// Extended Question type for internal use with option objects
export interface ExtendedQuestion extends Question {
  optionObjects: Array<{
    id: string;
    text: string;
    nextQuestionId?: string;
    outcomeId?: string;
  }>;
}

// Simple outcome type
interface SimpleOutcome {
  id: string;
  text: string;
  xpReward: number;
  isCorrectAnswer: boolean;
}

/**
 * Helper types for saving answers in memory.
 */
export type QuestAnswer = {
  option: { id: string; text: string };
  outcome: SimpleOutcome;
  nextQuestion: ExtendedQuestion | null;
};

type QuestAnswerDict = {
  [key: string]: QuestAnswer
};

/***** Function types. ******/
/**
 * Returns the furthest question the user has reached in the quest.
 *
 * @throws {Error} if the quest is completed.
 */
type getFurthestQuestionFunType = () => ExtendedQuestion;

/**
 * Checks if the quest is complete.
 */
type isCompleteFunType = () => boolean;

/**
 * Gets a question from the quest and returns false on failure.
 *
 * @throws {Error} if question doesn't exist in the quest.
 */
type getQuestionFunType = ( questionID: string ) => ExtendedQuestion;

/**
 * Gets the options for a question.
 *
 * @throws {Error} if the question doesn't exist in the quest.
 */
type getOptionsFunType = ( question: ExtendedQuestion ) => Array<{ id: string; text: string }>;

/**
 * Selects an option given for the current quest question. Marks the current question as answered.
 *
 * @param {string} questionID is the id of the question being answered.
 * @param {string} optionID is the id of the option selected.
 *
 * @throws {Error} if the question does not exist in the quest.
 * @throws {Error} if the option does not exist in the question.
 *
 * @returns the outcome object and the next question if there is a next question.
 */
type selectOptionFunType = ( questionID: string, optionID: string) => Promise<QuestAnswer>;

/**
 * Gets the current answer to the question or false if it hasn't been answered.
 *
 * @throws {Error} if question hasn't been answered.
 *
 * @see hasAnswer
 */
type getAnswerFunType = ( question: ExtendedQuestion ) => QuestAnswer;

/**
 * Determines if a question has an answer.
 *
 * @see getAnswer
 */
type hasAnswerFunType = ( question: ExtendedQuestion ) => boolean;

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
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch quest and questions on mount
  useEffect(() => {
    Quest.fromFirebaseId(db, questID, true, true, user.uid)
      .then((quest) => {
        setQuest(quest);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load quest!");
        setLoading(false);
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
