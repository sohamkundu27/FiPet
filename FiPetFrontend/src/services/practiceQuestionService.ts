import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where } from '@firebase/firestore';
import { db } from '../config/firebase';
import { PracticeQuestion } from '../types/quest';

const PRACTICE_QUESTION_COLLECTION = 'practiceQuestions';

// Convert PracticeQuestion to Firestore document format
const practiceQuestionToDocument = (practiceQuestion: PracticeQuestion): Omit<PracticeQuestion, 'id'> => {
  return {
    options: practiceQuestion.options,
    correctAnswers: practiceQuestion.correctAnswers,
    type: practiceQuestion.type,
    prompt: practiceQuestion.prompt,
    feedback: practiceQuestion.feedback,
    incorrectResponse: practiceQuestion.incorrectResponse
  };
};

// Convert Firestore document to PracticeQuestion
const documentToPracticeQuestion = (doc: any): PracticeQuestion => {
  return {
    id: doc.id,
    options: doc.options,
    correctAnswers: doc.correctAnswers,
    type: doc.type,
    prompt: doc.prompt,
    feedback: doc.feedback,
    incorrectResponse: doc.incorrectResponse
  };
};

// Get practice question by ID
export const getPracticeQuestionById = async (id: string): Promise<PracticeQuestion | null> => {
  console.log('PracticeQuestionService: Fetching practice question with ID:', id);
  const practiceQuestionRef = doc(db, PRACTICE_QUESTION_COLLECTION, id);
  const practiceQuestionDoc = await getDoc(practiceQuestionRef);
  console.log('PracticeQuestionService: Document exists:', practiceQuestionDoc.exists());
  if (!practiceQuestionDoc.exists()) {
    console.log('PracticeQuestionService: Document does not exist');
    return null;
  }
  const data = practiceQuestionDoc.data();
  console.log('PracticeQuestionService: Document data:', data);
  return documentToPracticeQuestion({ id: practiceQuestionDoc.id, ...data });
};

// Get practice questions by IDs
export const getPracticeQuestionsByIds = async (ids: string[]): Promise<PracticeQuestion[]> => {
  if (ids.length === 0) return [];
  
  const practiceQuestions: PracticeQuestion[] = [];
  for (const id of ids) {
    const practiceQuestion = await getPracticeQuestionById(id);
    if (practiceQuestion) {
      practiceQuestions.push(practiceQuestion);
    }
  }
  return practiceQuestions;
};

// Get all practice questions
export const getAllPracticeQuestions = async (): Promise<PracticeQuestion[]> => {
  const practiceQuestionsRef = collection(db, PRACTICE_QUESTION_COLLECTION);
  const snapshot = await getDocs(practiceQuestionsRef);
  return snapshot.docs.map(doc => documentToPracticeQuestion({ id: doc.id, ...doc.data() }));
};

// Create new practice question
export const createPracticeQuestion = async (practiceQuestion: Omit<PracticeQuestion, 'id'>): Promise<PracticeQuestion> => {
  const practiceQuestionsRef = collection(db, PRACTICE_QUESTION_COLLECTION);
  const docRef = await addDoc(practiceQuestionsRef, practiceQuestionToDocument(practiceQuestion as PracticeQuestion));
  return {
    ...practiceQuestion,
    id: docRef.id
  } as PracticeQuestion;
};

// Update practice question
export const updatePracticeQuestion = async (id: string, practiceQuestion: Partial<PracticeQuestion>): Promise<void> => {
  const practiceQuestionRef = doc(db, PRACTICE_QUESTION_COLLECTION, id);
  const updateData = practiceQuestionToDocument(practiceQuestion as PracticeQuestion);
  await updateDoc(practiceQuestionRef, updateData);
};

// Delete practice question
export const deletePracticeQuestion = async (id: string): Promise<void> => {
  const practiceQuestionRef = doc(db, PRACTICE_QUESTION_COLLECTION, id);
  await deleteDoc(practiceQuestionRef);
}; 