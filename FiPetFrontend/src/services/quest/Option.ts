import { addDoc, collection, doc, Firestore, getDoc, getDocs, Query, updateDoc } from "@firebase/firestore";
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

export class SingleSelectOption implements OptionInterface, AdminOptionInterface {

  /**
   * Use in admin scripts only!
   */
  static async create(db: Firestore, args: Omit<DBOption<"singleSelect">, "id">) {
    const optionRef = collection(db, OPTIONS_COLLECTION);
    const optionDoc = await addDoc(optionRef, args);
    const optionData = {...args, id: optionDoc.id}
    return new SingleSelectOption(db, optionData);
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
    const optionRef = doc(this._db, OPTIONS_COLLECTION, this.id);
    await updateDoc(optionRef, {
      text: text,
    });
    this._dbData.text = text;
  }

  async setFeedback(feedback: string) {
    const optionRef = doc(this._db, OPTIONS_COLLECTION, this.id);
    await updateDoc(optionRef, {
      feedback: feedback,
    });
    this._dbData.feedback = feedback;
  }
}

export type Option = SingleSelectOption;

export class OptionFactory {

  private _db: Firestore;

  constructor(db: Firestore) {
    this._db = db;
  }

  fromFirebaseData<T extends QuestionType>(data: DBOption<T>) {
    const questionType = data.type as QuestionType;
    switch (questionType) {
      case "singleSelect":
        return new SingleSelectOption(this._db, data);
      default:
        const exhaustiveCheck: never = questionType;
        throw new Error(`Unhandled question type: ${exhaustiveCheck}`);
    }
  }

  async fromFirebaseId<T extends QuestionType>(id: OptionId[T]) {
    const optionRef = doc(this._db, OPTIONS_COLLECTION, id);
    const optionDoc = await getDoc(optionRef);
    if (!optionDoc.exists()) {
      throw `Option (${id}) does not exist!`;
    }
    const optionData = {
      ...optionDoc.data({serverTimestamps: "estimate"}),
      id: optionDoc.id,
      questionId: optionDoc.get("questionId") || null
    } as DBOption<T>;
    return this.fromFirebaseData(optionData);
  }

  async fromFirebaseQuery<T extends QuestionType>(query: Query) {
    const options: Option[] = [];
    const optionDocs = await getDocs(query);
    optionDocs.forEach((optionDoc) => {
      const optionData = {
        ...optionDoc.data({serverTimestamps: "estimate"}),
        id: optionDoc.id,
        questionId: optionDoc.get("questionId") || null
      } as DBOption<T>;
      options.push(this.fromFirebaseData(optionData));
    });
    return options;
  }
}
