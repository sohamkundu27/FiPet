import { collection, connectFirestoreEmulator, getFirestore, limit, query } from "@firebase/firestore";
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
if (process.env.EXPO_PUBLIC_USE_EMULATOR === "true") {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

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
            correctOption: {
              text: "The value of what you give up when choosing one option over another",
              feedback: '"The value of what you give up when choosing one option over another," is an example of an opportunity cost because of X, and Y and also Z.',
            },
            options: [
              {text: "The cost of losing money when you save it"},
              {text: "How much money you can earn by investing"},
              {text: "The price tag on an item"},
            ],
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
          }),
          createQuestionJSON({
            type: "singleSelect",
            prompt: "You buy the hoodie now. What is your opportunity cost?",
            baseFeedback: `"Whatever you could've done with the $50 later," is your opportunity cost because of X, Y, and Z.`,
            correctOption: {
              text: "Whatever you could've done with the $50 later",
              feedback: `"Whatever you could've done with the $50 later," is your opportunity cost because of X, Y, and Z.`,
            },
            options: [
              {text: "Nothing, you got the hoodie"},
              {text: "The shipping fee"},
              {text: "The hoodie's price in the future"},
            ],
            practiceQuestion: createPracticeQuestionJSON({
              type: "singleSelect",
              prompt: "You spend $5 on a milkshake instead of saving it. What did you give up?",
              baseFeedback: "When you spend money now, you give up the chance to use it later. That's the cost of your choice.",
              correctOption: {
                text: "The chance to use that $5 later",
                feedback: "When you spend money now, you give up the chance to use it later. That's the cost of your choice.",
              },
              options: [
                {text: "The $5"},
                {text: "The milkshake"},
                {text: "The cup"},
              ],
            }),
          }),
          createQuestionJSON({
            type: "singleSelect",
            prompt: "Which of these is a long-term saving goal?",
            baseFeedback: `"Buying a video game next week," is a long-term saving goal because of X, Y, and Z.`,
            correctOption: {
              text: "Saving for a new bike in 3 months",
              feedback: `"Buying a video game next week," is a long-term saving goal because of X, Y, and Z.`,
            },
            options: [
              {text: "Buying candy tomorrow"},
              {text: "Buying a video game next week"},
              {text: "Getting lunch with friends this weekend"},
            ],
            practiceQuestion: createPracticeQuestionJSON({
              type: "singleSelect",
              prompt: "Which of these is a goal you can save for over time?",
              baseFeedback: "A scooter takes time to save for. That's a long-term goal. The other choices are things you can buy quickly.",
              correctOption: {
                text: "A scooter for your birthday",
                feedback: "A scooter takes time to save for. That's a long-term goal. The other choices are things you can buy quickly.",
              },
              options: [
                {text: "A pack of gum"},
                {text: "A soda after school"},
                {text: "A snack at lunch"},
              ],
            }),
          }),
          createQuestionJSON({
            type: "singleSelect",
            prompt: "If you save $10 a week, how many weeks until you hit $50?",
            baseFeedback: `It would take 5 weeks to save up $50 because 50/10 = 5.`,
            correctOption: {
              text: "5 weeks",
              feedback: 'It would take 5 weeks to save up $50 because 50/10 = 5.',
            },
            options: [
              {text: "2 weeks"},
              {text: "3 weeks"},
              {text: "4 weeks"},
            ],
            practiceQuestion: createPracticeQuestionJSON({
              type: "singleSelect",
              prompt: "If you save $5 a week, how  many weeks until you have $20?",
              baseFeedback: "5 + 5 + 5 + 5 = 20. That's four weeks!",
              correctOption: {
                text: "4 weeks",
                feedback: "5 + 5 + 5 + 5 = 20. That's four weeks!",
              },
              options: [
                {text: "2 weeks"},
                {text: "3 weeks"},
                {text: "5 weeks"},
              ],
            }),
          }),
          createQuestionJSON({
            type: "singleSelect",
            prompt: "Your FiPet gets excited when you save money. What happens if you build a streak of 3 smart savings decisions?",
            baseFeedback: `The correct answer is correct because of X, Y, and Z.`,
            correctOption: {
              text: "You get a FiPet upgrade",
              feedback: 'The correct answer is correct because of X, Y, and Z.',
            },
            options: [
              {text: "You lose coins"},
              {text: "Your FiPet leaves"},
              {text: "You have to start over"},
            ],
            practiceQuestion: createPracticeQuestionJSON({
              type: "singleSelect",
              prompt: "Your FiPet cheers when you make smart choices with your money. What do you think happns if you make three good decisions in a row?",
              baseFeedback: "Saving smoothly makes your FiPet happy and helps you level up or unlock fun features. That's your reward!",
              correctOption: {
                text: "You unlock something fun",
                feedback: "Saving smoothly makes your FiPet happy and helps you level up or unlock fun features. That's your reward!",
              },
              options: [
                {text: "You lose a life"},
                {text: "The app restarts"},
                {text: "You lose your coins"},
              ],
            }),
          }),
        ],
        readings: [
          {
            topText: "It’s your 14th birthday🎉. Your phone buzzes - a $50 transfer from your uncle just hit your account.",
            bottomText: "Your FiPet jumps up excitedly. “Jackpot!” it squeaks.",
          },
          {
            topText: "You've been talking about getting a new hoodie forever - and now it's finally on sale. $59, ust one click away. You open the site. It's fire.",
            bottomText: "The exact hoodie your favorite creator wore last week. You imagine wearing it to shcool on Monday.",
          },
          {
            topText: `But Your FiPet Pauses. "Hey... before we blow it all, think about this..."`,
            bottomText: `"...what if we save it instead? You've been talking about that new bike - or a phone upgrade. You're halfway there already."`,
          },
          {
            topText: "You hesitate. Hoodie now. Phone later. It's your money. Suddenly, your FiPet has an idea!",
            bottomText: `"What if we play a quick game to help decide?"`,
          },
        ]
      },
      {
        title: "Intro to Budgeting II",
        description: "Understand the difference between spending and saving",
        topics: ["Budgeting"],
        duration: 5,
        reward: {
          xp: 150,
          coins: 150,
          itemIds: [],
        },
        questions: [
          createQuestionJSON({
            type: "singleSelect",
            prompt:"Which of these is most likely to mess up your savings?",
            baseFeedback: 'PlaceHolder',
            correctOption: {
              text: "Buying a planned birthday gift",
              feedback: 'PlaceHolder',
            },
            options: [
              {text: "Forgetting about a monthly subscription"},
              {text: "Saving more than you meant to"},
              {text: "Telling your FiPet your budget"},
            ],
          }),
          createQuestionJSON({
            type: "singleSelect",
            prompt: `What does "tracking your spending" mean?`,
            baseFeedback: 'PlaceHolder',
            correctOption: {
              text: "Writing down what you buy, when you buy it",
              feedback: 'PlaceHolder',
            },
            options: [
              {text: "That's just spying on your friends"},
              {text: "That's a spending habit, not tracking"},
              {text: "Receipts help, but aren't the same as tracking"},
            ],
          }),
          createQuestionJSON({
            type: "singleSelect",
            prompt:"What went wrong with your budget this week?",
            baseFeedback: 'PlaceHolder',
            correctOption: {
              text: "Blip made the budget too strict",
              feedback: 'PlaceHolder',
            },
            options: [
              {text: "You accidentally saved too much"},
              {text: "You forgot to track what you actually spent"},
              {text: "Your streaming service hacked your account"},
            ],
          }),
          createQuestionJSON({
            type: "singleSelect",
            prompt:"Which of these is most likely to mess up your savings?",
            baseFeedback: 'PlaceHolder',
            correctOption: {
              text: "Buying a planned birthday gift",
              feedback: 'PlaceHolder',
            },
            options: [
              {text: "Forgetting about a monthly subscription"},
              {text: "Saving more than you meant to"},
              {text: "Telling your FiPet your budget"},
            ],
          }),
        ],
        readings: []
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
