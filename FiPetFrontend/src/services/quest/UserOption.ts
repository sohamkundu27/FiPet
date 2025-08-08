import { CloudQuery, DBOption, OptionId, QuestId, QuestionId, QuestionType } from "@/src/types/quest";
import { User } from "@firebase/auth";

export interface UserOptionInterface {
  get id(): QuestionId;
  get questionId(): QuestId|null;
  get type(): QuestionType;
  get feedback(): string;
}

export class UserSingleSelectOption implements UserOptionInterface {

  readonly type: QuestionType = "singleSelect";

  private _dbData: Omit<DBOption<"singleSelect">, "correct">;

  constructor(data: Omit<DBOption<"singleSelect">, "correct">) {
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
  get feedback() {
    return this._dbData.feedback;
  }
}

export type UserOption = UserSingleSelectOption;

export class UserOptionFactory {

  private _user: User;

  constructor(user: User) {
    this._user = user;
  }

  fromFirebaseData<T extends QuestionType>(data: Omit<DBOption<T>, "correct">) {
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
    const token = await this._user.getIdToken();
    const funcUrl = process.env.EXPO_PUBLIC_USE_EMULATOR === "true" ?
      `http://${process.env.EXPO_PUBLIC_EMULATOR_IP}:5001/fipet-521d1/us-central1/loadOption` :
      "https://loadOption-45en4vdieq-uc.a.run.app";
    const res = await fetch(funcUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        questionId: id,
      })
    });

    if (res.status !== 200) {
      throw "Could not load option.";
    }

    const optionData: Omit<DBOption<T>, "correct"> = await res.json();
    return this.fromFirebaseData(optionData);
  }

  async fromFirebaseQuery<T extends QuestionType>(query: CloudQuery) {
    const token = await this._user.getIdToken();
    const funcUrl = process.env.EXPO_PUBLIC_USE_EMULATOR === "true" ?
      `http://${process.env.EXPO_PUBLIC_EMULATOR_IP}:5001/fipet-521d1/us-central1/loadOptions` :
      "https://loadOptions-45en4vdieq-uc.a.run.app";
    const res = await fetch(funcUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(query)
    });

    if (res.status !== 200) {
      console.log(await res.text());
      throw "Could not load options.";
    }

    const optionData: Omit<DBOption<T>, "correct">[] = await res.json();
    const options: UserOption[] = [];
    optionData.forEach((optionDatum) => {
      options.push(this.fromFirebaseData(optionDatum));
    });
    return options;
  }
}
