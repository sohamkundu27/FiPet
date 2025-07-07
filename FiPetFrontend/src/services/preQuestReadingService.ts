import { doc, getDoc, setDoc, updateDoc, collection } from '@firebase/firestore';
import { db } from '../config/firebase';
import { PreQuestReading } from '../types/quest';

const PRE_QUEST_READING_COLLECTION = 'preQuestReadings';

export const getPreQuestReadingById = async (id: string): Promise<PreQuestReading | null> => {
  const preQuestRef = doc(db, PRE_QUEST_READING_COLLECTION, id);
  const preQuestDoc = await getDoc(preQuestRef);
  if (!preQuestDoc.exists()) return null;
  return { id: preQuestDoc.id, ...preQuestDoc.data() } as PreQuestReading;
};

// Create a new preQuest reading with image URLs
export const createPreQuestReading = async (preQuestData: Omit<PreQuestReading, 'id'>): Promise<PreQuestReading> => {
  const preQuestRef = doc(collection(db, PRE_QUEST_READING_COLLECTION));
  await setDoc(preQuestRef, preQuestData);
  return { id: preQuestRef.id, ...preQuestData } as PreQuestReading;
};

// Update an existing preQuest reading with image URLs
export const updatePreQuestReading = async (id: string, updates: Partial<PreQuestReading>): Promise<void> => {
  const preQuestRef = doc(db, PRE_QUEST_READING_COLLECTION, id);
  await updateDoc(preQuestRef, updates);
};

// Helper function to add image URLs to existing preQuest readings
export const addImageUrlsToPreQuest = async (
  id: string, 
  imageUrls: {
    page1?: string;
    page2?: string;
    page3?: string;
    page4?: string;
  }
): Promise<void> => {
  const preQuestRef = doc(db, PRE_QUEST_READING_COLLECTION, id);
  const preQuestDoc = await getDoc(preQuestRef);
  
  if (!preQuestDoc.exists()) {
    throw new Error(`PreQuest reading with ID ${id} not found`);
  }
  
  const currentData = preQuestDoc.data();
  const updates: any = {};
  
  // Update each page with image URL if provided
  Object.keys(imageUrls).forEach(pageKey => {
    const pageData = currentData[pageKey];
    if (pageData && imageUrls[pageKey as keyof typeof imageUrls]) {
      updates[`${pageKey}.imageUrl`] = imageUrls[pageKey as keyof typeof imageUrls];
    }
  });
  
  if (Object.keys(updates).length > 0) {
    await updateDoc(preQuestRef, updates);
  }
}; 