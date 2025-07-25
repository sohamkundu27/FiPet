// Tentative Goal: shows a page with a list of completed questions you can navigate to.
// Status: NOT IMPLEMENTED (redirects to first question)

import { useQuest } from "@/src/hooks/useQuest";
import { Redirect } from "expo-router";

export default function Page() {
  const { quest } = useQuest();
  if (!quest) {
    throw "Quest not loaded!";
  }
  const furthestQuestion = quest?.getLatestQuestion();
  if (furthestQuestion) {
    return (<Redirect href={`/quests/${quest.id}/questions${furthestQuestion.id}`}/>);
  } else {
    return (<Redirect href={`/quests/${quest.id}/questions${quest.getQuestions()[0].id}`}/>);
  }
}
