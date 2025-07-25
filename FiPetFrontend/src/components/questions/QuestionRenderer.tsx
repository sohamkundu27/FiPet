import { SingleSelectQuestion, UserQuestionInterface } from "@/src/services/quest/Question";
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
  rewardHook?: (correct: boolean, reward: Reward|null) => Promise<Reward>,
}


export default function QuestionRenderer(props: QuestionProps) {
  
  const questionType = props.question.type as QuestionType;
  switch (questionType) {
    case "singleSelect":
      return (
        <SingleSelect {...props} question={props.question as SingleSelectQuestion} />
      );

    default:
      return null;
  }
}

