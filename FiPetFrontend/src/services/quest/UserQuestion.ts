import { collection, CollectionReference, FieldValue, Firestore, getDocs, limit, query, serverTimestamp, Timestamp, where } from "@firebase/firestore";
import { CloudQuery, DBPracticeQuestion, DBQuestAnswer, DBQuestion, QUEST_COMPLETION_COLLECTION, QuestId, QuestionId, QUESTIONS_COLLECTION, QuestionType, Reward } from "@/src/types/quest";
import { UserOption, UserOptionFactory, UserSingleSelectOption } from "./UserOption";
import { User } from "@firebase/auth";

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
    user: User,
  ): Promise<{correct: boolean, reward: Reward|null}>;
  hasAnswer(): boolean;
  getAnswer(): UserOption;
  getCorrectOption(): UserOption|null;
  getOptions(): UserOption[];
}

export class UserSingleSelectQuestion implements UserQuestionWithOptionsInterface {

  readonly type: QuestionType = "singleSelect";

  private _dbData: DBQuestion<"singleSelect">;
  private _completionData?: DBQuestAnswer<"singleSelect">;
  private _options: UserSingleSelectOption[];// All options except for the correct one.
  private _practiceQuestion?: UserQuestion;
  private _answer?: UserSingleSelectOption;
  private _correctOption: UserSingleSelectOption | null;
  private _isPractice: boolean = false;

  constructor(
    data: DBQuestion<"singleSelect">,
    options: UserSingleSelectOption[],
    correctOption: UserSingleSelectOption | null,
    practiceQuestion?: UserQuestion,
    answer?: UserSingleSelectOption,
    completionData?: DBQuestAnswer<"singleSelect">
  ) {
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
    user: User,
  ) {

    if (this._completionData) {
      throw "This question has already been answered!";
    }

    const token = await user.getIdToken();
    const funcUrl = process.env.EXPO_PUBLIC_USE_EMULATOR === "true" ?
      `http://${process.env.EXPO_PUBLIC_EMULATOR_IP}:5001/fipet-521d1/us-central1/submitAnswer` :
      "https://submitAnswer-45en4vdieq-uc.a.run.app";
    const res = await fetch(funcUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        questionId: this._dbData.id,
        selectedOptionId: option.id,
      })
    });

    if (res.status !== 200) {
      throw "Could not complete quest.";
    }

    const json = await res.json();

    const completionData: Omit<DBQuestAnswer<"singleSelect">, "answeredAt"> & {answeredAt: FieldValue} = {
      id: this._dbData.id,
      questId: this._dbData.questId,
      questionId: this._dbData.id,
      order: this._dbData.order,
      correctOptionId: json.correctOptionId,
      selectedOptionId: option.id,
      correct: json.correct,
      reward: json.reward,
      answeredAt: serverTimestamp(),
    };
    this._completionData = {
      ...completionData,
      answeredAt: new Timestamp(Date.now() / 1000, 0)
    };
    this._answer = option;
    this._correctOption = this._options.find((_option) => _option.id === json.correctOptionId) || null;

    return {
      correct: json.correct,
      reward: json.reward,
    };
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
  private questionCollection: CollectionReference;
  private completionCollection: CollectionReference;

  constructor(db: Firestore, user: User) {
    this._db = db;
    this.questionCollection = collection(this._db, QUESTIONS_COLLECTION);
    this.completionCollection = collection(this._db, QUEST_COMPLETION_COLLECTION);
    this.optionFactory = new UserOptionFactory(user);
  }

  /**
   * Helper function to find the correct option from either the user completion
   * data or the question.
   */
  async _findCorrectOption<T extends QuestionType>(
    options: UserOption[],
    completionData?: DBQuestAnswer<T>
  ): Promise<UserOption|null> {
    let correctOption: UserOption|null = options.find((option) => {
      return (completionData && completionData?.correctOptionId === option.id)
    }) || null;

    if (!correctOption && completionData) {
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
      return option.id === completionData.selectedOptionId;
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
        const optionsQuery:CloudQuery = {
          where: [
            {
              field: "questionId",
              op: "==",
              value: data.id,
            }
          ]
        };
        let options = await this.optionFactory.fromFirebaseQuery<"singleSelect">(optionsQuery);

        const correctOption = await this._findCorrectOption(options, completionData);
        let answer;
        if (completionData) {
          answer = await this._findAnswer(options, completionData);
        }

        const practiceQuestion = await this._findPracticeQuestion(data.id) || undefined;

        return new UserSingleSelectQuestion(
          data,
          options,
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
