import { Firestore, CollectionReference } from "firebase-admin/firestore";
import { ItemId } from "@/src/types/item";
import { DBOption, DBPracticeQuestion, DBQuestAnswer, DBQuestion, OPTIONS_COLLECTION, QUEST_COMPLETION_COLLECTION, QuestId, QuestionId, QUESTIONS_COLLECTION, QuestionType, Reward } from "@/src/types/quest";
import { AdminOption, AdminOptionFactory, AdminSingleSelectOption } from "./AdminOption";

export interface AdminQuestionInterface {
  get id(): QuestionId;
  get questId(): QuestId|null;
  get type(): QuestionType;
  get prompt(): string;
  get reward(): Reward | null;
  get isPractice(): boolean;
  get order(): number;

  hasPracticeQuestion(): boolean
  getPracticeQuestion(): AdminQuestion;

  setPrompt(prompt: string): Promise<void>;
  setReward(reward: Reward): Promise<void>
  setPracticeQuestion(question: AdminQuestion|null): Promise<void>;
}

export interface AdminQuestionWithOptionsInterface extends AdminQuestionInterface {
  getCorrectOption(): AdminOption;
  getOptions(): AdminOption[];

  removeOption(option: AdminOption): void; // use in admin scripts only!
  addOption(option: AdminOption): void; // use in admin scripts only!
}

export class AdminSingleSelectQuestion implements AdminQuestionWithOptionsInterface {

  /**
   * Practice question will be set up inside here (order, questId, practiceFor)
   */
  static async create(
    db: Firestore,
    data: Omit<DBQuestion<"singleSelect">, "id">,
    correctOptionData: Omit<DBOption<"singleSelect">, "id"|"questionId">,
    optionData: Omit<DBOption<"singleSelect">, "id"|"questionId">[],
    practiceQuestion?: AdminQuestion,
  ) {
    const questionRef = db.collection(QUESTIONS_COLLECTION).doc();
    const questionData = {
      id: questionRef.id,
      ...data
    } as DBQuestion<"singleSelect">;
    await questionRef.create(questionData);

    const options: AdminSingleSelectOption[] = [];
    for (let optionDatum of optionData) {
      options.push(
        await AdminSingleSelectOption.create(db, {...optionDatum, questionId: questionData.id})
      );
    }
    options.push(
      await AdminSingleSelectOption.create(db, {...correctOptionData, questionId: questionData.id})
    );

    const question = new AdminSingleSelectQuestion(
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
  private _options: AdminSingleSelectOption[];// All options except for the correct one.
  private _practiceQuestion?: AdminQuestion;
  private _correctOption: AdminSingleSelectOption;
  private _isPractice: boolean = false;

  constructor(
    db: Firestore,
    data: DBQuestion<"singleSelect">,
    options: AdminSingleSelectOption[],
    correctOption: AdminSingleSelectOption,
    practiceQuestion?: AdminQuestion,
  ) {
    this._db = db;
    this._dbData = data;
    this._options = options;
    this._correctOption = correctOption;
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
    return this._dbData.reward || null;
  }
  get isPractice() {
    return this._isPractice;
  }
  get order() {
    return this._dbData.order;
  }

  async setPrompt(prompt: string) {
    await this._db
    .collection(QUESTIONS_COLLECTION)
    .doc(this._dbData.id)
    .update({
      prompt: prompt,
    });
    this._dbData.prompt = prompt;
  };

  async setReward(reward: {
    xp: number,
    coins: number,
    itemIds: ItemId[],
  }) {
    await this._db
    .collection(QUESTIONS_COLLECTION)
    .doc(this._dbData.id)
    .update({
      reward: reward,
    });
    this._dbData.reward = reward;
  }

  async setPracticeQuestion(question: AdminQuestion|null) {

    // remove old
    if (this._practiceQuestion) {
      await this._db
      .collection(QUESTIONS_COLLECTION)
      .doc(this._practiceQuestion.id)
      .update({
        order: 0,
        practiceFor: null,
      })
      this._practiceQuestion._dbData.isPractice = false;
      this._practiceQuestion._dbData.practiceFor = null;
      this._practiceQuestion._isPractice = false;
      this._practiceQuestion._dbData.order = 0;
      this._practiceQuestion = undefined;
    }

    // add new
    if (question) {
      await this._db
      .collection(QUESTIONS_COLLECTION)
      .doc(question.id)
      .update({
        questId: null,
        order: this._dbData.order + 0.5,
        practiceFor: this._dbData.id,
      })
      this._practiceQuestion = question;
      this._practiceQuestion._isPractice = true;
      this._practiceQuestion._dbData.isPractice = true;
      this._practiceQuestion._dbData.practiceFor = this._dbData.id;
      this._practiceQuestion._dbData.questId = null;
      this._practiceQuestion._dbData.order = this._dbData.order + 0.5;
    }
  };

  async _setQuestId(questId: QuestId|null) {
    await this._db
    .collection(QUESTIONS_COLLECTION)
    .doc(this._dbData.id)
    .update({
      questId: questId,
    });
    this._dbData.questId = questId;
  };

  async _setOrder(order: number) {
    await this._db
    .collection(QUESTIONS_COLLECTION)
    .doc(this._dbData.id)
    .update({
      order: order,
    });
    this._dbData.order = order;
  };

  async removeOption(option: AdminOption) {
    await this._db
    .collection(OPTIONS_COLLECTION)
    .doc(option.id)
    .update({
      questionId: null,
    });
    this._options = this._options.filter((value) => {
      return value.id !== option.id;
    });
  };

  async addOption(option: AdminOption) {
    if (option.questionId !== null) {
      throw "An option cannot belong to multiple questions!";
    }
    await this._db
    .collection(OPTIONS_COLLECTION)
    .doc(option.id)
    .update({
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

export type AdminQuestion = AdminSingleSelectQuestion;

export class AdminQuestionFactory {

  private _db: Firestore;
  private optionFactory: AdminOptionFactory;
  private optionCollection: CollectionReference;
  private questionCollection: CollectionReference;
  private completionCollection: CollectionReference;

  constructor(db: Firestore) {
    this._db = db;
    this.optionCollection = this._db.collection(OPTIONS_COLLECTION);
    this.questionCollection = this._db.collection(QUESTIONS_COLLECTION);
    this.completionCollection = this._db.collection(QUEST_COMPLETION_COLLECTION);
    this.optionFactory = new AdminOptionFactory(this._db);
  }

  /**
   * Helper function to find the correct option from either the user completion
   * data or the question.
   */
  async _findCorrectOption<T extends QuestionType>(
    questionId: QuestionId,
    options: AdminOption[],
    completionData?: DBQuestAnswer<T>
  ): Promise<AdminOption> {
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
    options: AdminOption[],
    completionData: DBQuestAnswer<T>
  ): Promise<AdminOption> {
    let answer = options.find((option) => {
      return option.id === completionData.correctOptionId;
    });

    if (!answer) {
      answer = await this.optionFactory.fromFirebaseId(completionData.correctOptionId);
    }

    return answer;
  }

  async _getCompletionData<T extends QuestionType>(questionId: QuestionId): Promise<DBQuestAnswer<T>|null> {
    const answerDocs = await this.completionCollection
    .where("questionId", "==", questionId)
    .limit(1)
    .get();
    if (answerDocs.size > 0) {
      return {
        ...answerDocs.docs[0].data(),
        id: answerDocs.docs[0].id
      } as DBQuestAnswer<T>;
    } else {
      return null;
    }
  }

  async _findPracticeQuestion<T extends QuestionType>(questId: QuestId): Promise<AdminQuestion|null> {
    const questionDocs = await this.questionCollection
    .where("practiceFor","==", questId)
    .limit(1)
    .get();
    if (questionDocs.size > 0 ) {
      const completionData = await this._getCompletionData(questionDocs.docs[0].id);
      const questionData = {
        ...questionDocs.docs[0].data(),
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
        const optionsQuery = this.optionCollection.where("questionId", "==",data.id);
        let options = await this.optionFactory.fromFirebaseQuery<"singleSelect">(optionsQuery);

        const correctOption = await this._findCorrectOption(data.id, options, completionData);
        options = options.filter((option) => !option.correct);

        const practiceQuestion = await this._findPracticeQuestion(data.id) || undefined;

        return new AdminSingleSelectQuestion(
          this._db,
          data, options,
          correctOption,
          practiceQuestion,
        );


      default:
        const exhaustiveCheck: never = questionType;
        throw new Error(`Unhandled question type: ${exhaustiveCheck}`);
    }
  }
}
