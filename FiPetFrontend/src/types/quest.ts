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
}

export interface PreQuestReading {
  id: string;
  p1?: PreQuestReadingPage;
  p2?: PreQuestReadingPage;
  p3?: PreQuestReadingPage;
  p4?: PreQuestReadingPage;
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


