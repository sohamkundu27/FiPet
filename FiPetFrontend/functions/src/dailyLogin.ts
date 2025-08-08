import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import * as logger from "firebase-functions/logger";

export const dailyLogin = onRequest({ maxInstances: 10 }, async (req, res) => {
  // Check for Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized - Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];

  // Verify Firebase ID token
  let userId: string;
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    userId = decodedToken.uid;
  } catch (error) {
    res.status(401).json({ error: "Invalid authentication token" });
    return;
  }

  const db = getFirestore();
  const userRef = db.collection("users").doc(userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const userData = userSnap.data();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastLoginTimestamp = userData?.last_date_logged_in?.toDate?.() ?? null;
  const lastLoginDate = lastLoginTimestamp
    ? new Date(lastLoginTimestamp.getFullYear(), lastLoginTimestamp.getMonth(), lastLoginTimestamp.getDate())
    : null;

  let moodChange = 0;

  if (!lastLoginDate || lastLoginDate.getTime() !== today.getTime()) {
    // First login today
    moodChange = 5;

    // Calculate missed days
    if (lastLoginDate) {
      const diffDays = Math.floor((today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        moodChange -= 5;
      } else if (diffDays > 1) {
        moodChange -= 10 * diffDays;
      }
    }

    // Update mood, last login, and store first login status
    const newMood = Math.max(0, Math.min(100, (userData?.pet_mood ?? 50) + moodChange));
    await userRef.update({
      pet_mood: newMood,
      last_date_logged_in: FieldValue.serverTimestamp(),
      last_login_was_first: true,
    });

    logger.info(`User ${userId} first login today. Mood change: ${moodChange}, new mood: ${newMood}`);
    res.json({ firstLoginToday: true, mood: newMood });
  } else {
    // Already logged in today
    await userRef.update({
      last_login_was_first: false,
    });
    logger.info(`User ${userId} already logged in today.`);
    res.json({ firstLoginToday: false, mood: userData?.pet_mood ?? 50 });
    }
});