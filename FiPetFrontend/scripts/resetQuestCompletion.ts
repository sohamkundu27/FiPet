import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { createInterface } from "node:readline";
import { ANSWER_COLLECTION, QUEST_COMPLETION_COLLECTION } from "@/src/types/quest";

// Initialize Firebase
const app = initializeApp({
  credential: cert("./serviceAccountKey.json")
});

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const auth = getAuth(app);

async function resetQuestCompletion() {

  const ux = createInterface(process.stdin, process.stdout);
  ux.question("Enter your account email: ", (email) => {

    ux.write("Loading account...");
    const deleteBatch = db.batch();
    auth.getUserByEmail(email).then(async (user) => {
      ux.write("Done\nLoading documents...");
      const answerDocs = await db.collection("users").doc(user.uid).collection(ANSWER_COLLECTION).listDocuments();
      const completionDocs = await db.collection("users").doc(user.uid).collection(QUEST_COMPLETION_COLLECTION).listDocuments();
      ux.write(`Done\nDeleting ${answerDocs.length + completionDocs.length} documents...`);
      answerDocs.forEach((doc) => {
        deleteBatch.delete(doc);
      });
      completionDocs.forEach((doc) => {
        deleteBatch.delete(doc);
      });
      await deleteBatch.commit();
      ux.write("Done");
      console.log("")
      process.exit();
    });
  });
}

resetQuestCompletion();