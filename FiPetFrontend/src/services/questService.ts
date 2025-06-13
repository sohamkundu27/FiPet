import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { Quest, QuestDocument } from '../types/quest';

const QUEST_COLLECTION = 'quests';

// Convert Quest to Firestore document format
const questToDocument = (quest: Quest): Omit<QuestDocument, 'id'> => {
  const questionsMap: QuestDocument['questions'] = {};
  quest.questions.forEach(q => {
    const optionsMap: { [key: string]: QuestDocument['questions'][string]['options'][string] } = {};
    q.options.forEach(o => {
      optionsMap[o.id] = {
        id: o.id,
        text: o.text,
        ...(o.nextQuestionId !== undefined && { nextQuestionId: o.nextQuestionId }),
        outcomeId: o.outcomeId
      };
    });
    questionsMap[q.id] = {
      id: q.id,
      text: q.text,
      isCompleted: q.isCompleted,
      options: optionsMap
    };
  });

  const outcomesMap: QuestDocument['outcomes'] = {};
  quest.outcomes.forEach(o => {
    outcomesMap[o.id] = {
      id: o.id,
      text: o.text,
      xpReward: o.xpReward,
      isCorrectAnswer: o.isCorrectAnswer,
      ...(o.itemReward !== undefined && { itemReward: o.itemReward })
    };
  });

  return {
    title: quest.title,
    description: quest.description,
    scroll: quest.scroll,
    difficulty: quest.difficulty,
    requiredLevel: quest.requiredLevel,
    questions: questionsMap,
    outcomes: outcomesMap,
    isActive: quest.isActive,
    isCompleted: quest.isCompleted,
    createdAt: quest.createdAt,
    updatedAt: quest.updatedAt
  };
};

// Convert Firestore document to Quest
const documentToQuest = (doc: QuestDocument): Quest => {
  const questions: Quest['questions'] = Object.values(doc.questions).map(q => ({
    id: q.id,
    text: q.text,
    isCompleted: q.isCompleted,
    options: Object.values(q.options).map(o => ({
      id: o.id,
      text: o.text,
      nextQuestionId: o.nextQuestionId,
      outcomeId: o.outcomeId
    }))
  }));

  const outcomes: Quest['outcomes'] = Object.values(doc.outcomes).map(o => ({
    id: o.id,
    text: o.text,
    xpReward: o.xpReward,
    isCorrectAnswer: o.isCorrectAnswer,
    itemReward: o.itemReward
  }));

  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    scroll: doc.scroll,
    difficulty: doc.difficulty,
    requiredLevel: doc.requiredLevel,
    questions,
    outcomes,
    isActive: doc.isActive,
    isCompleted: doc.isCompleted,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
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

// Get active quests
export const getActiveQuests = async (): Promise<Quest[]> => {
  const questsRef = collection(db, QUEST_COLLECTION);
  const q = query(questsRef, where('isActive', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => documentToQuest({ id: doc.id, ...doc.data() } as QuestDocument));
};

// Create new quest
export const createQuest = async (quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quest> => {
  const questsRef = collection(db, QUEST_COLLECTION);
  const now = new Date();
  const questData = {
    ...quest,
    createdAt: now,
    updatedAt: now
  };
  const docRef = await addDoc(questsRef, questToDocument(questData as Quest));
  return {
    ...questData,
    id: docRef.id
  } as Quest;
};

// Update quest
export const updateQuest = async (id: string, quest: Partial<Quest>): Promise<void> => {
  const questRef = doc(db, QUEST_COLLECTION, id);
  const updateData = {
    ...quest,
    updatedAt: new Date()
  };
  await updateDoc(questRef, questToDocument(updateData as Quest));
};

// Delete quest
export const deleteQuest = async (id: string): Promise<void> => {
  const questRef = doc(db, QUEST_COLLECTION, id);
  await deleteDoc(questRef);
}; 
