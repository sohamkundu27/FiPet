// types.ts or quest.ts

export type QuestionType = "multipleChoice" | "trueFalse" | "regular"; 

export type QuestionOption = {
  id: string;
  text: string;
  image?: string; // Only used if question.type === "imageChoice"
};

export type Outcome = {
  text: string;
  xpReward: number;
  itemReward?: {
    name: string;
    description: string;
  };
};

export type QuestAnswer = {
  option: QuestionOption;
  outcome: Outcome;
  nextQuestion: Question | null;
};

export type Question = {
  id: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  // You can add more fields like image, hint, etc., if needed
};
