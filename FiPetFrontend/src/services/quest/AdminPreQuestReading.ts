import { DBPreQuestReading, PreQuestReadingId, QuestId, READING_COLLECTION } from "@/src/types/quest";
import { Firestore } from "firebase-admin/firestore";

// The following should only be used in admin scripts.
export interface AdminPreQuestReadingInterface {
  get id(): PreQuestReadingId;
  get questId(): QuestId|null;
  get topText(): string;
  get bottomText(): string;
  get hasImage(): boolean;
  get image(): string|null;

  setTopText(text: string): Promise<void>;
  setBottomText(text: string): Promise<void>;
  setImage(image: string|null): Promise<void>;
}

export class AdminPreQuestReading implements AdminPreQuestReadingInterface {


  static async fromFirebaseId(db: Firestore, id: PreQuestReadingId) {
    const readingDoc = await db
    .collection(READING_COLLECTION)
    .doc(id)
    .get();

    if (!readingDoc.exists) {
      throw "PreQuestReading does not exist!";
    }
    return new AdminPreQuestReading(
      db,
      readingDoc.data() as DBPreQuestReading
    );
  }

  static async create(db: Firestore, data: Omit<DBPreQuestReading, "id">) {
    const readingRef = db
    .collection(READING_COLLECTION)
    .doc();

    const readingData = {...data, id: readingRef.id};
    await readingRef.create(readingData);
    return new AdminPreQuestReading(db, readingData);
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
    await this._db
    .collection(READING_COLLECTION)
    .doc(this._dbData.id)
    .update({
      topText: text,
    });
    this._dbData.topText = text;
  };
  async setBottomText(text: string) {
    await this._db
    .collection(READING_COLLECTION)
    .doc(this._dbData.id)
    .update({
      bottomText: text,
    });
    this._dbData.bottomText = text;
  };
  async setImage(image: string|null) {
    await this._db
    .collection(READING_COLLECTION)
    .doc(this._dbData.id)
    .update({
      image: image,
    });
    this._dbData.image = image;
  };
  async _setOrder(order: number) {
    await this._db
    .collection(READING_COLLECTION)
    .doc(this._dbData.id)
    .update({
      order: order,
    });
    this._dbData.order = order;
  };
  async _setQuestId(questId: QuestId) {
    await this._db
    .collection(READING_COLLECTION)
    .doc(this._dbData.id)
    .update({
      questId: questId,
    });
    this._dbData.questId = questId;
  }
}
