import { Firestore, Query } from 'firebase-admin/firestore';
import { DB_JSON_PracticeQuestion, DB_JSON_Question, DB_JSON_Starter, DBNormalQuestion, DBOption, DBPracticeQuestion, DBPreQuestReading, DBQuest, DBQuestCompletion, DBQuestion, QUEST_COLLECTION, QuestId, QuestionId, QUESTIONS_COLLECTION, QuestionType, QuestTopic, READING_COLLECTION, Reward } from '@/src/types/quest';
import { AdminQuestion, AdminQuestionFactory, AdminSingleSelectQuestion } from './AdminQuestion';
import { AdminPreQuestReading } from './AdminPreQuestReading';

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

export interface AdminQuestInterface {
  get id(): QuestId;
  get title(): string;
  get description(): string;
  get duration(): number;
  get reward(): Reward;
  get topics(): QuestTopic[];
  get isDeleted(): boolean;

  getQuestion(questionID: QuestionId): AdminQuestion;
  getQuestions(): AdminQuestion[];
  getReadings(): AdminPreQuestReading[];

  delete(): Promise<void>;
  setTitle(title: string): Promise<void>;
  setDescription(description: string): Promise<void>;
  setDuration(duration: number): Promise<void>;
  setReward(reward: Reward): Promise<void>;
  setTopics(topics: QuestTopic[]): Promise<void>;
  removeQuestion(question: AdminQuestion): Promise<void>;
  addQuestion(question: AdminQuestion, index?: number): Promise<void>;
  removeReading(reading: AdminPreQuestReading): Promise<void>;
  addReading(reading: AdminPreQuestReading): Promise<void>;
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

export class AdminQuest implements AdminQuestInterface {

  /**
   * @param loadQuestions will cause all of the quest questions to be loaded from firebase (slower).
   *
   * Use @see Firestore.collection and @see QUEST_COLLECTION to create your firebase queries.
   */
  static async fromFirebaseQuery(
    db: Firestore,
    query: Query,
    loadQuestions: boolean = true,
    loadReadings: boolean = true,
  ) {

    return new Promise<AdminQuest[]>(async (res) => {
      const quests: AdminQuest[] = [];

      const questDocs = await query.get();

      questDocs.forEach(async (questDoc) => {
        const questData = questDoc.data() as DBQuest;

        const quest = new AdminQuest(db, questData);
        if (loadQuestions) {
          await quest._loadQuestions();
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
   */
  static async fromFirebaseId(
    db: Firestore,
    questId: QuestId,
    loadQuestions: boolean = true,
    loadReadings: boolean = true,
  ) {

    const questDoc = await db.doc(`${QUEST_COLLECTION}/${questId}`).get();
    const questData = questDoc.data() as DBQuest;

    const quest = new AdminQuest(db, questData);
    if (loadQuestions) {
      await quest._loadQuestions();
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
    practiceQuestion?: AdminQuestion
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
        return await AdminSingleSelectQuestion.create(
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

  static async _createQuest(db: Firestore, index: number, json: DB_JSON_Starter): Promise<AdminQuest> {
    const questRef = db.collection(QUEST_COLLECTION).doc();
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

    return new Promise<AdminQuest>((resolve) => {
      questRef.create(questData).then(() => {
        const questId = questRef.id;

        const quest = new AdminQuest(db, questData);
        const numQuestions = questJSON.questions.length;
        let questionsLoaded = 0;
        const questions: (AdminQuestion|null)[] = new Array().fill(null, numQuestions);

        const numReadings = questJSON.readings.length;
        let readingsLoaded = 0;
        const readings: (AdminPreQuestReading|null)[] = new Array().fill(null, numReadings);

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
          AdminPreQuestReading.create(db, {
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

      }); // end of create
    }); // end of Promise
  }

  /**
   * IMPORTANT: To enforce type safety, json must use createPracticeQuestionJSON or createQuestionJSON
   */
  static async createFromJSON(db: Firestore, json: DB_JSON_Starter): Promise<AdminQuest[]> {
    const numQuests = json.quests.length;
    let questsLoaded = 0;
    const quests: (AdminQuest|null)[] = [];

    return new Promise<AdminQuest[]>((resolve) => {

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
  private _questions: AdminQuestion[]; // If no user is set, the following is true: _questions[i].order === i
  private _readings: AdminPreQuestReading[];
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
      const factory = new AdminQuestionFactory(this._db);

      const questionsSnap = await this._db
      .collection(QUESTIONS_COLLECTION)
      .where("questId", "==", this._dbData.id)
      .orderBy("order")
      .where("order", ">", since)
      .get();

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

      const readingsSnap = await this._db
      .collection(READING_COLLECTION)
      .where("questId", "==", this._dbData.id)
      .orderBy("order")
      .get();

      if (readingsSnap.size === 0) {
        res();
      }

      readingsSnap.forEach(async (doc) => {
        const readingData = doc.data() as DBPreQuestReading;
        const reading = new AdminPreQuestReading(this._db, readingData);
        this._readings.push(reading);
        if (this._readings.length >= readingsSnap.size) {
          res();
        }
      });

    })
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
  public get isDeleted() {
    return this._dbData.deleted;
  }

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
    await this._db
    .collection(QUEST_COLLECTION)
    .doc(this._dbData.id)
    .update({
        deleted: true,
      });
    this._dbData.deleted = true;
  };
  async setTitle(title: string) {
    await this._db
    .collection(QUEST_COLLECTION)
    .doc(this._dbData.id)
    .update({
        title: title,
      });
    this._dbData.title = title;
  };
  async setDescription(description: string) {
    await this._db
    .collection(QUEST_COLLECTION)
    .doc(this._dbData.id)
    .update({
        description: description,
      });
    this._dbData.description = description;
  };
  async setDuration(duration: number) {
    await this._db
    .collection(QUEST_COLLECTION)
    .doc(this._dbData.id)
    .update({
        duration: duration,
      });
    this._dbData.duration = duration;
  };
  async setReward(reward: Reward) {
    await this._db
    .collection(QUEST_COLLECTION)
    .doc(this._dbData.id)
    .update({
        reward: reward,
      });
    this._dbData.reward = reward;
  };
  async setTopics(topics: QuestTopic[]) {
    await this._db
    .collection(QUEST_COLLECTION)
    .doc(this._dbData.id)
    .update({
        topics: topics,
      });
    this._dbData.topics = topics;
  };

  /**
   * Cannot be called on a quest constructed with user data.
   */
  async removeQuestion(question: AdminQuestion) {

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
  addQuestion(question: AdminQuestion, index?: number) {

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

  removeReading(reading: AdminPreQuestReading) {

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

  addReading(reading: AdminPreQuestReading, index?: number) {
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
