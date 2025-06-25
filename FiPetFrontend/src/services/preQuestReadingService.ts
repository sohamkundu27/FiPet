import { doc, getDoc } from '@firebase/firestore';
import { db } from '../config/firebase';
import { PreQuestReading } from '../types/quest';

const PRE_QUEST_READING_COLLECTION = 'preQuestReadings';

export const getPreQuestReadingById = async (id: string): Promise<PreQuestReading | null> => {
  const preQuestRef = doc(db, PRE_QUEST_READING_COLLECTION, id);
  const preQuestDoc = await getDoc(preQuestRef);
  if (!preQuestDoc.exists()) return null;
  return { id: preQuestDoc.id, ...preQuestDoc.data() } as PreQuestReading;
}; 