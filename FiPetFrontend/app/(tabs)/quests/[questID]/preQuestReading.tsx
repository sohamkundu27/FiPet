import PreQuestReadingScreen from "@/src/screens/quest/preQuestReading";
export default PreQuestReadingScreen;
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getPreQuestReadingById } from '@/src/services/preQuestReadingService';
import { useQuest } from '@/src/hooks/useQuest';

const foxImage = require('@/src/assets/images/fox.png');

export default function PreQuestReadingScreen() {
  const { questID } = useLocalSearchParams<{ questID?: string }>();
  const { quest, getAllQuestions } = useQuest();
  const router = useRouter();
  const [preQuest, setPreQuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPreQuest = async () => {
      if (!quest?.preQuest) {
        // If no prereading is specified, skip to the first question
        const allQuestions = getAllQuestions();
        if (allQuestions.length > 0) {
          router.replace(`/quests/${questID}/questions/${allQuestions[0].id}`);
        } else {
          router.replace(`/quests/${questID}`);
        }
        return;
      }
      setLoading(true);
      const data = await getPreQuestReadingById(quest.preQuest);
      setPreQuest(data);
      setLoading(false);
    };
    fetchPreQuest();
  }, [quest?.preQuest]);

  const allQuestions = getAllQuestions();
  const currentIndex = page - 1;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If no prereading data is available, skip to the first question
  if (!preQuest) {
    if (allQuestions.length > 0) {
      router.replace(`/quests/${questID}/questions/${allQuestions[0].id}`);
    } else {
      router.replace(`/quests/${questID}`);
    }
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  const pageData = preQuest[`p${page}`];
  const totalPages = 4;
  const isLastPage = page === totalPages;
  const isFirstPage = page === 1;

  // Check if pageData exists
  if (!pageData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Page data not found</Text>
      </View>
    );
  }

  const handleNext = () => {
    if (!isLastPage) {
      setPage(page + 1);
    } else {
      // Go to first question of the quest
      if (allQuestions.length > 0) {
        router.replace(`/quests/${questID}/questions/${allQuestions[0].id}`);
      } else {
        router.replace(`/quests/${questID}`);
      }
    }
  };

  const handleBack = () => {
    if (!isFirstPage) setPage(page - 1);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Fixed progress bar and back arrow at the top */}
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingTop: 87, paddingHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backArrowContainer}>
            <Image source={require('@/src/assets/images/arrow.png')} style={styles.backArrow} />
          </TouchableOpacity>
          <View style={[styles.progressBarSteps, { flex: 1 }]}> {/* Make bar stretch */}
            {allQuestions.map((_, step: number) => (
              <View
                key={step}
                style={[
                  styles.progressStep,
                  step === 0 ? styles.progressStepFirst : styles.progressStepSmall,
                  step < page ? styles.progressStepActive : styles.progressStepInactive,
                ]}
              />
            ))}
          </View>
        </View>
        {/* Scrollable content below */}
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.topText}>{String(pageData?.top || '')}</Text>
          <Image source={require('@/src/assets/images/preQuestReading1.png')} style={styles.foxImage} resizeMode="contain" />
          <Text style={styles.bottomText}>{String(pageData?.bottom || '')}</Text>
          <View style={styles.buttonRow}>
            {!isFirstPage && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.buttonText}>{isLastPage ? 'Start Quest' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
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
  topText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
    textAlign: 'center',
  },
  foxImage: {
    width: 332,
    height: 332,
    marginBottom: 32,
  },
  bottomText: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  nextButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: '#eee',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginRight: 8,
  },
  buttonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressBarSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  progressStep: {
    marginRight: 10,
  },
  progressStepFirst: {
    flex: 3,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6C63FF',
  },
  progressStepSmall: {
    flex: 1,
    height: 6,
    borderRadius: 5,
    backgroundColor: '#eee',
  },
  progressStepActive: {
    backgroundColor: '#6C63FF',
  },
  progressStepInactive: {
    backgroundColor: '#eee',
  },
  backArrowContainer: {
    padding: 8,
    marginRight: 8,
  },
  backArrow: {
    width: 32,
    height: 24,
  },
}); 
