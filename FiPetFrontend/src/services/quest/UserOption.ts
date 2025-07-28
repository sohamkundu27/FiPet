import { doc, Firestore, getDoc, getDocs, Query } from "@firebase/firestore";
import { DBOption, OptionId, OPTIONS_COLLECTION, QuestId, QuestionId, QuestionType } from "@/src/types/quest";

export interface UserOptionInterface {
  get id(): QuestionId;
  get questionId(): QuestId|null;
  get type(): QuestionType;
  get feedback(): string;
  get correct(): boolean;
}

export class UserSingleSelectOption implements UserOptionInterface {

  readonly type: QuestionType = "singleSelect";

  private _dbData: DBOption<"singleSelect">;

  constructor(data: DBOption<"singleSelect">) {
    this._dbData = data;
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
}

export type UserOption = UserSingleSelectOption;

export class UserOptionFactory {

  private _db: Firestore;

  constructor(db: Firestore) {
    this._db = db;
  }

  fromFirebaseData<T extends QuestionType>(data: DBOption<T>) {
    const questionType = data.type as QuestionType;
    switch (questionType) {
      case "singleSelect":
        return new UserSingleSelectOption(data);
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
      questionId: optionDoc.get("questionId") || null
    } as DBOption<T>;
    return this.fromFirebaseData(optionData);
  }

  async fromFirebaseQuery<T extends QuestionType>(query: Query) {
    const options: UserOption[] = [];
    const optionDocs = await getDocs(query);
    optionDocs.forEach((optionDoc) => {
      const optionData = {
        ...optionDoc.data({serverTimestamps: "estimate"}),
        questionId: optionDoc.get("questionId") || null
      } as DBOption<T>;
      options.push(this.fromFirebaseData(optionData));
    });
    return options;
  }
}
