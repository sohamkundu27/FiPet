export interface Question {
  id: string;
  text: string;
  isCompleted: boolean;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  text: string;
  nextQuestionId?: string; // Optional, but if present it means that this option will lead to another question with a specifieid ID
  outcomeId: string;
}

export interface Outcome {
  id: string;
  text: string;
  xpReward: number;
  isCorrectAnswer: boolean;
  itemReward?: { // Optional field, only use if the outome gives the player an item
    id: string;
    name: string;
    description: string;
  };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  scroll: string; // Expected ot be in Markdown format
  difficulty: 'easy' | 'medium' | 'hard';
  requiredLevel: number;
  questions: Question[];
  outcomes: Outcome[];
  isActive: boolean;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Firestore document structure
export interface QuestDocument {
  id: string;
  title: string;
  description: string;
  scroll: string;
  difficulty: 'easy' | 'medium' | 'hard';
  requiredLevel: number;
  questions: {
    [key: string]: {
      id: string;
      text: string;
      isCompleted: boolean;
      options: {
        [key: string]: {
          id: string;
          text: string;
          nextQuestionId?: string;
          outcomeId: string;
        }
      }
    }
  };
  outcomes: {
    [key: string]: {
      id: string;
      text: string;
      xpReward: number;
      isCorrectAnswer: boolean;
      itemReward?: {
        id: string;
        name: string;
        description: string;
      }
    }
  };
  isActive: boolean;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Example quest data
export const exampleQuest: Quest = {
  id: 'quest-001',
  title: 'Title ex',
  description: 'description ex',
  scroll: 'scroll ex',
  difficulty: 'easy',
  requiredLevel: 1,
  questions: [
    {
      id: 'q1',
      text: 'Question ex',
      isCompleted: false,
      options: [
        {
          id: 'o1',
          text: 'Response ex',
          outcomeId: 'out1'
        },
        {
          id: 'o2',
          text: 'Alternative response ex',
          outcomeId: 'out2'
        }
      ]
    }
  ],
  outcomes: [
    {
      id: 'out1',
      text: 'You gain ancient knowledge!',
      xpReward: 50,
      isCorrectAnswer: true,
      itemReward: {
        id: 'item-001',
        name: 'name of item ex',
        description: 'description ex'
      }
    },
    {
      id: 'out2',
      text: 'You decide to leave the scroll untouched.',
      xpReward: 10,
      isCorrectAnswer: false
    }
  ],
  isActive: true,
  isCompleted: false,
  createdAt: new Date(),
  updatedAt: new Date()
}; 