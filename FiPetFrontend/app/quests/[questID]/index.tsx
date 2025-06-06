// Tentative Goal: Page shows quest details: description, progress towards completion, XP/rewards earned so far. Possible integrates with ./questions/index.tsx.
import { useQuest } from "@/src/hooks/useQuest";
import { Redirect } from "expo-router";
import QuestComplete from '@/src/screens/quest/QuestComplete';

export default function Page() {
  const { getFurthestQuestion, isComplete } = useQuest();
  if ( !isComplete() ) {
    const furthestQuestion = getFurthestQuestion();
    return (<Redirect href={`./${furthestQuestion.id}`}/>);
  } else {
    return (<QuestComplete/>);
  }
}
