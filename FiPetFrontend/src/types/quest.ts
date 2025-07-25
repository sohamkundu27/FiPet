import { Timestamp } from "@firebase/firestore";
import { ItemId } from "./item";

export const QUEST_COLLECTION = 'quests2';
export const QUEST_COMPLETION_COLLECTION = 'questCompletion2';
export const QUESTIONS_COLLECTION = 'questions2';
export const ANSWER_COLLECTION = 'questAnswers2';
export const OPTIONS_COLLECTION = 'options2';
export const READING_COLLECTION = 'preQuestReadings2';

export type QuestionTypeWithSingleOption = "singleSelect";
export type QuestionTypeWithMultipleOptions = never;
export type QuestionTypeWithOptions = QuestionTypeWithSingleOption | QuestionTypeWithMultipleOptions;
export type QuestionType = QuestionTypeWithOptions;
export type QuestTopic = "Opportunity Cost" | "Budgeting";

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
  id: QuestId,
  questId: QuestId,
  completedAt: Timestamp,
  reward: Reward,
};

export type DBQuestAnswer<T extends QuestionType> = {
  id: string,
  questId: QuestId|null,
  questionId: QuestionId,
  order: number,
  answeredAt: Timestamp,
  correct: boolean,
  correctOptionId: OptionId[T],
  selectedOptionId: OptionId[T],
  reward: Reward|null,
};

type DB_JSON_QuestionOptions<T extends QuestionType, K extends undefined|string> =
{
  baseFeedback: K,
} &
(
  T extends QuestionTypeWithMultipleOptions ? (
    K extends string ? {
      options: Omit<DBOption<T>, "id"|"questionId"|"type"|"correct"|"feedback">[],
    } : {
      options: (Omit<DBOption<T>, "id"|"questionId"|"type"|"correct"|"feedback"> & {
        feedback: string,
      })[],
    }
) : T extends QuestionTypeWithSingleOption ? (
    K extends string ? {
      correctOption: Omit<DBOption<T>, "id"|"questionId"|"type"|"correct">,
      options: Omit<DBOption<T>, "id"|"questionId"|"type"|"correct"|"feedback">[],
    } : {
      correctOption: Omit<DBOption<T>, "id"|"questionId"|"type"|"correct">,
      options: (Omit<DBOption<T>, "id"|"questionId"|"type"|"correct"|"feedback"> & {
        feedback: string,
      })[],
    }
  ): never
);

export type DB_JSON_PracticeQuestion<T extends QuestionType, K extends undefined|string> =
  Omit<DBPracticeQuestion<T>, "id"|"questId"|"order"|"isPractice"|"practiceFor"|"reward"> &
  DB_JSON_QuestionOptions<T,K> &
  {reward?: Reward};

export function createPracticeQuestionJSON<T extends QuestionType, K extends undefined|string>(
  json: DB_JSON_PracticeQuestion<T,K>
): DB_JSON_PracticeQuestion<T,K> {
  return json;
}

export type DB_JSON_Question<T extends QuestionType, K extends undefined|string> =
  Omit<DBNormalQuestion<T>, "id"|"questId"|"order"|"isPractice"|"practiceFor"|"reward"> &
  {
    reward?: Reward,
    practiceQuestion?: DB_JSON_PracticeQuestion<QuestionType, undefined|string>,
  } &
  DB_JSON_QuestionOptions<T,K>;

export function createQuestionJSON<T extends QuestionType, K extends undefined|string>(
  json: DB_JSON_Question<T,K>
): DB_JSON_Question<T,K> {
  return json;
}

export type DB_JSON_Starter = {
  quests: (Omit<DBQuest, "id"|"deleted"> & {
    questions: DB_JSON_Question<QuestionType, undefined|string>[],
    readings: (Omit<DBPreQuestReading, "id"|"questId"|"order"|"image"> & {image?: string})[]
  })[],
}
