import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, Query } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import type { CloudQuery, DBOption, QuestionType } from "types/quest";
import * as logger from "firebase-functions/logger";

const OPTIONS_COLLECTION = 'options2';

function deleteFields<T extends object, K extends keyof T>(
  object: T,
  ...fields: K[]
): Omit<T, K> {
  const copy = { ...object };
  for (const field of fields) {
    delete copy[field];
  }
  return copy;
}

export const loadOption = onRequest({ maxInstances: 10 }, async (req, res) => {
  // Check if user is authenticated via Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: "Unauthorized - Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  // Verify the Firebase ID token and get the user ID
  try {
//     await getAuth().verifyIdToken(token);
  } catch {
    res.status(401).json({ error: "Invalid authentication token" });
    return;
  }
  
  const {questionId} = JSON.parse(req.body);

  if (!questionId) {
    res.status(400).json({ error: "Missing required parameter: questionId" });
    return;
  }

  try {
    const db = getFirestore();
    
    // Get the quest data
    const optionDoc = await db.
      collection(OPTIONS_COLLECTION).
      doc(questionId).
      get();

    if (!optionDoc.exists) {
      res.status(404).json({ error: "Question not found" });
      return;
    }

    const _option = optionDoc.data() as DBOption<QuestionType>;
    const option = deleteFields(_option, "correct");

    res.json(option);

  } catch (error) {
    logger.error("Error completing quest:", error);
    res.status(500).json({ error: "Failed to complete quest" });
  }
}); 

export const loadOptions = onRequest({ maxInstances: 10 }, async (req, res) => {
  // Check if user is authenticated via Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: "Unauthorized - Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  // Verify the Firebase ID token and get the user ID
  try {
  //   await getAuth().verifyIdToken(token);
  } catch {
    res.status(401).json({ error: "Invalid authentication token" });
    return;
  }
  
  const query: CloudQuery = JSON.parse(req.body);

  try {
    const db = getFirestore();
    let optionsRef: Query = db.collection(OPTIONS_COLLECTION);
    if (query.limit) {
      optionsRef = optionsRef.limit(query.limit);
    }
    if (query.orderBy) {
      optionsRef = optionsRef.orderBy(query.orderBy);
    }
    if (query.where) {
      for (let clause of query.where) {
        optionsRef = optionsRef.where(clause.field, clause.op, clause.value);
      }
    }
    
    const optionsSnap = await optionsRef.get();
    const options = optionsSnap.docs.map((optionDoc) => {
      const option = optionDoc.data() as DBOption<QuestionType>;
      return deleteFields(option, "correct")
    });

    res.json(options);

  } catch (error) {
    logger.error("Error completing quest:", error);
    res.status(500).json({ error: "Failed to complete quest" });
  }
}); 
