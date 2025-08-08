import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useQuest } from '@/src/hooks/useQuest';
import QuestProgressBar from '@/src/components/QuestProgressBar';
import QuestionRenderer, { QuestionRef } from '@/src/components/questions/QuestionRenderer';
import CorrectModal from '@/src/components/modals/correctModal';
import IncorrectModal from '@/src/components/modals/incorrectModal';
import FeedbackRenderer from '@/src/components/questionFeedback/FeedbackRenderer';
import { useAuth } from '@/src/hooks/useRequiresAuth';
import { useGamificationStats } from '@/src/hooks/useGamificationStats';
import { Reward } from '@/src/types/quest';
import { Question } from '@/src/services/quest/Question';

export default function PreQuestReadingScreen() {
  const { quest, loading, error } = useQuest();
  const router = useRouter();
  const { user } = useAuth();
  const { addXP, addCoins } = useGamificationStats();
  const [page, setPage] = useState(0);
  const [isInQuestionMode, setIsInQuestionMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPracticeQuestion, setCurrentPracticeQuestion] = useState<Question | null>(null);
  const questionRef = useRef<QuestionRef>(null!);
  const [readyForSubmit, setReadyForSubmit] = useState<boolean>(false);
  
  // State for modals and feedback
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [showIncorrectModal, setShowIncorrectModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  if (loading || !quest) {
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

  // Handle missing preQuest document
  if (error) {
    return (
      <View style={[styles.loadingContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }]}>
        <Text style={[styles.loadingText, { textAlign: 'center', paddingHorizontal: 8 }]}>
          {error}
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

  const readings = quest.getReadings();
  const questions = quest.getQuestions();
  const totalPages = readings.length;
  const isLastPage = page === totalPages - 1;
  const isFirstPage = page === 0;

  // Reset states when switching between reading and question modes
  useEffect(() => {
    if (isInQuestionMode) {
      setShowFeedback(false);
      setShowCorrectModal(false);
      setShowIncorrectModal(false);
      setReadyForSubmit(false);
      setCurrentPracticeQuestion(null);
    }
  }, [isInQuestionMode, currentQuestionIndex]);

  // Helper function to get the current question (could be practice or regular)
  const getCurrentQuestion = () => {
    return currentPracticeQuestion || questions[currentQuestionIndex];
  };

  const handleNext = () => {
    if (!isInQuestionMode) {
      // We're in reading mode
      if (!isLastPage) {
        setPage(page + 1);
      } else {
        // Finished reading, start questions
        setIsInQuestionMode(true);
        setCurrentQuestionIndex(0);
      }
    } else {
      // We're in question mode - handled by question submission logic
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion.isAnswered) {
        handleQuestionContinue();
      } else {
        questionRef.current?.submit();
      }
    }
  };

  const handleBack = () => {
    if (isInQuestionMode && currentQuestionIndex === 0) {
      // Go back to last reading page
      setIsInQuestionMode(false);
      setPage(totalPages - 1);
    } else if (isInQuestionMode) {
      // Go to previous question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (!isFirstPage) {
      // Go to previous reading page
      setPage(page - 1);
    }
  };

  const handleQuestionSubmit = (correct: boolean, reward: Reward | null) => {
    if (correct) {
      setShowCorrectModal(true);
    } else {
      setShowIncorrectModal(true);
    }
  };

  const handleQuestionContinue = () => {
    setShowCorrectModal(false);
    setShowIncorrectModal(false);
    setShowFeedback(false);
    
    const currentQuestion = getCurrentQuestion();
    const next = quest.getNextQuestion(currentQuestion);
    
    if (next === false) {
      // All questions completed, finish quest
      quest.complete(user.uid).then((reward) => {
        if (reward) {
          addXP(reward.xp);
          addCoins(reward.coins);
        }
        router.replace(`/(tabs)/quests/${quest.id}`);
      });
    } else {
      // Check if next is a practice question
      if (next.isPractice) {
        // Practice question - handle locally by setting as current practice question
        setCurrentPracticeQuestion(next);
        // Reset states for new question
        setShowFeedback(false);
        setShowCorrectModal(false);
        setShowIncorrectModal(false);
        setReadyForSubmit(false);
      } else {
        // Regular question - clear practice question and find next regular question
        setCurrentPracticeQuestion(null);
        const nextQuestionIndex = questions.findIndex(q => q.id === next.id);
        if (nextQuestionIndex !== -1) {
          setCurrentQuestionIndex(nextQuestionIndex);
        } else {
          // Question not found, navigate to it (fallback)
          router.replace(`/(tabs)/quests/${quest.id}/questions/${next.id}`);
        }
      }
    }
  };

  const handleModalClose = () => {
    setShowCorrectModal(false);
    setShowIncorrectModal(false);
    setShowFeedback(true);
  };

  const getNextButtonText = () => {
    if (!isInQuestionMode) {
      return isLastPage ? 'Start Quest' : 'Next';
    } else {
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion.isAnswered) {
        // If showing feedback and there's a practice question available for incorrect answer, show "PRACTICE MORE"
        if (showFeedback && currentQuestion.hasPracticeQuestion() && !currentQuestion.getAnswer().correct) {
          return 'PRACTICE MORE';
        }
        // For practice questions, always show "Continue" since they don't count toward the total
        if (currentQuestion.isPractice) {
          return 'Continue';
        }
        return currentQuestionIndex === questions.length - 1 ? 'Finish Quest' : 'Continue';
      } else {
        return 'Check Answer';
      }
    }
  };

  const shouldShowBackButton = () => {
    if (!isInQuestionMode && !isFirstPage) return true;
    if (isInQuestionMode && currentQuestionIndex > 0) return true;
    if (isInQuestionMode && currentQuestionIndex === 0) return true; // Can go back to reading
    return false;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.mainContainer}>
        {/* Fixed progress bar at the top */}
        <View style={styles.headerContainer}>
          {!isInQuestionMode ? (
            // Progress bar for reading mode
            <QuestProgressBar 
              currentStep={page} 
              numSteps={totalPages} 
              isPreQuest={true}
              questions={questions}
              hasPreQuest={true}
            />
          ) : (
            // Progress bar for question mode
            <QuestProgressBar 
              questions={questions} 
              questionID={getCurrentQuestion().id} 
              currentQuestion={getCurrentQuestion()}
              hasPreQuest={true}
              preQuestCompleted={true}
            />
          )}
        </View>
        
        {/* Scrollable content */}
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={isInQuestionMode ? styles.questionScrollContent : styles.container} 
          showsVerticalScrollIndicator={false}
        >
          {!isInQuestionMode ? (
            // Reading mode
            <>
              <Text style={styles.topText}>{String(readings[page].topText || '')}</Text>
              
              <View style={styles.imageContainer}>
                <Image source={require('@/src/assets/images/preQuestReading1.png')} style={styles.foxImage} resizeMode="contain" />
              </View>
              
              <Text style={styles.bottomText}>{String(readings[page].bottomText || '')}</Text>
            </>
          ) : (
            // Question mode
            <>
              <Text style={styles.questionNumber}>
                {getCurrentQuestion().isPractice ? 'Practice Question' : `Question ${currentQuestionIndex + 1}`}
              </Text>
              
              <Text style={styles.questionPrompt}>
                {getCurrentQuestion().prompt}
              </Text>

              {showFeedback ? (
                <FeedbackRenderer question={getCurrentQuestion()} />
              ) : (
                <QuestionRenderer
                  question={getCurrentQuestion()}
                  ref={questionRef}
                  preSubmit={() => setReadyForSubmit(false)}
                  onSubmit={handleQuestionSubmit}
                  onError={(error) => console.error('Question error:', error)}
                  onReadyForSubmit={() => setReadyForSubmit(true)}
                  onUnreadyForSubmit={() => setReadyForSubmit(false)}
                  rewardHook={async (correct, reward) => {
                    if (correct && reward) {
                      addXP(reward.xp);
                      addCoins(reward.coins);
                    }
                    return reward || { xp: 0, coins: 0, itemIds: [] };
                  }}
                />
              )}
            </>
          )}
        </ScrollView>
        
        {/* Fixed button row at the bottom */}
        <View style={styles.footerContainer}>
          <View style={styles.buttonRow}>
            {/* {shouldShowBackButton() && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )} */}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                isInQuestionMode && !getCurrentQuestion().isAnswered && !readyForSubmit ? styles.disabledButton : null,
              ]}
              onPress={handleNext}
              disabled={isInQuestionMode && !getCurrentQuestion().isAnswered && !readyForSubmit}
            >
              <Text style={styles.nextButtonText}>
                {getNextButtonText()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modals */}
        <CorrectModal
          isVisible={showCorrectModal}
          onClose={handleModalClose}
          onContinue={handleQuestionContinue}
        />
        
        <IncorrectModal
          isVisible={showIncorrectModal}
          onClose={() => {
            setShowIncorrectModal(false);
            setShowFeedback(true);
          }}
          onConfirm={() => {
            setShowIncorrectModal(false);
            setShowFeedback(true);
          }}
          onCancel={() => {
            setShowIncorrectModal(false);
            setShowFeedback(true);
          }}
          title="Not Quite"
          text=""
        />
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
    justifyContent: 'center',
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
  scrollContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    paddingBottom: 20,
  },
  questionContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  questionScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '100%',
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
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
  },
  questionPrompt: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 40,
    paddingHorizontal: 20,
    maxWidth: '90%',
  },
  footerContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
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
  disabledButton: {
    backgroundColor: '#B0B0B0',
    shadowOpacity: 0.1,
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
