import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getPreQuestReadingById } from '@/src/services/preQuestReadingService';
import { useQuest } from '@/src/hooks/useQuest';
import { PreQuestReading, PreQuestReadingPage } from '@/src/types/quest';

export default function PreQuestReadingScreen() {
  const params = useLocalSearchParams();
  const questID = params.questID as string;
  const questContext = useQuest();
  const router = useRouter();
  const [preQuest, setPreQuest] = useState<PreQuestReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Early return if quest context is not available
  if (!questContext) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading quest data...</Text>
      </View>
    );
  }

  const { quest, getAllQuestions } = questContext;

  // Debug logging
  console.log('Quest context:', quest);
  console.log('Quest ID:', questID);
  console.log('Quest preQuest:', quest?.preQuest);

  useEffect(() => {
    const fetchPreQuest = async () => {
      console.log('fetchPreQuest called with quest:', quest);
      
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
      try {
        console.log('Fetching pre-quest reading with ID:', quest.preQuest);
        const data = await getPreQuestReadingById(quest.preQuest);
        console.log('Pre-quest data received:', data);
        console.log('Available pages:', data ? Object.keys(data).filter(key => key.startsWith('p')) : 'No data');
        
        if (data) {
          setPreQuest(data);
        } else {
          console.log('No preQuest data found, skipping to first question');
          // If no data found, skip to first question
          const allQuestions = getAllQuestions ? getAllQuestions() : [];
          if (allQuestions && allQuestions.length > 0) {
            router.replace(`/quests/${questID}/questions/${allQuestions[0].id}`);
          } else {
            router.replace(`/quests/${questID}`);
          }
        }
      } catch (error) {
        console.error('Error fetching pre-quest reading:', error);
        // If fetching fails, skip to first question
        const allQuestions = getAllQuestions ? getAllQuestions() : [];
        if (allQuestions && allQuestions.length > 0) {
          router.replace(`/quests/${questID}/questions/${allQuestions[0].id}`);
        } else {
          router.replace(`/quests/${questID}`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (quest !== undefined) {
      fetchPreQuest();
    }
  }, [quest?.preQuest, questID, getAllQuestions, router]);

  const allQuestions = getAllQuestions ? getAllQuestions() : [];
  
  // Calculate total pages dynamically based on preQuest data
  const totalPages = preQuest ? Object.keys(preQuest).filter(key => key.startsWith('p')).length : 0;
  const isLastPage = page === totalPages;
  const isFirstPage = page === 1;

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

  const pageData = preQuest?.[`p${page}` as keyof PreQuestReading] as PreQuestReadingPage | undefined;

  // Check if current page exceeds available pages
  if (preQuest && totalPages > 0 && page > totalPages) {
    console.log(`Page ${page} exceeds total pages ${totalPages}, resetting to page 1`);
    setPage(1);
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading page...</Text>
      </View>
    );
  }

  // Check if pageData exists
  if (!pageData) {
    console.log('Page data not found for page:', page);
    console.log('Available preQuest data:', preQuest);
    console.log('Total pages:', totalPages);
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Page {page} data not found</Text>
        <Text style={styles.loadingText}>Total pages: {totalPages}</Text>
        <TouchableOpacity 
          style={styles.debugButton} 
          onPress={() => {
            console.log('Debug - preQuest:', preQuest);
            console.log('Debug - page:', page);
            console.log('Debug - totalPages:', totalPages);
            console.log('Debug - pageData:', pageData);
          }}
        >
          <Text style={styles.debugButtonText}>Debug Info</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleNext = () => {
    if (!isLastPage && page < totalPages) {
      setPage(page + 1);
    } else {
      // Go to first question of the quest
      if (allQuestions && allQuestions.length > 0) {
        router.replace(`/quests/${questID}/questions/${allQuestions[0].id}`);
      } else {
        router.replace(`/quests/${questID}`);
      }
    }
  };

  const handleBack = () => {
    if (!isFirstPage && page > 1) {
      setPage(page - 1);
    } else {
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Progress Bar Header - Similar to QuestQuestion.tsx */}
        <View style={styles.progressHeader}>
          <TouchableOpacity onPress={handleBack} style={styles.backArrowContainer}>
            <Image
              source={require('@/src/assets/images/arrow.png')}
              style={styles.backArrow}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.progressBarSteps}>
            {totalPages > 0 && Array.from({ length: totalPages }, (_, step) => (
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

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Story Text */}
          <View style={styles.storyContainer}>
            <Text style={styles.storyText}>
              {pageData?.top || ''}
            </Text>
          </View>

          {/* FiPet Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={require('@/src/assets/images/preQuestReading1.png')} 
              style={styles.fiPetImage} 
              resizeMode="contain" 
            />
          </View>

          {/* Bottom Story Text */}
          <View style={styles.bottomStoryContainer}>
            <Text style={styles.bottomStoryText}>
              {pageData?.bottom || ''}
            </Text>
          </View>
        </ScrollView>

        {/* Navigation Buttons - Fixed at bottom */}
        <View style={styles.navigationContainer}>
          <View style={styles.buttonRow}>
            {!isFirstPage && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {isLastPage ? 'Start Quest' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backArrowContainer: {
    padding: 8,
    marginRight: 8,
  },
  backArrow: {
    width: 32,
    height: 24,
  },
  progressBarSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  progressStep: {
    borderRadius: 5,
    marginRight: 10,
  },
  progressStepFirst: {
    flex: 3,
    height: 10,
  },
  progressStepSmall: {
    flex: 1,
    height: 6,
  },
  progressStepActive: {
    backgroundColor: '#6C63FF',
  },
  progressStepInactive: {
    backgroundColor: '#eee',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 120, // Space for fixed navigation
  },
  storyContainer: {
    marginBottom: 48,
    paddingHorizontal: 16,
  },
  storyText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
    maxWidth: 350,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  fiPetImage: {
    width: 280,
    height: 280,
    borderRadius: 24,
  },
  bottomStoryContainer: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  bottomStoryText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#555',
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 350,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40, // Safe area bottom
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '700',
  },
  nextButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 140,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  debugButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
