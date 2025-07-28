import { DBPreQuestReading, PreQuestReadingId, QuestId, READING_COLLECTION } from "@/src/types/quest";
import { doc, Firestore, getDoc } from "@firebase/firestore";

export interface UserPreQuestReadingInterface {
  get id(): PreQuestReadingId;
  get questId(): QuestId|null;
  get topText(): string;
  get bottomText(): string;
  get hasImage(): boolean;
  get image(): string|null;
}

export class UserPreQuestReading implements UserPreQuestReadingInterface {

  static async fromFirebaseId(db: Firestore, id: PreQuestReadingId) {
    const readingRef = doc(db, READING_COLLECTION, id);
    const readingDoc = await getDoc(readingRef);
    if (!readingDoc.exists()) {
      throw "PreQuestReading does not exist!";
    }
    return new UserPreQuestReading(
      readingDoc.data({serverTimestamps: "estimate"}) as DBPreQuestReading
    );
  }

  private _dbData: DBPreQuestReading;

  constructor(data: DBPreQuestReading) {
    this._dbData = data;
  }

  toString() {
    return JSON.stringify(this._dbData, null, "\t");
  }

  get id() {
    return this._dbData.id;
  };
  get questId() {
    return this._dbData.questId;
  };
  get topText() {
    return this._dbData.topText;
  }
  get bottomText() {
    return this._dbData.bottomText;
  };
  get hasImage() {
    return !!this._dbData.image
  };
  get image() {
    return this._dbData.image;
  };
}
