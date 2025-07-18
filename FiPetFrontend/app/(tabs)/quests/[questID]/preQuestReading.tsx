import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getPreQuestReadingById } from '@/src/services/preQuestReadingService';
import { useQuest } from '@/src/hooks/useQuest';
import QuestProgressBar from '@/src/components/QuestProgressBar';
import { PreQuestReading } from '@/src/types/quest';

const foxImage = require('@/src/assets/images/fox.png');

export default function PreQuestReadingScreen() {
  const { questID } = useLocalSearchParams<{ questID?: string }>();
  const { quest, getAllQuestions } = useQuest();
  const router = useRouter();
  const [preQuest, setPreQuest] = useState<PreQuestReading|null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPreQuest = async () => {
      if (!quest?.preQuest) {
        setLoading(false);
        setPreQuest(null);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Handle missing preQuest document
  if (!preQuest) {
    return (
      <View style={[styles.loadingContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }]}>
        <Text style={[styles.loadingText, { textAlign: 'center', paddingHorizontal: 8 }]}>
          Pre-quest reading not found. Please contact support or try another quest.
        </Text>
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

  const pageData = preQuest.pages[page];
  const totalPages = preQuest.pages.length;
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
      <View style={styles.mainContainer}>
        {/* Fixed progress bar and back arrow at the top */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backArrowContainer}>
            <Image source={require('@/src/assets/images/arrow.png')} style={styles.backArrow} />
          </TouchableOpacity>
          <QuestProgressBar numSteps={totalPages} currentStep={page}/>
        </View>
        
        {/* Scrollable content */}
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.topText}>{String(pageData?.top || '')}</Text>
          
          <View style={styles.imageContainer}>
            <Image source={require('@/src/assets/images/preQuestReading1.png')} style={styles.foxImage} resizeMode="contain" />
          </View>
          
          <Text style={styles.bottomText}>{String(pageData?.bottom || '')}</Text>
          
          <View style={styles.buttonRow}>
            {!isFirstPage && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>{isLastPage ? 'Start Quest' : 'Next'}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  topText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  imageContainer: {
    marginBottom: 40,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  foxImage: {
    width: 300,
    height: 300,
  },
  bottomText: {
    fontSize: 18,
    color: '#555',
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
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 120,
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
}); 
