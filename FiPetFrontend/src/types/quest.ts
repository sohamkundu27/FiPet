export type QuestionType = "multiselect" | "trueFalse" | "regular"| "matching";

export interface Question {
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
  practiceId?: string;
}

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

export interface Quest {
  id: string;
  description: string;
  duration: string;
  level: number;
  order: number;
  questionIds: string[];
  title: string;
  topic: string;
  xpReward: number;
  
}

// Firestore document structure
export interface QuestDocument {
  id: string;
  description: string;
  duration: string;
  level: number;
  order: number;
  questionIds: string[];
  title: string;
  topic: string;
  xpReward: number;
}


