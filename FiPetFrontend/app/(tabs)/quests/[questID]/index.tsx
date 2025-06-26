// Tentative Goal: Page shows quest details: description, progress towards completion, XP/rewards earned so far. Possible integrates with ./questions/index.tsx.
import { useQuest } from "@/src/hooks/useQuest";
import { Redirect, useLocalSearchParams, usePathname } from "expo-router";
import QuestComplete from '@/src/screens/quest/QuestComplete';

export default function Page() {
  const { questID } = useLocalSearchParams();
  const { getFurthestQuestion, isComplete, quest } = useQuest();
  const pathname = usePathname();

  // Debug logs
  console.log('Quest object:', quest);
  console.log('preQuest field:', quest?.preQuest);

  // If the quest is complete, show the completion screen
  if (isComplete()) {
    return (<QuestComplete />);
  }

  // Show the first unanswered question
  const furthestQuestion = getFurthestQuestion();
  return (<Redirect href={`/quests/${questID}/questions/${furthestQuestion.id}`} />);
}
