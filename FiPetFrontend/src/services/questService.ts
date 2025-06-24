import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where } from '@firebase/firestore';
import { db } from '../config/firebase';
import { Quest, QuestDocument, Question } from '../types/quest';
import { getQuestionsByIds } from './questionService';

const QUEST_COLLECTION = 'quests';

// Convert Quest to Firestore document format
const questToDocument = (quest: Quest): Omit<QuestDocument, 'id'> => {
  return {
    title: quest.title,
    description: quest.description,
    duration: quest.duration,
    level: quest.level,
    order: quest.order,
    questionIds: quest.questionIds,
    topic: quest.topic,
    xpReward: quest.xpReward
  };
};

// Convert Firestore document to Quest
const documentToQuest = (doc: QuestDocument): Quest => {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    duration: doc.duration,
    level: doc.level,
    order: doc.order,
    questionIds: doc.questionIds,
    topic: doc.topic,
    xpReward: doc.xpReward
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
  return snapshot.docs.map(doc => documentToQuest({ id: doc.id, ...doc.data() } as QuestDocument));
};

// Get quest by ID
export const getQuestById = async (id: string): Promise<Quest | null> => {
  const questRef = doc(db, QUEST_COLLECTION, id);
  const questDoc = await getDoc(questRef);
  if (!questDoc.exists()) return null;
  return documentToQuest({ id: questDoc.id, ...questDoc.data() } as QuestDocument);
};

// Get quests by level
export const getQuestsByLevel = async (level: number): Promise<Quest[]> => {
  const questsRef = collection(db, QUEST_COLLECTION);
  const q = query(questsRef, where('level', '==', level));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => documentToQuest({ id: doc.id, ...doc.data() } as QuestDocument));
};

// Create new quest
export const createQuest = async (quest: Omit<Quest, 'id'>): Promise<Quest> => {
  const questsRef = collection(db, QUEST_COLLECTION);
  const docRef = await addDoc(questsRef, questToDocument(quest as Quest));
  return {
    ...quest,
    id: docRef.id
  } as Quest;
};

// Update quest
export const updateQuest = async (id: string, quest: Partial<Quest>): Promise<void> => {
  const questRef = doc(db, QUEST_COLLECTION, id);
  const updateData = questToDocument(quest as Quest);
  await updateDoc(questRef, updateData);
};

// Delete quest
export const deleteQuest = async (id: string): Promise<void> => {
  const questRef = doc(db, QUEST_COLLECTION, id);
  await deleteDoc(questRef);
}; 
