import { collection, getFirestore, limit, query } from "@firebase/firestore";
import { initializeApp } from '@firebase/app';
import { Quest } from "@/src/services/quest/Quest";
import { createPracticeQuestionJSON, createQuestionJSON, QUEST_COLLECTION } from "@/src/types/quest";
import { PreQuestReading } from "@/src/services/quest/PreQuestReading";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDh1F64AeCS_xzkgATynBu4K4xOEIi1mns",
  authDomain: "fipet-521d1.firebaseapp.com",
  projectId: "fipet-521d1",
  storageBucket: "fipet-521d1.firebasestorage.app",
  messagingSenderId: "365751870741",
  appId: "1:365751870741:web:a0afa3d48256677627751c",
  measurementId: "G-S8BFBHYL8B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

async function create() {
  await Quest.createFromJSON(db, {
    quests: [
      {
        title: "Intro to Budgeting",
        description: "Understand the difference between spending and saving",
        topics: [],
        duration: 10,
        reward: {
          xp: 15,
          coins: 150,
          itemIds: [],
        },
        questions: [
          createQuestionJSON({
            type: "singleSelect",
            prompt:"What is the best description of opportunity cost?",
            baseFeedback: '"The value of what you give up when choosing one option over another," is an example of an opportunity cost because of X, and Y and also Z.',
            practiceQuestion: createPracticeQuestionJSON({
              type: "singleSelect",
              prompt: "You can go to a movie with friends or stay home and save your $15. If you go to the movie, what is your opportunity cost?",
              baseFeedback: "You chose the movie, so you missed out on saving. That's your opportunity cost.",
              correctOption: {
                text: "Staying home and saving money",
                feedback: "You chose the movie, so you missed out on saving. That's your opportunity cost.",
              },
              options: [
                {text: "The movie ticket"},
                {text: "The popcorn"},
                {text: "Your phone"},
              ],
            }),
            correctOption: {
              text: "The value of what you give up when choosing one option over another",
              feedback: '"The value of what you give up when choosing one option over another," is an example of an opportunity cost because of X, and Y and also Z.',
            },
            options: [
              {text: "The cost of losing money when you save it"},
              {text: "How much money you can earn by investing"},
              {text: "The price tag on an item"},
            ],
          })
        ],
        readings: [
          {
            topText: "It’s your 14th birthday🎉. Your phone buzzes - a $50 transfer from your uncle just hit your account.",
            bottomText: "Your FiPet jumps up excitedly. “Jackpot!” it squeaks.",
          }
        ]
      }
    ]
  });
  console.log("Done!");
}
async function test() {

  const _query = query(collection(db, QUEST_COLLECTION), limit(1));
  const quests = await Quest.fromFirebaseQuery(db, _query);
  console.log(quests[0]);
  const questions = quests[0].getQuestions();
  console.log(questions.toString());
  const question = questions[0];
  await quests[0].removeQuestion(question);
  console.log("question removed");
  await quests[0].addQuestion(question);
  console.log(questions.toString());
  await quests[0].addReading(
    await PreQuestReading.create(db, {
      bottomText: "test1",
      topText: "test1",
      image: null,
      questId: quests[0].id,
      order: 0,
    })
  );
  await quests[0].addReading(
    await PreQuestReading.create(db, {
      bottomText: "test2",
      topText: "test2",
      image: null,
      questId: quests[0].id,
      order: 0,
    }),
    0
  );
  await quests[0].addReading(
    await PreQuestReading.create(db, {
      bottomText: "test3",
      topText: "test3",
      image: null,
      questId: quests[0].id,
      order: 1,
    }),
    1
  );
  let readings = quests[0].getReadings();
  await quests[0].removeReading(readings[1]);
  await quests[0].removeReading(readings[0]);
  await quests[0].removeReading(readings[0]);
  console.log(readings);
}

create();
