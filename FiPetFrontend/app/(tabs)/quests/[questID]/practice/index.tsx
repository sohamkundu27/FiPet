import { Redirect } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

export default function PracticeIndex() {
  const { questID } = useLocalSearchParams<{ questID?: string }>();
  
  // Redirect to quest index since practice questions are accessed directly
  return <Redirect href={`/quests/${questID}`} />;
} 