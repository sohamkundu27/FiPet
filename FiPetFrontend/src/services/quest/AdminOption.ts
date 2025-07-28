import { Firestore, Query } from "firebase-admin/firestore";
import { DBOption, OptionId, OPTIONS_COLLECTION, QuestId, QuestionId, QuestionType } from "@/src/types/quest";


export interface OptionInterface {
  get id(): QuestionId;
  get questionId(): QuestId|null;
  get type(): QuestionType;
  get feedback(): string;
  get correct(): boolean;
}

// Only to be used in admin scripts.
export interface AdminOptionInterface extends OptionInterface{
  setFeedback(feedback: string): Promise<void>;
}

export class AdminSingleSelectOption implements OptionInterface, AdminOptionInterface {

  /**
   * Use in admin scripts only!
   */
  static async create(db: Firestore, args: Omit<DBOption<"singleSelect">, "id">) {
    const optionRef = db.collection(OPTIONS_COLLECTION).doc();
    const optionData = {...args, id: optionRef.id};
    await optionRef.create(optionData);
    return new AdminSingleSelectOption(db, optionData);
  }

  readonly type: QuestionType = "singleSelect";

  private _dbData: DBOption<"singleSelect">;
  private _db: Firestore;

  constructor(db: Firestore, data: DBOption<"singleSelect">) {
    this._dbData = data;
    this._db = db;
  };

  get id() {
    return this._dbData.id;
  }
  get questionId() {
    return this._dbData.questionId;
  }
  get text() {
    return this._dbData.text;
  }
  get correct() {
    return this._dbData.correct;
  }
  get feedback() {
    return this._dbData.feedback;
  }

  async setText(text: string) {
    this._db
    .collection(OPTIONS_COLLECTION)
    .doc(this.id)
    .update({
      text: text,
    });
    this._dbData.text = text;
  }

  async setFeedback(feedback: string) {
    this._db
    .collection(OPTIONS_COLLECTION)
    .doc(this.id)
    .update({
      feedback: feedback,
    });
    this._dbData.feedback = feedback;
  }
}

export type AdminOption = AdminSingleSelectOption;

export class AdminOptionFactory {

  private _db: Firestore;

  constructor(db: Firestore) {
    this._db = db;
  }

  fromFirebaseData<T extends QuestionType>(data: DBOption<T>) {
    const questionType = data.type as QuestionType;
    switch (questionType) {
      case "singleSelect":
        return new AdminSingleSelectOption(this._db, data);
      default:
        const exhaustiveCheck: never = questionType;
        throw new Error(`Unhandled question type: ${exhaustiveCheck}`);
    }
  }

  async fromFirebaseId<T extends QuestionType>(id: OptionId[T]) {
    const optionDoc = await this._db
    .collection(OPTIONS_COLLECTION)
    .doc(id)
    .get();
    if (!optionDoc.exists) {
      throw `Option (${id}) does not exist!`;
    }
    const optionData = {
      ...optionDoc.data(),
      questionId: optionDoc.get("questionId") || null
    } as DBOption<T>;
    return this.fromFirebaseData(optionData);
  }

  async fromFirebaseQuery<T extends QuestionType>(query: Query) {
    const options: AdminOption[] = [];
    const optionDocs = await query.get();
    optionDocs.forEach((optionDoc) => {
      const optionData = {
        ...optionDoc.data(),
        questionId: optionDoc.get("questionId") || null
      } as DBOption<T>;
      options.push(this.fromFirebaseData(optionData));
    });
    return options;
  }
}
