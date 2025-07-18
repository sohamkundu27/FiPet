import { Timestamp } from "@firebase/firestore";
import { ItemId } from "./item";

export const QUEST_COLLECTION = 'quests';
export const QUEST_COMPLETION_COLLECTION = 'questCompletion';
export const QUESTIONS_COLLECTION = 'questions';
export const ANSWER_COLLECTION = 'questAnswers';
export const OPTIONS_COLLECTION = 'options';
export const READING_COLLECTION = 'preQuestReadings';

export type QuestionTypeWithSingleOption = "singleSelect";
export type QuestionTypeWithMultipleOptions = never;
export type QuestionTypeWithOptions = QuestionTypeWithSingleOption | QuestionTypeWithMultipleOptions;
export type QuestionType = QuestionTypeWithOptions;
export type QuestTopic = "opportunity cost";

export type QuestId = string;
export type PreQuestReadingId = string;
export type QuestionId = string;
export type SingleSelectOptionId = string;
export type OptionId = {
  [K in QuestionType]: string;
};

export interface PracticeQuestion {
  id: string;
  options: string[];
  correctAnswers: string[];
  type: string;
  prompt: string;
  feedback: {
    correct: string;
    incorrect: string;
  };
  incorrectResponse?: string;
}

export interface PreQuestReadingPage {
  top: string;
  bottom: string;
}

export interface PreQuestReading {
  id: string,
  [key: `page${number}`]: PreQuestReadingPage,
  [key: `p${number}`]: PreQuestReadingPage,
  pages: PreQuestReadingPage[]
}

export interface Quest {
  id: string;
  description: string;
  descriptions?: string[];
  duration: string;
  level: number;
  order: number;
  questionIds: string[];
  title: string;
  topic: string;
  xpReward: number;
  coinReward?: number;
  preQuest?: string;
}


