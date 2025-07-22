<<<<<<< HEAD
import { addDoc, collection, CollectionReference, doc, FieldValue, Firestore, getDocs, limit, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from "@firebase/firestore";
=======
import { addDoc, collection, CollectionReference, doc, FieldValue, Firestore, getDocs, limit, query, serverTimestamp, Timestamp, updateDoc, where } from "@firebase/firestore";
>>>>>>> 0332845 (Schema change)
import { ItemId } from "@/src/types/item";
import { ANSWER_COLLECTION, DBOption, DBPracticeQuestion, DBQuestAnswer, DBQuestion, OPTIONS_COLLECTION, QUEST_COMPLETION_COLLECTION, QuestId, QuestionId, QUESTIONS_COLLECTION, QuestionType, Reward } from "@/src/types/quest";
import { Option, OptionFactory, SingleSelectOption } from "./Option";

export interface QuestionInterface {
  get id(): QuestionId;
  get questId(): QuestId|null;
  get type(): QuestionType;
  get prompt(): string;
  get reward(): Reward | null;
  get isPractice(): boolean;

  hasPracticeQuestion(): boolean
  getPracticeQuestion(): Question;
}

export interface UserQuestionInterface extends QuestionInterface {
  get isAnswered(): boolean;

  // The following paragraph of the schema should only be used in admin scripts.
  setPrompt(prompt: string): Promise<void>;
  setReward(reward: Reward): Promise<void>
  setPracticeQuestion(question: Question|null): Promise<void>;
}

export interface QuestionWithOptionsInterface extends QuestionInterface {
  answer(
    option: Option,
    userId: string,
<<<<<<< HEAD
    rewardHook?: (correct: boolean, reward: Reward|null) => Promise<Reward>,
  ): Promise<{correct: boolean, reward: Reward|null}>;
=======
    handleReward: (correct: boolean, reward: Reward|null) => Promise<Reward>
  ): Promise<boolean>;
>>>>>>> 0332845 (Schema change)
  hasAnswer(): boolean;
  getAnswer(): Option;
  getCorrectOption(): Option;
  getOptions(): Option[];

  removeOption(option: Option): void; // use in admin scripts only!
  addOption(option: Option): void; // use in admin scripts only!
}

export class SingleSelectQuestion implements AdminQuestionInterface, UserQuestionInterface {

  /**
   * Practice question will be set up inside here (order, questId, practiceFor)
   */
  static async create(
    db: Firestore,
    data: Omit<DBQuestion<"singleSelect">, "id">,
    correctOptionData: Omit<DBOption<"singleSelect">, "id"|"questionId">,
    optionData: Omit<DBOption<"singleSelect">, "id"|"questionId">[],
    practiceQuestion?: Question,
  ) {
    const questionsRef = collection(db, QUESTIONS_COLLECTION);
<<<<<<< HEAD
    const questionRef = doc(questionsRef);
    const questionData = {
      id: questionRef.id,
      ...data
    } as DBQuestion<"singleSelect">;
    await setDoc(questionRef, questionData);
=======
    const result = await addDoc(questionsRef, {
      ...data
    });
    const questionData = {...data, id: result.id} as DBQuestion<"singleSelect">;
>>>>>>> 0332845 (Schema change)

    const options: SingleSelectOption[] = [];
    for (let optionDatum of optionData) {
      options.push(
<<<<<<< HEAD
        await SingleSelectOption.create(db, {...optionDatum, questionId: questionData.id})
      );
    }
    options.push(
      await SingleSelectOption.create(db, {...correctOptionData, questionId: questionData.id})
=======
        await SingleSelectOption.create(db, {...optionDatum, questionId: result.id})
      );
    }
    options.push(
      await SingleSelectOption.create(db, {...correctOptionData, questionId: result.id})
>>>>>>> 0332845 (Schema change)
    );

    const question = new SingleSelectQuestion(
      db,
      questionData,
      options,
      options[options.length-1],
      practiceQuestion
    );
    if (practiceQuestion) {
      await question.setPracticeQuestion(practiceQuestion);
    }
    return question;
  }

  readonly type: QuestionType = "singleSelect";

  private _db: Firestore;
  private _dbData: DBQuestion<"singleSelect">;
  private _completionData?: DBQuestAnswer<"singleSelect">;
<<<<<<< HEAD
  private _options: SingleSelectOption[];// All options except for the correct one.
=======
  private _options: SingleSelectOption[];
>>>>>>> 0332845 (Schema change)
  private _practiceQuestion?: Question;
  private _answer?: SingleSelectOption;
  private _correctOption: SingleSelectOption;
  private _isPractice: boolean = false;

  constructor(
    db: Firestore,
    data: DBQuestion<"singleSelect">,
    options: SingleSelectOption[],
    correctOption: SingleSelectOption,
    practiceQuestion?: Question,
    answer?: SingleSelectOption,
    completionData?: DBQuestAnswer<"singleSelect">
  ) {
    this._db = db;
    this._dbData = data;
    this._completionData = completionData;
    this._options = options;
    this._correctOption = correctOption;
    this._answer = answer;
    this._isPractice = data.isPractice;
    this._practiceQuestion = practiceQuestion;
  };

  toString() {
    return JSON.stringify({
      ...this._dbData
    }, null, "\t");
  }

  get id() {
    return this._dbData.id;
  }
  get questId() {
    return this._dbData.questId;
  }
  get prompt() {
    return this._dbData.prompt;
  }
  get reward() {
    return this._completionData?.reward || this._dbData.reward || null;
  }
  get isPractice() {
    return this._isPractice;
  }
  get isAnswered() {
    return !!this._completionData;
  }
<<<<<<< HEAD
  get order() {
    return this._dbData.order;
  }
=======
>>>>>>> 0332845 (Schema change)


  async setPrompt(prompt: string) {
    const docRef = doc(this._db, QUESTIONS_COLLECTION, this._dbData.id);
    await updateDoc(docRef, {
      prompt: prompt,
    });
    this._dbData.prompt = prompt;
  };

  async setReward(reward: {
    xp: number,
    coins: number,
    itemIds: ItemId[],
  }) {
    const docRef = doc(this._db, QUESTIONS_COLLECTION, this._dbData.id);
    await updateDoc(docRef, {
      reward: reward,
    });
    this._dbData.reward = reward;
  }

  async setPracticeQuestion(question: Question|null) {

    // remove old
    if (this._practiceQuestion) {
      const docRef = doc(this._db, QUESTIONS_COLLECTION, this._practiceQuestion.id);
      await updateDoc(docRef, {
        order: 0,
        practiceFor: null,
      });
      this._practiceQuestion._dbData.isPractice = false;
      this._practiceQuestion._dbData.practiceFor = null;
      this._practiceQuestion._isPractice = false;
      this._practiceQuestion._dbData.order = 0;
      this._practiceQuestion = undefined;
    }

    // add new
    if (question) {
      const docRef = doc(this._db, QUESTIONS_COLLECTION, question.id);
      await updateDoc(docRef, {
        questId: null,
        order: this._dbData.order + 0.5,
        practiceFor: this._dbData.id,
      });
      this._practiceQuestion = question;
      this._practiceQuestion._isPractice = true;
      this._practiceQuestion._dbData.isPractice = true;
      this._practiceQuestion._dbData.practiceFor = this._dbData.id;
      this._practiceQuestion._dbData.questId = null;
      this._practiceQuestion._dbData.order = this._dbData.order + 0.5;
    }
  };

  async _setQuestId(questId: QuestId|null) {
    const docRef = doc(this._db, QUESTIONS_COLLECTION, this._dbData.id);
    await updateDoc(docRef, {
      questId: questId,
    });
    this._dbData.questId = questId;
  };

  async _setOrder(order: number) {
    const docRef = doc(this._db, QUESTIONS_COLLECTION, this._dbData.id);
    await updateDoc(docRef, {
      order: order,
    });
    this._dbData.order = order;
  };

  async removeOption(option: Option) {
    const optionRef = doc(this._db, OPTIONS_COLLECTION, option.id);
    await updateDoc(optionRef, {
      questionId: null,
    });
    this._options = this._options.filter((value) => {
      return value.id !== option.id;
    });
  };

  async addOption(option: Option) {
    const optionRef = doc(this._db, OPTIONS_COLLECTION, option.id);
    if (option.questionId !== null) {
      throw "An option cannot belong to multiple questions!";
    }
    await updateDoc(optionRef, {
      questionId: this._dbData.id,
    });
    this._options.push(option);
  };


  hasPracticeQuestion() {
    return !!this._practiceQuestion;
  }

  getPracticeQuestion() {
    if ( !this._practiceQuestion) {
      throw "No practice question exists!";
    }
    return this._practiceQuestion;
  };

  async answer(
    option: Option,
    userId: string,
<<<<<<< HEAD
    rewardHook?: (correct: boolean, reward: Reward|null) => Promise<Reward>,
=======
    handleReward: (correct: boolean, reward: Reward|null) => Promise<Reward>
>>>>>>> 0332845 (Schema change)
  ) {

    if (this._completionData) {
      throw "This question has already been answered!";
    }

    const isCorrect = option.correct;
<<<<<<< HEAD
    let reward = this._dbData.reward;
    if (rewardHook) {
      reward = await rewardHook(isCorrect, this._dbData.reward);
    }

    const answersRef = doc(this._db, 'users', userId, ANSWER_COLLECTION, this._dbData.id);
    const completionData: Omit<DBQuestAnswer<"singleSelect">, "answeredAt"> & {answeredAt: FieldValue} = {
      id: this._dbData.id,
=======
    const reward = await handleReward(isCorrect, this._dbData.reward);

    const answersRef = collection(this._db, 'users', userId, ANSWER_COLLECTION);
    const completionData: Omit<DBQuestAnswer<"singleSelect">, "id"|"answeredAt"> & {answeredAt: FieldValue} = {
>>>>>>> 0332845 (Schema change)
      questId: this._dbData.questId,
      questionId: this._dbData.id,
      order: this._dbData.order,
      correctOptionId: this._correctOption.id,
      selectedOptionId: option.id,
      correct: isCorrect,
      reward: reward,
      answeredAt: serverTimestamp(),
    };
<<<<<<< HEAD
    await setDoc(answersRef, completionData);
    this._completionData = {
      ...completionData,
=======
    const result = await addDoc(answersRef, completionData);
    this._completionData = {
      ...completionData,
      id: result.id,
>>>>>>> 0332845 (Schema change)
      answeredAt: new Timestamp(Date.now() / 1000, 0)
    };
    this._answer = option;

<<<<<<< HEAD
    return {
      correct: isCorrect,
      reward: reward,
    };
=======
    return isCorrect;
>>>>>>> 0332845 (Schema change)
  };

  hasAnswer() {
    return !!this._completionData;
  };

  getAnswer() {
    if ( !this._answer ) {
      throw "Question has not been answered!";
    }
    return this._answer;
  };

  getCorrectOption() {
    return this._correctOption;
  };

<<<<<<< HEAD
  /**
   * All options except for the correct one.
   */
=======
>>>>>>> 0332845 (Schema change)
  getOptions() {
    return this._options;
  };
}

export type Question = SingleSelectQuestion;

export class QuestionFactory {

  private _db: Firestore;
  private optionFactory: OptionFactory;
  private optionCollection: CollectionReference;
  private questionCollection: CollectionReference;
  private completionCollection: CollectionReference;

  constructor(db: Firestore) {
    this._db = db;
    this.optionCollection = collection(this._db, OPTIONS_COLLECTION);
    this.questionCollection = collection(this._db, QUESTIONS_COLLECTION);
    this.completionCollection = collection(this._db, QUEST_COMPLETION_COLLECTION);
    this.optionFactory = new OptionFactory(this._db);
  }

  /**
   * Helper function to find the correct option from either the user completion
   * data or the question.
   */
  async _findCorrectOption<T extends QuestionType>(
    questionId: QuestionId,
    options: Option[],
    completionData?: DBQuestAnswer<T>
  ): Promise<Option> {
    let correctOption = options.find((option) => {
      return (completionData && completionData?.correctOptionId === option.id) ||
        (!completionData && option.correct);
    });

    if (!correctOption) {
      if (!completionData) {
        throw `Could not determine correct option for question (${questionId})`;
      }
      correctOption = await this.optionFactory.fromFirebaseId(completionData.correctOptionId);
    }

    return correctOption;
  }

  /**
   * Helper function to find the user's answer to the question.
   */
  async _findAnswer<T extends QuestionType>(
    options: Option[],
    completionData: DBQuestAnswer<T>
  ): Promise<Option> {
    let answer = options.find((option) => {
      return option.id === completionData.correctOptionId;
    });

    if (!answer) {
      answer = await this.optionFactory.fromFirebaseId(completionData.correctOptionId);
    }

    return answer;
  }

  async _getCompletionData<T extends QuestionType>(questionId: QuestionId): Promise<DBQuestAnswer<T>|null> {
    const answerQuery = query(
      this.completionCollection,
      where("questionId", "==", questionId),
      limit(1)
    );
    const answerDocs = await getDocs(answerQuery);
    if (answerDocs.size > 0) {
      return {
        ...answerDocs.docs[0].data({serverTimestamps: "estimate"}),
        id: answerDocs.docs[0].id
      } as DBQuestAnswer<T>;
    } else {
      return null;
    }
  }

  async _findPracticeQuestion<T extends QuestionType>(questId: QuestId): Promise<Question|null> {
    const questionsQuery = query(
      this.questionCollection,
      where("practiceFor","==", questId),
      limit(1)
    );
    const questionDocs = await getDocs(questionsQuery);
    if (questionDocs.size > 0 ) {
      const completionData = await this._getCompletionData(questionDocs.docs[0].id);
      const questionData = {
        ...questionDocs.docs[0].data({serverTimestamps: "estimate"}),
        id: questionDocs.docs[0].id
      } as DBPracticeQuestion<T>;
      return await this.fromFirebaseData(questionData, completionData || undefined);
    } else {
      return null;
    }
  }

  async fromFirebaseData<T extends QuestionType>(
    data: DBQuestion<T>,
    completionData?: DBQuestAnswer<T>,
  ) {
    const questionType = data.type as QuestionType;
    switch (questionType) {

      case "singleSelect":
        const optionsQuery = query(
          this.optionCollection,
          where("questionId", "==",data.id)
        );
<<<<<<< HEAD
        let options = await this.optionFactory.fromFirebaseQuery<"singleSelect">(optionsQuery);

        const correctOption = await this._findCorrectOption(data.id, options, completionData);
        options = options.filter((option) => !option.correct);
=======
        const options = await this.optionFactory.fromFirebaseQuery<"singleSelect">(optionsQuery);

        const correctOption = await this._findCorrectOption(data.id, options, completionData);
>>>>>>> 0332845 (Schema change)
        let answer;
        if (completionData) {
          answer = await this._findAnswer(options, completionData);
        }

        const practiceQuestion = await this._findPracticeQuestion(data.id) || undefined;

        return new SingleSelectQuestion(
          this._db,
          data, options,
          correctOption,
          practiceQuestion,
          answer,
          completionData
        );


      default:
        const exhaustiveCheck: never = questionType;
        throw new Error(`Unhandled question type: ${exhaustiveCheck}`);
    }
  }
}
