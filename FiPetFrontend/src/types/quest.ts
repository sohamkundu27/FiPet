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

export interface PreQuestReadingPage {
  top: string;
  bottom: string;
  imageUrl?: string;
}

export interface PreQuestReading {
  id: string;
  page1: PreQuestReadingPage;
  page2: PreQuestReadingPage;
  page3: PreQuestReadingPage;
  page4: PreQuestReadingPage;
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
  preQuest?: string;
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
  preQuest?: string;
}


