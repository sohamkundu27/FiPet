import { doc, getDoc, updateDoc } from '@firebase/firestore';
import { db } from '../config/firebase';
import { PreQuestReading } from '../types/quest';

const PRE_QUEST_READING_COLLECTION = 'preQuestReadings';

export const getPreQuestReadingById = async (id: string): Promise<PreQuestReading | null> => {
  const preQuestRef = doc(db, PRE_QUEST_READING_COLLECTION, id);
  const preQuestDoc = await getDoc(preQuestRef);
  if (!preQuestDoc.exists()) return null;
  return { id: preQuestDoc.id, ...preQuestDoc.data() } as PreQuestReading;
};

export const updatePreQuestReadingImages = async (
  id: string, 
  imageUrls: { page1?: string; page2?: string; page3?: string; page4?: string }
): Promise<void> => {
  const preQuestRef = doc(db, PRE_QUEST_READING_COLLECTION, id);
  
  const updateData: any = {};
  
  // Update each page with image URL if provided
  Object.entries(imageUrls).forEach(([page, imageUrl]) => {
    if (imageUrl) {
      updateData[`${page}.imageUrl`] = imageUrl;
    }
  });
  
  await updateDoc(preQuestRef, updateData);
}; 