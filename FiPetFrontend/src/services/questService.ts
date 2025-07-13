import { collection, doc, getDocs, getDoc } from '@firebase/firestore';
import { db } from '../config/firebase';
import { Quest, Question } from '../types/quest';
import { getQuestionsByIds } from './questionService';

const QUEST_COLLECTION = 'quests';

// Convert Firestore document to Quest
const documentToQuest = (doc: Quest): Quest => {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    descriptions: doc.descriptions,
    duration: doc.duration,
    level: doc.level,
    order: doc.order,
    questionIds: doc.questionIds,
    topic: doc.topic,
    xpReward: doc.xpReward,
    coinReward: doc.coinReward,
    preQuest: doc.preQuest, 
  };
};

// Get quest with questions
export const getQuestWithQuestions = async (id: string): Promise<{ quest: Quest; questions: Question[] } | null> => {
  const quest = await getQuestById(id);
  if (!quest) return null;
  
  const questions = await getQuestionsByIds(quest.questionIds);
  return { quest, questions };
};

// Get all quests with their questions
export const getAllQuestsWithQuestions = async (): Promise<{ quest: Quest; questions: Question[] }[]> => {
  const quests = await getAllQuests();
  const questsWithQuestions = await Promise.all(
    quests.map(async (quest) => {
      const questions = await getQuestionsByIds(quest.questionIds);
      return { quest, questions };
    })
  );
  return questsWithQuestions;
};

// Get all quests
export const getAllQuests = async (): Promise<Quest[]> => {
  const questsRef = collection(db, QUEST_COLLECTION);
  const snapshot = await getDocs(questsRef);
  return snapshot.docs.map(doc => documentToQuest({ id: doc.id, ...doc.data() } as Quest));
};

// Get quest by ID
export const getQuestById = async (id: string): Promise<Quest | null> => {
  const questRef = doc(db, QUEST_COLLECTION, id);
  const questDoc = await getDoc(questRef);
  if (!questDoc.exists()) return null;
  return documentToQuest({ id: questDoc.id, ...questDoc.data() } as Quest);
}; 
