import { Timestamp } from "@firebase/firestore";
import { ItemId } from "./item";

<<<<<<< HEAD
export const QUEST_COLLECTION = 'quests2';
export const QUEST_COMPLETION_COLLECTION = 'questCompletion2';
export const QUESTIONS_COLLECTION = 'questions2';
export const ANSWER_COLLECTION = 'questAnswers2';
export const OPTIONS_COLLECTION = 'options2';
export const READING_COLLECTION = 'preQuestReadings2';
=======
export const QUEST_COLLECTION = 'quests';
export const QUEST_COMPLETION_COLLECTION = 'questCompletion';
export const QUESTIONS_COLLECTION = 'questions';
export const ANSWER_COLLECTION = 'questAnswers';
export const OPTIONS_COLLECTION = 'options';
export const READING_COLLECTION = 'preQuestReadings';
>>>>>>> 0332845 (Schema change)

export type QuestionTypeWithSingleOption = "singleSelect";
export type QuestionTypeWithMultipleOptions = never;
export type QuestionTypeWithOptions = QuestionTypeWithSingleOption | QuestionTypeWithMultipleOptions;
export type QuestionType = QuestionTypeWithOptions;
<<<<<<< HEAD
export type QuestTopic = "Opportunity Cost" | "Budgeting";
=======
export type QuestTopic = "opportunity cost";
>>>>>>> 0332845 (Schema change)

export type QuestId = string;
export type PreQuestReadingId = string;
export type QuestionId = string;
export type SingleSelectOptionId = string;
export type OptionId = {
  [K in QuestionType]: string;
};

export type Reward = {
  xp: number,
  coins: number,
  itemIds: ItemId[]
}

export type DBQuest = {
  id: QuestId,
  title: string,
  description: string,
  duration: number, // in minutes
  topics: QuestTopic[],
  reward: Reward,
  deleted: boolean,
};

export type DBPreQuestReading = {
  id: PreQuestReadingId,
  questId: QuestId,
  order: number,
  topText: string,
  bottomText: string,
  image: string|null,
}

type DBQuestionShapes = {
  singleSelect: {
    prompt: string,
  },
}

type DBQuestionBase<T extends QuestionType> = {
  id: QuestionId,
  type: T,
  prompt: string,
  reward: Reward|null,
}

export type DBNormalQuestion<T extends QuestionType> = DBQuestionBase<T> & DBQuestionShapes[T] & {
  isPractice: false,
  practiceFor: null|string,
  questId: QuestId|null,
  order: number, // Whole number.
};
export type DBPracticeQuestion<T extends QuestionType> = DBQuestionBase<T> & DBQuestionShapes[T] & {
  isPractice: true,
  practiceFor: null,
  questId: null,
  order: number, // Floating point. Whole part comes from 'practiceFor'.
};
export type DBQuestion<T extends QuestionType> = DBNormalQuestion<T> | DBPracticeQuestion<T>;


type DBOptionMap = {
  singleSelect: {
    text: string,
  }
};

type DBOptionShape<T extends QuestionTypeWithOptions> = DBOptionMap[T];

export type DBOption<T extends QuestionType> = {
  id: OptionId[T],
  questionId: QuestionId|null,
  type: T,
  feedback: string,
  correct: boolean,
} & DBOptionShape<T>;

export type DBQuestCompletion = {
<<<<<<< HEAD
  id: QuestId,
=======
>>>>>>> 0332845 (Schema change)
  questId: QuestId,
  completedAt: Timestamp,
  reward: Reward,
};

export type DBQuestAnswer<T extends QuestionType> = {
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


