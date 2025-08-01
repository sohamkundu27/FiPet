import { collection, doc, getDocs, query, where, orderBy, limit, Query, serverTimestamp, FieldValue, Timestamp, Firestore, getDoc, setDoc } from '@firebase/firestore';
import { ANSWER_COLLECTION, DBPreQuestReading, DBQuest, DBQuestAnswer, DBQuestCompletion, DBQuestion, QUEST_COLLECTION, QUEST_COMPLETION_COLLECTION, QuestId, QuestionId, QUESTIONS_COLLECTION, QuestionType, QuestTopic, READING_COLLECTION, Reward } from '@/src/types/quest';
import { UserQuestion, UserQuestionFactory } from './UserQuestion';
import { UserPreQuestReading } from './UserPreQuestReading';

/**
 * Assumes sorted by ascending.
 */
function binSearch<T, K>(array: T[], value: K, compare: (item: T, value: K) => number): T|false {
  let start = 0;
  let end = array.length - 1;
  while (start <= end) {
    let middle = Math.floor(start + ((end - start) / 2));
    let cmp = compare(array[middle], value);
    if (cmp === 0) {
      return array[middle];
    } else if (cmp < 0) {
      start = middle + 1;
    } else {
      end = middle - 1;
    }
  }
  return false;
}

export interface UserQuestInterface {
  get id(): QuestId;
  get title(): string;
  get description(): string;
  get duration(): number;
  get reward(): Reward;
  get topics(): QuestTopic[];
  get isDeleted(): boolean;
  get isComplete(): boolean;

  getQuestion(questionID: QuestionId): UserQuestion;
  getQuestions(): UserQuestion[];
  getLatestQuestion(): UserQuestion|false;
  getNextQuestion(currentQuestion: UserQuestion): UserQuestion|false;
  getReadings(): UserPreQuestReading[];

  complete(
    rewardHook?: (correctRatio: number, reward: Reward|null) => Promise<Reward>
  ): Promise<Reward>;
}

export class UserQuest implements UserQuestInterface {

  /**
   * @param loadQuestions will cause all of the quest questions to be loaded from firebase (slower).
   *
   * Use @see generateSingleQuery or @see QUEST_COLLECTION to create your firebase queries.
   */
  static async fromFirebaseQuery(
    db: Firestore,
    questQuery: Query,
    userId: string,
    loadQuestions: boolean = true,
    loadReadings: boolean = true,
  ) {

    return new Promise<UserQuest[]>(async (res) => {
      const quests: UserQuest[] = [];

      const questDocs = await getDocs(questQuery);

      questDocs.forEach(async (questDoc) => {
        const questData = questDoc.data({serverTimestamps: "estimate"}) as DBQuest;

        let userData: undefined | {
          userId: string,
          completionData?: DBQuestCompletion,
        };
        userData = {
          userId: userId,
        };
        const completionRef = collection(db, 'users', userId, QUEST_COMPLETION_COLLECTION);
        const completionQuery = query(completionRef, where("questId", "==", questData.id), limit(1));
        const completionDocs = await getDocs(completionQuery);
        if (completionDocs.size === 1 ) {
          let completionData = completionDocs.docs[0].data(
            {serverTimestamps: "estimate"}) as DBQuestCompletion;
          userData.completionData = completionData;
        }

        const quest = new UserQuest(db, questData, userData);
        if (loadQuestions) {
          let lastOrder = await quest._loadAnsweredQuestions();
          await quest._loadQuestions(lastOrder);
        }

        if (loadReadings) {
          await quest._loadReadings();
        }

        quests.push(quest);

        if (quests.length >= questDocs.size) {
          res(quests);
        }
      });
    });
  }

  /**
   * @param loadQuestions will cause all of the quest questions to be loaded from firebase (slower).
   *
   * Use @see generateSingleQuery or @see QUEST_COLLECTION to create your firebase queries.
   */
  static async fromFirebaseId(
    db: Firestore,
    questId: QuestId,
    userId: string,
    loadQuestions: boolean = true,
    loadReadings: boolean = true,
  ) {

    const questRef = doc(db, QUEST_COLLECTION, questId);
    const questDoc = await getDoc(questRef);

    const questData = questDoc.data({serverTimestamps: "estimate"}) as DBQuest;


    let userData: undefined | {
      userId: string,
      completionData?: DBQuestCompletion,
    };
    userData = {
      userId: userId,
    };
    const completionRef = collection(db, 'users', userId, QUEST_COMPLETION_COLLECTION);
    const completionQuery = query(completionRef, where("questId", "==", questData.id), limit(1));
    const completionDocs = await getDocs(completionQuery);
    if (completionDocs.size === 1 ) {
      let completionData = completionDocs.docs[0].data(
        {serverTimestamps: "estimate"}) as DBQuestCompletion;
      userData.completionData = completionData;
    }

    const quest = new UserQuest(db, questData, userData);
    if (loadQuestions) {
      let lastOrder = await quest._loadAnsweredQuestions();
      await quest._loadQuestions(lastOrder);
    }

    if (loadReadings) {
      await quest._loadReadings();
    }

    return quest;
  }

  private _db: Firestore;
  private _dbData: DBQuest;
  private _questions: UserQuestion[]; // If no user is set, the following is true: _questions[i].order === i
  private _readings: UserPreQuestReading[];
  private _userId: string;
  private _completionData?: DBQuestCompletion;

  private constructor(db: Firestore, data: DBQuest, userData: {completionData?: DBQuestCompletion, userId: string}) {
    this._db = db;
    this._dbData = data;
    this._completionData = userData?.completionData;
    this._userId = userData?.userId;
    this._questions = [];
    this._readings = [];
  }

  /**
   * Adds questions with an order higher than since.
   *
   * Recommended to run @see _loadAnsweredQuestions beforehand.
   */
  private async _loadQuestions(since: number=-1): Promise<void> {
    return new Promise(async (res, rej) => {
      const factory = new UserQuestionFactory(this._db);

      const questionsRef = collection(this._db, QUESTIONS_COLLECTION);
      const questionsQuery = query(
        questionsRef,
        where("questId", "==", this._dbData.id),
        orderBy("order"),
        where("order", ">", since)
      );
      try {
        const questionsSnap = await getDocs(questionsQuery);

        if (questionsSnap.size === 0) {
          res();
        }

        questionsSnap.forEach(async (doc) => {
          const questionType = doc.get("type") as QuestionType; // @ts-ignore
          const questionData = doc.data({serverTimestamps: "estimate"}) as DBQuestion<typeof questionType>;
            const question = await factory.fromFirebaseData(questionData);
            this._questions.push(question);
            if (this._questions.length >= questionsSnap.size) {
              res();
            }
        });
      } catch(err) {
        rej(err);
      }
    })
  }

  private async _loadReadings(): Promise<void> {
    return new Promise(async (res, rej) => {

      const readingsRef = collection(this._db, READING_COLLECTION);
      const readingsQuery = query(
        readingsRef,
        where("questId", "==", this._dbData.id),
        orderBy("order")
      );
      try {
        const readingsSnap = await getDocs(readingsQuery);

        if (readingsSnap.size === 0) {
          res();
        }

        readingsSnap.forEach(async (doc) => {
          const readingData = doc.data({serverTimestamps: "estimate"}) as DBPreQuestReading;
          const reading = new UserPreQuestReading(readingData);
          this._readings.push(reading);
          if (this._readings.length >= readingsSnap.size) {
            res();
          }
        });
      } catch(err) {
        rej(err);
      }

    });
  }

  /**
   * Loads all answered questions for this quest from the database.
   * 
   * Requires the constructor has userData passed (requires @see _userId)
   * Recommended to run @see _loadQuestions afterward.
   */
  private async _loadAnsweredQuestions(): Promise<number> {

    const factory = new UserQuestionFactory(this._db);
    let highestQuestionOrder = -1;

    // Read from the new answeredQuestions collection structure
    const answersRef = collection(this._db, 'users', this._userId, 'answeredQuestions', this._dbData.id, 'questions');
    const answersQuery = query(
      answersRef,
      orderBy("timestamp")
    );
    const answersSnapshot = await getDocs(answersQuery);
    
    if (answersSnapshot.size === 0) {
      return new Promise((res)=>{res(-1);});
    }

    const questionsRef = collection(this._db, QUESTIONS_COLLECTION);
    const answeredQuestionsQuery = query(
      questionsRef,
      where("id", "in", answersSnapshot.docs.map((doc) => {
        return doc.get("questionId");
      })),
      orderBy("id"));
    const answerQuestionsSnap = await getDocs(answeredQuestionsQuery);
    
    const questRef = this;

    return new Promise<number>((res) => {

      const totalCallbacks = answersSnapshot.size;
      let numCallbacks = 0;
      const questions: {[key: number]: UserQuestion} = {};

      function handleLoop(questionOrder?: number) {
        numCallbacks ++;
        if (questionOrder !== undefined && questionOrder > highestQuestionOrder) {
          highestQuestionOrder = questionOrder;
        }
        if (numCallbacks >= totalCallbacks) {
          const sortedKeys = Object.keys(questions).sort((a, b) => Number(a) - Number(b));
          questRef._questions = sortedKeys.map((key) => {
            return questions[Number(key)];
          });
          res(highestQuestionOrder);
        }
      }

      answersSnapshot.docs.forEach((doc) => {
        // Extract data from the new collection structure
        const answerData = doc.data();
        const questionId = answerData.questionId;
        const isCorrect = answerData.isCorrect;
        
        // Create a mock completion data structure for the question
        const mockCompletionData: DBQuestAnswer<"singleSelect"> = {
          id: questionId,
          questId: this._dbData.id,
          questionId: questionId,
          order: answerData.order || 0,
          answeredAt: new Timestamp(Date.now() / 1000, 0),
          correct: isCorrect,
          correctOptionId: answerData.correctOptionId || '',
          selectedOptionId: answerData.selectedOptionId || '',
          reward: null
        };

        const questionDoc = binSearch(answerQuestionsSnap.docs, questionId, (doc, value) => {
          const docValue = doc.get("id");
          if (docValue === value) {
            return 0;
          } else if (docValue < value) {
            return -1;
          } else {
            return 1;
          }
        });
        if (questionDoc === false) {
          console.error(`A previously answered question (${questionId}) was not found in the database.`);
          handleLoop();
          return;
        }
        const questionType = questionDoc.get("type") as QuestionType; // @ts-ignore
        const questionData = questionDoc.data({serverTimestamps: "estimate"}) as DBQuestion<typeof questionType>;

        // Update the completion data with the correct order and option IDs
        mockCompletionData.order = questionData.order;
        // We'll need to get the correct option ID from the question data
        // For now, we'll use a placeholder and let the question factory handle it

        factory.fromFirebaseData(questionData, mockCompletionData).then((question) => {
          questions[questionData.order] = question;
          handleLoop(questionData.order);
        }).catch(() => {
          handleLoop();
        });
      });
    });
  }

  public get id() {
    return this._dbData.id;
  }
  public get title() {
    return this._dbData.title;
  }
  public get description() {
    return this._dbData.description;
  }
  public get duration() {
    return this._dbData.duration;
  }
  public get reward() {
    return this._completionData?.reward || this._dbData.reward;
  }
  public get topics() {
    return this._dbData.topics;
  }
  public get isComplete() {
    return !!this._completionData;
  }
  public get isDeleted() {
    return this._dbData.deleted;
  }

  async complete(
    rewardHook?: (correctRatio: number, reward: Reward|null) => Promise<Reward>
  ) {
    let reward = this._dbData.reward;
    if (rewardHook) {
      reward = await rewardHook(1, reward);
    }
    const completionRef = doc(this._db, 'users', this._userId, QUEST_COMPLETION_COLLECTION, this._dbData.id);
    const data: Omit<DBQuestCompletion, 'completedAt'> & {completedAt: FieldValue} = {
      id: this._dbData.id,
      reward: reward,
      completedAt: serverTimestamp(),
      questId: this._dbData.id
    }
    await setDoc(completionRef, data);
    this._completionData = {
      ...data,
      completedAt: new Timestamp(Date.now()/1000, 0),
    }
    return reward;
  };

  /**
   * Finds the first unanswered question, traversing through the questions as described in @see nextQuestion.
   *
   * If there are no unanswered questions, returns false.
   */
  getLatestQuestion() {
    if (this._questions.length === 0) {
      throw "Quest has no questions!";
    }
    let i = this._questions.length - 1;
    let latestQuestion = this._questions[i];
    while (!latestQuestion.hasAnswer() && i > 0) {
      i --;
      latestQuestion = this._questions[i];
    }

    if (!latestQuestion.hasAnswer()) {
      return latestQuestion;
    } else {
      if (!latestQuestion.getAnswer().correct && latestQuestion.hasPracticeQuestion()) {
        const p = latestQuestion.getPracticeQuestion();
        if (!p.hasAnswer()) {
          return p;
        }
      }
      return i >= this._questions.length - 1 ? false : this._questions[i + 1];
    }
  };

  /**
   * Returns the practice question if currentQuestion was answered incorrectyly and the practice question exists.
   * Otherwise returns the next question.
   *
   * If there are no more questions returns false.
   */
  getNextQuestion(currentQuestion: UserQuestion) {
    const index = this._questions.findIndex((q) => {
      return q.id === currentQuestion.id ||
        (q.hasPracticeQuestion() && q.getPracticeQuestion().id === currentQuestion.id);
    });

    if (index === -1) {
      throw "Question does not exist in quest!";
    }

    const q = this._questions[index];
    let isPracticeQuestion = currentQuestion.id !== q.id;
    if (!isPracticeQuestion) {
      if (!q.hasAnswer()) {
        throw "Question has not been answered!";
      } else {
        if (q.getAnswer().correct) {
          return index >= this._questions.length - 1 ? false : this._questions[index + 1];
        } else {
          return q.hasPracticeQuestion() ? q.getPracticeQuestion() : (index >= this._questions.length - 1 ? false : this._questions[index + 1]);
        }
      }
    } else {
      const p = q.getPracticeQuestion();
      if (!p.hasAnswer()) {
        throw "Question has not been answered!";
      } else {
        return index >= this._questions.length - 1 ? false : this._questions[index + 1];
      }
    }
  };

  getQuestion(questionId: QuestionId) {
    let theQuestion = undefined;
    for (const question of this._questions) {
      if (question.id === questionId) {
        theQuestion = question;
        break;
      } else if (question.hasPracticeQuestion() && question.getPracticeQuestion().id === questionId) {
        theQuestion = question.getPracticeQuestion();
        break;
      }
    }
    if (theQuestion === undefined) {
      throw "Question does not exist in quest!";
    }
    return theQuestion;
  };

  getQuestions() {
    return this._questions;
  };

  getReadings() {
    return this._readings;
  };
}
