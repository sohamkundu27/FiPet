import { getAllQuestsWithQuestions } from './questService';
import { getUserQuestProgress, QuestProgressSummary } from './userQuestProgressService';

export interface QuestWithProgress {
  quest: {
    id: string;
    title: string;
    description: string;
    descriptions?: string[];
    duration: string;
    level: number;
    order: number;
    topic: string;
    xpReward: number;
    coinReward?: number;
    preQuest?: string;
  };
  progress?: QuestProgressSummary;
  isCompleted: boolean;
  isStarted: boolean;
  isInProgress: boolean;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  progressPercentage: number;
}

// Get all quests with user progress
export const getAllQuestsWithUserProgress = async (userId: string): Promise<QuestWithProgress[]> => {
  try {
    // Get all quests with their questions
    const questsWithQuestions = await getAllQuestsWithQuestions();
    
    // Get user's quest progress
    const userProgress = await getUserQuestProgress(userId);
    
    // Create a map of quest progress for quick lookup
    const progressMap = new Map<string, QuestProgressSummary>();
    userProgress.forEach(progress => {
      progressMap.set(progress.questId, progress);
    });
    
    // Combine quests with their progress
    const questsWithProgress: QuestWithProgress[] = questsWithQuestions.map(({ quest, questions }) => {
      const progress = progressMap.get(quest.id);
      const isStarted = progress ? progress.isStarted : false;
      const isCompleted = progress ? progress.isCompleted : false;
      const isInProgress = isStarted && !isCompleted;
      
      return {
        quest: {
          id: quest.id,
          title: quest.title,
          description: quest.description,
          descriptions: quest.descriptions,
          duration: quest.duration,
          level: quest.level,
          order: quest.order,
          topic: quest.topic,
          xpReward: quest.xpReward,
          coinReward: quest.coinReward,
          preQuest: quest.preQuest
        },
        progress,
        isCompleted,
        isStarted,
        isInProgress,
        totalQuestions: questions.length,
        answeredQuestions: progress ? progress.answeredQuestions : 0,
        correctAnswers: progress ? progress.correctAnswers : 0,
        xpEarned: progress ? progress.xpEarned : 0,
        progressPercentage: questions.length > 0 ? (progress ? progress.answeredQuestions : 0) / questions.length * 100 : 0
      };
    });
    
    // Sort quests by level and order
    return questsWithProgress.sort((a, b) => {
      if (a.quest.level !== b.quest.level) {
        return a.quest.level - b.quest.level;
      }
      return a.quest.order - b.quest.order;
    });
  } catch (error) {
    console.error('Error getting quests with user progress:', error);
    return [];
  }
};

// Get the next available quest for a user
export const getNextAvailableQuest = async (userId: string): Promise<QuestWithProgress | null> => {
  const allQuests = await getAllQuestsWithUserProgress(userId);
  
  // Find the first quest that's not completed and starts with 'quest_'
  const nextQuest = allQuests.find(q => !q.isCompleted && q.quest.id.startsWith('quest_'));
  
  return nextQuest || null;
};

// Get current quest (in progress)
export const getCurrentQuest = async (userId: string): Promise<QuestWithProgress | null> => {
  const allQuests = await getAllQuestsWithUserProgress(userId);
  
  // Find the first quest that's in progress and starts with 'quest_'
  const currentQuest = allQuests.find(q => q.isInProgress && q.quest.id.startsWith('quest_'));
  
  return currentQuest || null;
}; 