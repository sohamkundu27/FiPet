import { collection, CollectionReference, doc, FieldValue, Firestore, getDocs, limit, query, serverTimestamp, setDoc, Timestamp, where } from "@firebase/firestore";
import { ANSWER_COLLECTION, DBPracticeQuestion, DBQuestAnswer, DBQuestion, OPTIONS_COLLECTION, QUEST_COMPLETION_COLLECTION, QuestId, QuestionId, QUESTIONS_COLLECTION, QuestionType, Reward } from "@/src/types/quest";
import { UserOption, UserOptionFactory, UserSingleSelectOption } from "./UserOption";

export interface UserQuestionInterface {
  get id(): QuestionId;
  get questId(): QuestId|null;
  get type(): QuestionType;
  get prompt(): string;
  get reward(): Reward | null;
  get isPractice(): boolean;
  get order(): number;
  get isAnswered(): boolean;

  hasPracticeQuestion(): boolean
  getPracticeQuestion(): UserQuestion;
}

export interface UserQuestionWithOptionsInterface extends UserQuestionInterface {
  answer(
    option: UserOption,
    userId: string,
    rewardHook?: (correct: boolean, reward: Reward|null) => Promise<Reward>,
  ): Promise<{correct: boolean, reward: Reward|null}>;
  hasAnswer(): boolean;
  getAnswer(): UserOption;
  getCorrectOption(): UserOption;
  getOptions(): UserOption[];
  markAsAnswered(option: UserOption, reward: Reward|null): void;
}

export class UserSingleSelectQuestion implements UserQuestionWithOptionsInterface {

  readonly type: QuestionType = "singleSelect";

  private _db: Firestore;
  private _dbData: DBQuestion<"singleSelect">;
  private _completionData?: DBQuestAnswer<"singleSelect">;
  private _options: UserSingleSelectOption[];// All options except for the correct one.
  private _practiceQuestion?: UserQuestion;
  private _answer?: UserSingleSelectOption;
  private _correctOption: UserSingleSelectOption;
  private _isPractice: boolean = false;

  constructor(
    db: Firestore,
    data: DBQuestion<"singleSelect">,
    options: UserSingleSelectOption[],
    correctOption: UserSingleSelectOption,
    practiceQuestion?: UserQuestion,
    answer?: UserSingleSelectOption,
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
  get order() {
    return this._dbData.order;
  }

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
    option: UserOption,
    userId: string,
    rewardHook?: (correct: boolean, reward: Reward|null) => Promise<Reward>,
  ) {

    if (this._completionData) {
      throw "This question has already been answered!";
    }

    const isCorrect = option.correct;
    let reward = this._dbData.reward;
    if (rewardHook) {
      reward = await rewardHook(isCorrect, this._dbData.reward);
    }

    const answersRef = doc(this._db, 'users', userId, ANSWER_COLLECTION, this._dbData.id);
    const completionData: Omit<DBQuestAnswer<"singleSelect">, "answeredAt"> & {answeredAt: FieldValue} = {
      id: this._dbData.id,
      questId: this._dbData.questId,
      questionId: this._dbData.id,
      order: this._dbData.order,
      correctOptionId: this._correctOption.id,
      selectedOptionId: option.id,
      correct: isCorrect,
      reward: reward,
      answeredAt: serverTimestamp(),
    };
    await setDoc(answersRef, completionData);
    this._completionData = {
      ...completionData,
      answeredAt: new Timestamp(Date.now() / 1000, 0)
    };
    this._answer = option;

    return {
      correct: isCorrect,
      reward: reward,
    };
  };

  // Method to mark question as answered locally (without Firestore write)
  markAsAnswered(option: UserOption, reward: Reward|null) {
    if (this._completionData) {
      return; // Already answered
    }

    this._completionData = {
      id: this._dbData.id,
      questId: this._dbData.questId,
      questionId: this._dbData.id,
      order: this._dbData.order,
      correctOptionId: this._correctOption.id,
      selectedOptionId: option.id,
      correct: option.correct,
      reward: reward,
      answeredAt: new Timestamp(Date.now() / 1000, 0)
    };
    this._answer = option;
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

  /**
   * All options except for the correct one.
   */
  getOptions() {
    return this._options;
  };
}

export type UserQuestion = UserSingleSelectQuestion;

export class UserQuestionFactory {

  private _db: Firestore;
  private optionFactory: UserOptionFactory;
  private optionCollection: CollectionReference;
  private questionCollection: CollectionReference;
  private completionCollection: CollectionReference;

  constructor(db: Firestore) {
    this._db = db;
    this.optionCollection = collection(this._db, OPTIONS_COLLECTION);
    this.questionCollection = collection(this._db, QUESTIONS_COLLECTION);
    this.completionCollection = collection(this._db, QUEST_COMPLETION_COLLECTION);
    this.optionFactory = new UserOptionFactory(this._db);
  }

  /**
   * Helper function to find the correct option from either the user completion
   * data or the question.
   */
  async _findCorrectOption<T extends QuestionType>(
    questionId: QuestionId,
    options: UserOption[],
    completionData?: DBQuestAnswer<T>
  ): Promise<UserOption> {
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
    options: UserOption[],
    completionData: DBQuestAnswer<T>
  ): Promise<UserOption> {
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

  async _findPracticeQuestion<T extends QuestionType>(questId: QuestId): Promise<UserQuestion|null> {
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
        let options = await this.optionFactory.fromFirebaseQuery<"singleSelect">(optionsQuery);

        const correctOption = await this._findCorrectOption(data.id, options, completionData);
        options = options.filter((option) => !option.correct);
        let answer;
        if (completionData) {
          answer = await this._findAnswer(options, completionData);
        }

        const practiceQuestion = await this._findPracticeQuestion(data.id) || undefined;

        return new UserSingleSelectQuestion(
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
