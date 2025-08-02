import { collection, doc, getDocs, query, where, orderBy, limit, Query, updateDoc, serverTimestamp, FieldValue, addDoc, Timestamp, Firestore, getDoc, setDoc } from '@firebase/firestore';
import { ANSWER_COLLECTION, DB_JSON_PracticeQuestion, DB_JSON_Question, DB_JSON_Starter, DBNormalQuestion, DBOption, DBPracticeQuestion, DBPreQuestReading, DBQuest, DBQuestAnswer, DBQuestCompletion, DBQuestion, QUEST_COLLECTION, QUEST_COMPLETION_COLLECTION, QuestId, QuestionId, QUESTIONS_COLLECTION, QuestionType, QuestTopic, READING_COLLECTION, Reward } from '@/src/types/quest';
import { Question, QuestionFactory, SingleSelectQuestion } from './Question';
import { PreQuestReading } from './PreQuestReading';

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

function insert<T>(array: T[], value: T, index: number) {
  if (index < 0 || index > array.length) {
    throw "Index out of bounds";
  }
  array.push(value);
  for (let i = array.length - 2; i >= index; i--) {
    const temp = array[i+1];
    array[i+1] = array[i];
    array[i] = temp;
  }
}

function remove<T>(array: T[], index: number) {
  if (index < 0 || index > array.length) {
    throw "Index out of bounds";
  }
  for (let i = index; i < array.length-2; i++) {
    const temp = array[i+1];
    array[i+1] = array[i];
    array[i] = temp;
  }
  array.pop();
}

export interface QuestInterface {
  get id(): QuestId;
  get title(): string;
  get description(): string;
  get duration(): number;
  get reward(): Reward;
  get topics(): QuestTopic[];
  get isDeleted(): boolean;

  getQuestions(): Question[];
  getReadings(): PreQuestReading[];
}

export interface UserQuestInterface extends QuestInterface {
  get isComplete(): boolean;

  complete(
    userId: string,
    rewardHook?: (correctRatio: number, reward: Reward|null) => Promise<Reward>
  ): Promise<Reward>;
  getLatestQuestion(): Question|false;
  getNextQuestion(currentQuestion: Question): Question|false;
  getQuestion(questionId: QuestionId): Question;
}

// For admin scripts only:
export interface AdminQuestInterface extends QuestInterface{
  delete(): Promise<void>;
  setTitle(title: string): Promise<void>;
  setDescription(description: string): Promise<void>;
  setDuration(duration: number): Promise<void>;
  setReward(reward: Reward): Promise<void>;
  setTopics(topics: QuestTopic[]): Promise<void>;
  removeQuestion(question: Question): Promise<void>; // Cannot be called on a quest constructed with user data.
  addQuestion(question: Question, index?: number): Promise<void>; // Cannot be called on a quest constructed with user data.
  removeReading(reading: PreQuestReading): Promise<void>;
  addReading(reading: PreQuestReading): Promise<void>;
}

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

export class Quest implements AdminQuestInterface, UserQuestInterface {

  /**
   * Helper to generate a query for a single quest.
   *
   * Use in @see fromFirebase
   */
  static generateSingleQuery(db: Firestore, questId: string) {
    return doc(db, QUEST_COLLECTION, questId);
  }

  /**
   * @param loadQuestions will cause all of the quest questions to be loaded from firebase (slower).
   *
   * Use @see generateSingleQuery or @see QUEST_COLLECTION to create your firebase queries.
   */
  static async fromFirebaseQuery(
    db: Firestore,
    questQuery: Query,
    loadQuestions: boolean = true,
    loadReadings: boolean = true,
    userId?: string,
  ) {

    return new Promise<Quest[]>(async (res) => {
      const quests: Quest[] = [];

      const questDocs = await getDocs(questQuery);

      questDocs.forEach(async (questDoc) => {
        const questData = {...questDoc.data({serverTimestamps: "estimate"}), id: questDoc.id} as DBQuest;


        let userData: undefined | {
          userId: string,
          completionData?: DBQuestCompletion,
        };
        if (userId) {
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
        }

        const quest = new Quest(db, questData, userData);
        if (loadQuestions) {
          let lastOrder;
          if (userData) {
            lastOrder = await quest._loadAnsweredQuestions();
          }
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
    loadQuestions: boolean = true,
    loadReadings: boolean = true,
    userId?: string,
  ) {

    const questRef = doc(db, QUEST_COLLECTION, questId);
    const questDoc = await getDoc(questRef);

    const questData = {...questDoc.data({serverTimestamps: "estimate"}), id: questDoc.id} as DBQuest;


    let userData: undefined | {
      userId: string,
      completionData?: DBQuestCompletion,
    };
    if (userId) {
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
    }

    const quest = new Quest(db, questData, userData);
    if (loadQuestions) {
      let lastOrder;
      if (userData) {
        lastOrder = await quest._loadAnsweredQuestions();
      }
      await quest._loadQuestions(lastOrder);
    }

    if (loadReadings) {
      await quest._loadReadings();
    }

    return quest;
  }
  static async _createQuestion<T extends QuestionType>(
    db: Firestore,
    questionData: Omit<DBQuestion<T>, "id">,
    questionJSON: DB_JSON_Question<T,undefined|string>|DB_JSON_PracticeQuestion<T,undefined|string>,
    practiceQuestion?: Question
  ) {
    const questionType = questionJSON.type as QuestionType;
    const baseFeedback = questionJSON.baseFeedback;

    switch (questionType) {
      case "singleSelect":
        const correctOptionData: Omit<DBOption<"singleSelect">, "id"|"questionId"> = {
          type: questionType,
          correct: true,
          text: questionJSON.correctOption.text,
          feedback: questionJSON.correctOption.feedback,
        };
        const optionData: Omit<DBOption<"singleSelect">, "id"|"questionId">[] =
          questionJSON.options.map((json) => {
            return {
              type: questionType,
              correct: false,
              feedback: baseFeedback || ((json as any).feedback as string), // @ts-ignore
              text: json.text,
            }
          });
        return await SingleSelectQuestion.create(
          db,
          questionData,
          correctOptionData,
          optionData,
          practiceQuestion
        );
      default:
        const exhaustiveCheck: never = questionType;
        throw new Error(`Unhandled question type: ${exhaustiveCheck}`);
    }
  }

  static async _createPracticeQuestion<T extends QuestionType>(
    db: Firestore,
    order: number,
    questionJSON: DB_JSON_PracticeQuestion<T, undefined|string>
  ) {
    let questionData: Omit<DBPracticeQuestion<T>, "id"> & {
      options: undefined,
      correctOption: undefined,
      baseFeedback: undefined
    } = {
      ...questionJSON,

      // delete vestigial data.
      options: undefined,
      correctOption: undefined,
      baseFeedback: undefined,

      // set up rest of data.
      reward: questionJSON.reward || null,
      questId: null,
      order: order,
      isPractice: true,
      practiceFor: null,
    };
    // delete vestigial data.
    questionData = deleteFields(questionData, "options", "correctOption", "baseFeedback") as typeof questionData;
    return await this._createQuestion(db, questionData, questionJSON);
  }

  static async _createNormalQuestion<T extends QuestionType>(
    db: Firestore,
    questId: string,
    order: number,
    questionJSON: DB_JSON_Question<T, undefined|string>
  ) {
    let questionData: Omit<DBNormalQuestion<T>, "id"> & {
      practiceQuestion: undefined,
      options: undefined,
      correctOption: undefined
      baseFeedback: undefined,
    } = {
      ...questionJSON,

      // delete vestigial data.
      practiceQuestion: undefined,
      options: undefined,
      correctOption: undefined,
      baseFeedback: undefined,

      // set up rest of data.
      reward: questionJSON.reward || null,
      questId: questId,
      order: order,
      type: questionJSON.type,
      isPractice: false,
      practiceFor: null,
    };
    // delete vestigial data.
    questionData = deleteFields(questionData, "options", "correctOption", "baseFeedback", "practiceQuestion") as typeof questionData;

    // delete vestigial data.
    delete questionData["practiceQuestion"];
    delete questionData["options"];
    delete questionData["correctOption"];

    let practiceQuestion;
    if (questionJSON.practiceQuestion) {
      practiceQuestion = await this._createPracticeQuestion(db, order + 0.5, questionJSON.practiceQuestion);
    }
    return await this._createQuestion(db, questionData, questionJSON, practiceQuestion);
  }

  static async _createQuest(db: Firestore, index: number, json: DB_JSON_Starter): Promise<Quest> {
    const questCollection = collection(db, QUEST_COLLECTION);
    const questRef = doc(questCollection);
    const questJSON = json.quests[index];
    const questData: DBQuest = {
      id: questRef.id,
      reward: questJSON.reward,
      deleted: false,
      description: questJSON.description,
      duration: questJSON.duration,
      title: questJSON.title,
      topics: questJSON.topics,
    };

    return new Promise<Quest>((resolve) => {
      setDoc(questRef, questData).then(() => {
        const questId = questRef.id;

        const quest = new Quest(db, questData);
        const numQuestions = questJSON.questions.length;
        let questionsLoaded = 0;
        const questions: (Question|null)[] = new Array().fill(null, numQuestions);

        const numReadings = questJSON.readings.length;
        let readingsLoaded = 0;
        const readings: (PreQuestReading|null)[] = new Array().fill(null, numReadings);

        for (let i = 0; i < questJSON.questions.length; i ++) {
          const questionJSON = questJSON.questions[i];
          this._createNormalQuestion(db, questId, i, questionJSON).then((question) => {
            questions[i] = question;
          }).catch((err) => {
            console.error(`Failed to create question ${i} in quest ${index} \n\tError: (${err})`);
          }).finally(() => {
            questionsLoaded ++;
            if (questionsLoaded >= numQuestions && readingsLoaded >= numReadings) {
              quest._readings = readings.filter((reading) => reading !== null);
              quest._questions = questions.filter((question) => question !== null);
              resolve(quest);
            }
          });
        }

        for (let i = 0; i < questJSON.readings.length; i ++) {
          const readingJSON = questJSON.readings[i];
          PreQuestReading.create(db, {
            ...readingJSON,
            image: readingJSON.image || null,
            questId: questId,
            order: i,
          }).then((reading) => {
            readings[i] = reading;
          }).catch((err) => {
            console.error(`Failed to create reading ${i} in quest ${index} \n\tError: (${err})`);
          }).finally(() => {
            readingsLoaded ++;
            if (questionsLoaded >= numQuestions && readingsLoaded >= numReadings) {
              quest._readings = readings.filter((reading) => reading !== null);
              quest._questions = questions.filter((question) => question !== null);
              resolve(quest);
            }
          });
        }

      }); // end of addDoc
    }); // end of Promise
  }

  /**
   * IMPORTANT: To enforce type safety, json must use createPracticeQuestionJSON or createQuestionJSON
   */
  static async createFromJSON(db: Firestore, json: DB_JSON_Starter): Promise<Quest[]> {
    const numQuests = json.quests.length;
    let questsLoaded = 0;
    const quests: (Quest|null)[] = [];

    return new Promise<Quest[]>((resolve) => {

      for (let i = 0; i < json.quests.length; i ++) {
        this._createQuest(db, i, json).then((quest) => {
          quests[i] = quest;
        }).catch((err) => {
          console.error(`Failed to create quest ${i} \n\tError: (${err})`);
        }).finally(() => {
          questsLoaded ++;
          if (questsLoaded >= numQuests) {
            resolve(quests.filter((quest) => quest !== null));
          }
        });
      }

    });
  };

  private _db: Firestore;
  private _dbData: DBQuest;
  private _questions: Question[]; // If no user is set, the following is true: _questions[i].order === i
  private _readings: PreQuestReading[];
  private _userId?: string;
  private _completionData?: DBQuestCompletion;

  private constructor(db: Firestore, data: DBQuest, userData?: {completionData?: DBQuestCompletion, userId: string}) {
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
    return new Promise(async (res) => {
      const factory = new QuestionFactory(this._db);

      const questionsRef = collection(this._db, QUESTIONS_COLLECTION);
      const questionsQuery = query(
        questionsRef,
        where("questId", "==", this._dbData.id),
        orderBy("order"),
        where("order", ">", since)
      );
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

    })
  }

  private async _loadReadings(): Promise<void> {
    return new Promise(async (res) => {

      const readingsRef = collection(this._db, READING_COLLECTION);
      const readingsQuery = query(
        readingsRef,
        where("questId", "==", this._dbData.id),
        orderBy("order")
      );
      const readingsSnap = await getDocs(readingsQuery);

      if (readingsSnap.size === 0) {
        res();
      }

      readingsSnap.forEach(async (doc) => {
        const readingData = doc.data({serverTimestamps: "estimate"}) as DBPreQuestReading;
        const reading = new PreQuestReading(this._db, readingData);
        this._readings.push(reading);
        if (this._readings.length >= readingsSnap.size) {
          res();
        }
      });

    })
  }

  /**
   * Returns the highest order from the questions answered.
   * 
   * Requires the constructor has userData passed (requires @see _userId)
   * Recommended to run @see _loadQuestions afterward.
   */
  private async _loadAnsweredQuestions(): Promise<number> {

    if (!this._userId) {
      throw "Quest requires a user to load answered questions.";
    }

    const factory = new QuestionFactory(this._db);
    let highestQuestionOrder = -1;

    const answersRef = collection(this._db, 'users', this._userId, ANSWER_COLLECTION);
    const answersQuery = query(
      answersRef,
      where("questId", "==", this._dbData.id),
      orderBy("order")
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
      const questions: {[key: number]: Question} = {};

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

      console.log(answerQuestionsSnap.docs.map((doc)=>doc.get("id")));
      answersSnapshot.docs.forEach((doc) => {

        const answerType = doc.get("type") as QuestionType; // @ts-ignore
        const answerData = {
          ...doc.data({serverTimestamps: "estimate"}),
          id: doc.id
        } as DBQuestAnswer<typeof answerType>;

        const questionDoc = binSearch(answerQuestionsSnap.docs, answerData.questionId, (doc, value) => {
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
          console.error(`A previously answered question (${answerData.questionId}) was not found in the database.`);
          handleLoop();
          return;
        }
        const questionType = questionDoc.get("type") as QuestionType; // @ts-ignore
        const questionData = questionDoc.data({serverTimestamps: "estimate"}) as DBQuestion<typeof questionType>;

        factory.fromFirebaseData(questionData, answerData).then((question) => {
          questions[answerData.order] = question;
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
    userId: string,
    rewardHook?: (correctRatio: number, reward: Reward|null) => Promise<Reward>
  ) {
    let reward = this._dbData.reward;
    if (rewardHook) {
      reward = await rewardHook(1, reward);
    }
    const completionRef = doc(this._db, 'users', userId, QUEST_COMPLETION_COLLECTION, this._dbData.id);
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
  getNextQuestion(currentQuestion: Question) {
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

  // For admin scripts only:
  async delete() {
    const questRef = doc(this._db, QUEST_COLLECTION, this._dbData.id);
    await updateDoc(questRef, {
      deleted: true,
    });
    this._dbData.deleted = true;
  };
  async setTitle(title: string) {
    const questRef = doc(this._db, QUEST_COLLECTION, this._dbData.id);
    await updateDoc(questRef, {
      title: title,
    });
    this._dbData.title = title;
  };
  async setDescription(description: string) {
    const questRef = doc(this._db, QUEST_COLLECTION, this._dbData.id);
    await updateDoc(questRef, {
      description: description,
    });
    this._dbData.description = description;
  };
  async setDuration(duration: number) {
    const questRef = doc(this._db, QUEST_COLLECTION, this._dbData.id);
    await updateDoc(questRef, {
      duration: duration,
    });
    this._dbData.duration = duration;
  };
  async setReward(reward: Reward) {
    const questRef = doc(this._db, QUEST_COLLECTION, this._dbData.id);
    await updateDoc(questRef, {
      reward: reward,
    });
    this._dbData.reward = reward;
  };
  async setTopics(topics: QuestTopic[]) {
    const questRef = doc(this._db, QUEST_COLLECTION, this._dbData.id);
    await updateDoc(questRef, {
      topics: topics,
    });
    this._dbData.topics = topics;
  };

  /**
   * Cannot be called on a quest constructed with user data.
   */
  async removeQuestion(question: Question) {

    if (this._userId) {
      throw "Cannot remove questions on a quest constructed with user data";
    }

    const index = this._questions.findIndex((q) => q.id === question.id);
    if (index === -1) {
      throw `Question ${question.id} does not exist in Quest ${this._dbData.id}`;
    }
    remove(this._questions, index);

    return new Promise<void>((res, rej) => {

      let totalCalls = 2 + this._questions.length - index;
      let currentCalls = 0;

      function checkForFinish() {
        currentCalls ++;
        if (currentCalls >= totalCalls) {
          res();
        }
      }

      question._setOrder(0).then(checkForFinish).catch(rej);
      question._setQuestId(null).then(checkForFinish).catch(rej);
      for (let i = index; i < this._questions.length; i ++) {
        this._questions[i]._setOrder(i).then(checkForFinish).catch(rej);
      }
    });
  };

  /**
   * Cannot be called on a quest constructed with user data.
   */
  addQuestion(question: Question, index?: number) {

    if (this._userId) {
      throw "Cannot add questions on a quest constructed with user data";
    }

    if (index === undefined) {
      index = this._questions.length;
    }
    insert(this._questions, question, index)

    return new Promise<void>((res, rej) => {

      let totalCalls = 1 + this._questions.length - index;
      let currentCalls = 0;

      function checkForFinish() {
        currentCalls ++;
        if (currentCalls >= totalCalls) {
          res();
        }
      }
      question._setQuestId(this._dbData.id).then(checkForFinish).catch(rej);
      for (let i = index; i < this._questions.length; i ++) {
        this._questions[i]._setOrder(i).then(checkForFinish).catch(rej);
      }
    });
  };

  removeReading(reading: PreQuestReading) {

    const index = this._readings.findIndex((q) => q.id === reading.id);
    if (index === -1) {
      throw `Reading ${reading.id} does not exist in Quest ${this._dbData.id}`;
    }
    remove(this._readings, index);

    return new Promise<void>((res, rej) => {

      let totalCalls = 1 + this._readings.length - index;
      let currentCalls = 0;

      function checkForFinish() {
        currentCalls ++;
        if (currentCalls >= totalCalls) {
          res();
        }
      }

      reading._setOrder(0).then(checkForFinish).catch(rej);
      for (let i = index; i < this._readings.length; i ++) {
        this._readings[i]._setOrder(i).then(checkForFinish).catch(rej);
      }
    });
  };

  addReading(reading: PreQuestReading, index?: number) {
    if (index === undefined) {
      index = this._readings.length;
    }
    insert(this._readings, reading, index)

    return new Promise<void>((res, rej) => {

      let totalCalls = 1 + this._readings.length - index;
      let currentCalls = 0;

      function checkForFinish() {
        currentCalls ++;
        if (currentCalls >= totalCalls) {
          res();
        }
      }
      reading._setQuestId(this._dbData.id).then(checkForFinish).catch(rej);
      for (let i = index; i < this._readings.length; i ++) {
        this._readings[i]._setOrder(i).then(checkForFinish).catch(rej);
      }
    });
  };
}
