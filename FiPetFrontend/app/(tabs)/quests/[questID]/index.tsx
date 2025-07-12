// Tentative Goal: Page shows quest details: description, progress towards completion, XP/rewards earned so far. Possible integrates with ./questions/index.tsx.
import { useQuest } from "@/src/hooks/useQuest";
import { Redirect, useLocalSearchParams, usePathname } from "expo-router";
import QuestComplete from '@/src/screens/quest/QuestComplete';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function Page() {
  const { questID } = useLocalSearchParams();
  const { getFurthestQuestion, isComplete, quest, loading, error } = useQuest();
  const pathname = usePathname();

  // Show loading state while quest data is being fetched
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading quest...</Text>
      </View>
    );
  }

  // Show error state if quest failed to load
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  // If the quest is complete, show the completion screen
  if (isComplete()) {
    return (<QuestComplete />);
  }

  // Check if there's a prereading that needs to be shown first
  if (quest?.preQuest) {
    return (<Redirect href={`/quests/${questID}/preQuestReading`} />);
  }

  // Show the first unanswered question
  const furthestQuestion = getFurthestQuestion();
  return (<Redirect href={`/quests/${questID}/questions/${furthestQuestion.id}`} />);
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
