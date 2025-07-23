import { DBPreQuestReading, PreQuestReadingId, QuestId, READING_COLLECTION } from "@/src/types/quest";
import { collection, doc, Firestore, getDoc, setDoc, updateDoc } from "@firebase/firestore";

export interface PreQuestReadingInterface {
  get id(): PreQuestReadingId;
  get questId(): QuestId|null;
  get topText(): string;
  get bottomText(): string;
  get hasImage(): boolean;
  get image(): string|null;

  // The following paragraph of the schema should only be used in admin scripts.
  setTopText(text: string): Promise<void>;
  setBottomText(text: string): Promise<void>;
  setImage(image: string|null): Promise<void>;
  _setOrder(order: number): Promise<void>; // For package level use only.
  _setQuestId(questId: QuestId|null): Promise<void>; // For package level use only.
}

export class PreQuestReading implements PreQuestReadingInterface {


  static async fromFirebaseId(db: Firestore, id: PreQuestReadingId) {
    const readingRef = doc(db, READING_COLLECTION, id);
    const readingDoc = await getDoc(readingRef);
    if (!readingDoc.exists()) {
      throw "PreQuestReading does not exist!";
    }
    return new PreQuestReading(
      db,
      readingDoc.data({serverTimestamps: "estimate"}) as DBPreQuestReading
    );
  }

  static async create(db: Firestore, data: Omit<DBPreQuestReading, "id">) {
    const readingRef = doc(collection(db, READING_COLLECTION));
    const readingData = {...data, id: readingRef.id};
    await setDoc(readingRef, readingData);
    return new PreQuestReading(db, readingData);
  }

  private _db: Firestore;
  private _dbData: DBPreQuestReading;

  constructor(db: Firestore, data: DBPreQuestReading) {
    this._dbData = data;
    this._db = db;
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

  // The following paragraph of the schema should only be used in admin scripts.
  async setTopText(text: string) {
    const readingRef = doc(this._db, READING_COLLECTION, this._dbData.id);
    await updateDoc(readingRef, {
      topText: text,
    });
    this._dbData.topText = text;
  };
  async setBottomText(text: string) {
    const readingRef = doc(this._db, READING_COLLECTION, this._dbData.id);
    await updateDoc(readingRef, {
      bottomText: text,
    });
    this._dbData.bottomText = text;
  };
  async setImage(image: string|null) {
    const readingRef = doc(this._db, READING_COLLECTION, this._dbData.id);
    await updateDoc(readingRef, {
      image: image,
    });
    this._dbData.image = image;
  };
  async _setOrder(order: number) {
    const readingRef = doc(this._db, READING_COLLECTION, this._dbData.id);
    await updateDoc(readingRef, {
      order: order,
    });
    this._dbData.order = order;
  };
  async _setQuestId(questId: QuestId) {
    const readingRef = doc(this._db, READING_COLLECTION, this._dbData.id);
    await updateDoc(readingRef, {
      questId: questId,
    });
    this._dbData.questId = questId;
  }
}
