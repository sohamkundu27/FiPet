import { SingleSelectQuestion, UserQuestionInterface } from "@/src/services/quest/Question";
import { QuestionType } from "@/src/types/quest";
import SingleSelectFeedback from "./SingleSelectFeedback";

export type FeedbackProps = {
  question: UserQuestionInterface,
}


export default function FeedbackRenderer(props: FeedbackProps) {
  
  const questionType = props.question.type as QuestionType;
  switch (questionType) {
    case "singleSelect":
      return (
        <SingleSelectFeedback {...props} question={props.question as SingleSelectQuestion} />
      );

    default:
      return null;
  }
}

