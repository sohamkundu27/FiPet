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
  id: 'quest-lost-relic',
  title: 'The Lost Relic of Andaros',
  description: 'Recover the ancient relic stolen from the village temple by bandits who fled into the Whispering Woods.',
  scroll: `## Quest Briefing
The villagers of Andaros are in despair. Their sacred relic has been taken by a group of bandits. Venture into the forest, uncover clues, and recover the relic.

**Reward:** XP, possible rare item drop.

**Be careful — each choice you make may bring you closer to the relic... or to danger.`,
  difficulty: 'medium',
  requiredLevel: 3,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  isCompleted: false,
  questions: [
    {
      id: 'q1',
      text: 'You arrive at the edge of the Whispering Woods. What do you do?',
      isCompleted: false,
      options: [
        { id: 'q1o1', text: 'Enter the woods cautiously.', outcomeId: 'out1', nextQuestionId: 'q2' },
        { id: 'q1o2', text: 'Set up camp and wait until morning.', outcomeId: 'out2' },
        { id: 'q1o3', text: 'Shout to alert the bandits.', outcomeId: 'out3' },
      ],
    },
    {
      id: 'q2',
      text: 'You find a fork in the path. One path is well-trodden, the other overgrown.',
      isCompleted: false,
      options: [
        { id: 'q2o1', text: 'Take the well-trodden path.', outcomeId: 'out4', nextQuestionId: 'q3' },
        { id: 'q2o2', text: 'Take the overgrown path.', outcomeId: 'out5', nextQuestionId: 'q3' },
        { id: 'q2o3', text: 'Return to the village.', outcomeId: 'out6' },
      ],
    },
    {
      id: 'q3',
      text: 'You encounter a wounded traveler who warns of traps ahead.',
      isCompleted: false,
      options: [
        { id: 'q3o1', text: 'Help him and ask for guidance.', outcomeId: 'out7', nextQuestionId: 'q4' },
        { id: 'q3o2', text: 'Ignore him and proceed.', outcomeId: 'out8', nextQuestionId: 'q4' },
        { id: 'q3o3', text: 'Threaten him to reveal more.', outcomeId: 'out9', nextQuestionId: 'q4' },
      ],
    },
    {
      id: 'q4',
      text: 'You spot a small cave entrance hidden by vines.',
      isCompleted: false,
      options: [
        { id: 'q4o1', text: 'Enter the cave.', outcomeId: 'out10', nextQuestionId: 'q5' },
        { id: 'q4o2', text: 'Set a trap outside and wait.', outcomeId: 'out11' },
        { id: 'q4o3', text: 'Light a fire to smoke them out.', outcomeId: 'out12', nextQuestionId: 'q5' },
        { id: 'q4o4', text: 'Keep moving past the cave.', outcomeId: 'out13' },
      ],
    },
    {
      id: 'q5',
      text: 'Inside, you find the relic guarded by a bandit captain.',
      isCompleted: false,
      options: [
        { id: 'q5o1', text: 'Fight the captain.', outcomeId: 'out14' },
        { id: 'q5o2', text: 'Try to negotiate.', outcomeId: 'out15' },
        { id: 'q5o3', text: 'Steal the relic while he sleeps.', outcomeId: 'out16' },
      ],
    },
  ],
  outcomes: [
    { id: 'out1', isCorrectAnswer: true, text: 'You move stealthily into the forest.', xpReward: 20 },
    { id: 'out2', isCorrectAnswer: true, text: 'You rest and recover energy, but lose time.', xpReward: 10 },
    { id: 'out3', isCorrectAnswer: true, text: 'Your shout alerts creatures of the forest. Bad idea.', xpReward: 0 },
    { id: 'out4', isCorrectAnswer: true, text: 'The path is clear but watched.', xpReward: 25 },
    { id: 'out5', isCorrectAnswer: true, text: 'You discover a hidden stash of bandit supplies!', xpReward: 40, itemReward: { id: 'item-bandit-map', name: 'Tattered Bandit Map', description: 'Shows a secret tunnel entrance.' }},
    { id: 'out6', isCorrectAnswer: true, text: 'You abandon the quest. The relic remains lost.', xpReward: 0 },
    { id: 'out7', isCorrectAnswer: true, text: 'The traveler shares a safe route and gives you an old dagger.', xpReward: 30, itemReward: { id: 'item-dagger', name: 'Rusty Dagger', description: 'Deals minor bonus damage to bandits.' }},
    { id: 'out8', isCorrectAnswer: true, text: 'You walk into a snare trap and lose health.', xpReward: 15 },
    { id: 'out9', isCorrectAnswer: true, text: 'He misleads you out of fear. You’re delayed.', xpReward: 5 },
    { id: 'out10', isCorrectAnswer: true, text: 'You enter unnoticed.', xpReward: 30 },
    { id: 'out11', isCorrectAnswer: true, text: 'You catch a lone scout. Useful intel!', xpReward: 35 },
    { id: 'out12', isCorrectAnswer: true, text: 'The smoke flushes out two bandits you subdue.', xpReward: 40 },
    { id: 'out13', isCorrectAnswer: true, text: 'You miss your only chance to retrieve the relic.', xpReward: 0 },
    { id: 'out14', isCorrectAnswer: true, text: 'You defeat the captain and reclaim the relic!', xpReward: 100, itemReward: { id: 'item-relic', name: 'Relic of Andaros', description: 'A sacred artifact of immense value.' }},
    { id: 'out15', isCorrectAnswer: true, text: 'You convince the captain to return the relic for a bribe.', xpReward: 70 },
    { id: 'out16', isCorrectAnswer: true, text: 'You sneak out with the relic without being seen.', xpReward: 80 },
  ]
};
