import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getPreQuestReadingById } from '@/src/services/preQuestReadingService';
import { useQuest } from '@/src/hooks/useQuest';

export default function PreQuestReadingScreen() {
  const { questID } = useLocalSearchParams<{ questID?: string }>();
  const { quest, getAllQuestions } = useQuest();
  const router = useRouter();
  const [preQuest, setPreQuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPreQuest = async () => {
      if (!quest?.preQuest) return;
      setLoading(true);
      const data = await getPreQuestReadingById(quest.preQuest);
      setPreQuest(data);
      setLoading(false);
    };
    fetchPreQuest();
  }, [quest?.preQuest]);

  const allQuestions = getAllQuestions();
  const currentIndex = page - 1;

  if (loading || !preQuest) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading...</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            paddingVertical: 12,
            paddingHorizontal: 32,
            backgroundColor: '#FF7A00', // App's orange
            borderRadius: 24,
          }}
        >
          <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>Go Back</Text>
        </TouchableOpacity>
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
      const latestQuestion = quest.getLatestQuestion();
      if (!latestQuestion) {
        router.replace(`/quests/${quest.id}/questions/${quest.getQuestions()[0]}`);
      } else {
        router.replace(`/quests/${quest.id}/questions/${latestQuestion.id}`);
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
            <Text style={{ fontSize: 38, textAlign: 'center', lineHeight: 40 }}>×</Text>
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            {Array.from({ length: totalPages }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.progressBar,
                  index === 0 ? styles.progressBarLong : styles.progressBarShort,
                  index < page ? styles.progressBarActive : styles.progressBarInactive,
                ]}
              />
            ))}
          </View>
        </View>
        
        {/* Scrollable content */}
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.topText}>{String(readings[page].topText || '')}</Text>
          
          <View style={styles.imageContainer}>
            <Image source={require('@/src/assets/images/preQuestReading1.png')} style={styles.foxImage} resizeMode="contain" />
          </View>
          
          <Text style={styles.bottomText}>{String(readings[page].bottomText || '')}</Text>
          
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
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressBarLong: {
    flex: 3,
  },
  progressBarShort: {
    flex: 1,
  },
  progressBarActive: {
    backgroundColor: '#6C63FF',
  },
  progressBarInactive: {
    backgroundColor: '#E0E0E0',
  },
  backArrowContainer: {
    padding: 8,
  },
  backArrow: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  container: {
    flexGrow: 1,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
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
    lineHeight: 26,
    marginBottom: 60,
    paddingHorizontal: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: '#E8E8E8',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 120,
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