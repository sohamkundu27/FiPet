// Tentative Goal: shows a page with a list of completed questions you can navigate to.
// Status: NOT IMPLEMENTED (redirects to first question)

import { useQuest } from "@/src/hooks/useQuest";
import { Redirect, useLocalSearchParams } from "expo-router";

export default function Page() {
  const { getFurthestQuestion } = useQuest();
  const { questID } = useLocalSearchParams();
  const furthestQuestion = getFurthestQuestion();
  return (<Redirect href={`/quests/${questID}/questions${furthestQuestion.id}`}/>);
}
