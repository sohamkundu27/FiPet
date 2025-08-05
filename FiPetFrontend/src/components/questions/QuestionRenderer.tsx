import { UserSingleSelectQuestion, UserQuestionInterface } from "@/src/services/quest/UserQuestion";
import SingleSelect from "./SingleSelect";
import { QuestionType, Reward } from "@/src/types/quest";
import { RefObject } from "react";

export type QuestionRef = {
  submit: () => void,
};

export type QuestionProps = {
  question: UserQuestionInterface,
  ref: RefObject<QuestionRef>,
  preSubmit: () => void, // A hook for loading during answer submission.
  onSubmit: (correct: boolean, reward: Reward|null) => void,
  onError: (err: string) => void,
  onReadyForSubmit?: () => void,
  onUnreadyForSubmit?: () => void,
}


export default function QuestionRenderer(props: QuestionProps) {
  
  const questionType = props.question.type as QuestionType;
  switch (questionType) {
    case "singleSelect":
      return (
        <SingleSelect {...props} question={props.question as UserSingleSelectQuestion} />
      );

    default:
      return null;
  }
}

