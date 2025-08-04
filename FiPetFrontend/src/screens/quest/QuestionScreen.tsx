import { StyleSheet, View, TouchableOpacity, Text, Image, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuest } from "@/src/hooks/useQuest";
import { useState, useRef, RefObject, useEffect } from "react";
import { ThemedView } from "@/src/components/ThemedView";
import QuestionRenderer, { QuestionRef } from "@/src/components/questions/QuestionRenderer";
import CorrectModal from '@/src/components/modals/correctModal';
import IncorrectModal from '@/src/components/modals/incorrectModal';
import { Reward } from "@/src/types/quest";
import FeedbackRenderer from "@/src/components/questionFeedback/FeedbackRenderer";
import { useAuth } from "@/src/hooks/useRequiresAuth";
import { useGamificationStats } from "@/src/hooks/useGamificationStats";
import QuestProgressBar from "@/src/components/QuestProgressBar";

export default function QuestionScreen() {

  const questionRef = useRef<QuestionRef>(null);
  const { questionID } = useLocalSearchParams<{
    questID: string;
    questionID: string;
  }>();
  const router = useRouter();
  const { quest, loading } = useQuest();
  const {user} = useAuth();
  const [readyForSubmit, setReadyForSubmit] = useState<boolean>(false);

  // State for both types
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [showIncorrectModal, setShowIncorrectModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const {addXP, addCoins} = useGamificationStats();

  // Reset feedback state when question changes
  useEffect(() => {
    setShowFeedback(false);
    setShowCorrectModal(false);
    setShowIncorrectModal(false);
    setReadyForSubmit(false);
  }, [questionID]);

  // UI rendering
  if (loading || !quest) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={{ marginTop: 10, fontSize: 16, marginBottom: 20 }}>Loading question...</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 32,
            backgroundColor: '#FF7A00',
            borderRadius: 8,
          }}
        >
          <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const questions = quest.getQuestions();
  const question = quest.getQuestion(questionID);

  return (
    <ThemedView style={styles.container}>
      {/* Progress Bar Header */}
      <View style={styles.progressHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backArrowContainer}>
          <Image
            source={require('@/src/assets/images/arrow.png')}
            style={styles.backArrow}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <QuestProgressBar questions={questions} questionID={question.id} currentQuestion={question}/>
      </View>

      {/* Scrollable Content Area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Number */}
        {question.isPractice ? (
          <Text style={styles.questionNumber}>Practice Question</Text>
        ) : (
          <Text style={styles.questionNumber}>Question {question.order + 1}</Text>
        )}
        {/* Question Text */}
        <Text style={styles.questionText}>{question.prompt}</Text>

        {question.isAnswered && showFeedback ? (
          <FeedbackRenderer question={question}/>
        ) : (
          <QuestionRenderer
            question={question}
            ref={questionRef as RefObject<QuestionRef>}
            onSubmit={(correct: boolean, reward: Reward|null) => {
              if (correct) {
                if (reward) {
                  addXP(reward.xp);
                  addCoins(reward.coins);
                }
                setShowCorrectModal(true);
              } else {
                setShowIncorrectModal(true);
              }
            }}
            onError={(err: string) => {}}
            preSubmit={() => {}}
            onReadyForSubmit={() => setReadyForSubmit(true)}
          />
        )}
      </ScrollView>

      {/* Fixed Bottom Button Container */}
      <View style={styles.checkAnswerContainer}>
        <TouchableOpacity
          style={[
            styles.checkAnswerButton,
            question.isAnswered ? null : (!readyForSubmit ? styles.disabledCheckAnswerButton : null),
          ]}
          onPress={() => {
            if (question.isAnswered) {
              const next = quest.getNextQuestion(question);
              if (next === false) {
                quest.complete(user.uid).then((reward) => {
                  router.replace(`/(tabs)/quests/${quest.id}`);
                });
              } else {
                router.replace(`/(tabs)/quests/${quest.id}/questions/${next.id}`);
              }
            } else {
              questionRef.current?.submit();
            }
          }}
          disabled={!question.isAnswered && !readyForSubmit}
        >
          <Text style={styles.checkAnswerText}>
            {question.isAnswered 
              ? (question.hasPracticeQuestion() ? 'PRACTICE MORE' : 'CONTINUE')
              : 'CHECK ANSWER'
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* Correct Modal */}
      <CorrectModal
        isVisible={showCorrectModal}
        onClose={() => {
          setShowCorrectModal(false);
          setShowFeedback(true);
        }}
        onContinue={() => {
          setShowCorrectModal(false);
          setShowFeedback(false);
          const next = quest.getNextQuestion(question);
          if (next === false) {
            quest.complete(user.uid).then((reward) => {
              if (reward) {
                addXP(reward.xp);
                addCoins(reward.coins);
              }
              router.replace(`/(tabs)/quests/${quest.id}`);
            });
          } else {
            router.replace(`/(tabs)/quests/${quest.id}/questions/${next.id}`);
          }
        }}
      />
      {/* Incorrect Modal */}
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 87,
    paddingHorizontal: 24,
  },
  backArrowContainer: {
    padding: 8,
  },
  backArrow: {
    width: 32,
    height: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
    paddingBottom: 20,
  },
  checkAnswerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 34, // Safe area bottom
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  progressBarSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressStep: {
    borderRadius: 4,
    marginHorizontal: 4,
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
    backgroundColor: '#ccc',
  },
  questionNumber: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#eee',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOptionButton: {
    borderColor: '#6C63FF',
    backgroundColor: '#f0f0ff',
  },
  disabledOptionButton: {
    opacity: 0.6,
  },
  optionText: {
    fontSize: 16,
    color: '#222',
  },
  checkAnswerButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledCheckAnswerButton: {
    backgroundColor: '#ccc',
  },
  checkAnswerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  continueContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  continueLink: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textDecorationLine: "none",
  },
  feedbackBox: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  xpText: {
    fontSize: 16,
    textAlign: "center",
  },
  foxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
    width: 267.01,
    height: 250,
  },
  foxImage: {
    width: 267.01,
    height: 250,
    marginBottom: 30,
    position: 'relative',
    zIndex: 2,
  },
  foxShadow: {
    width: 219,
    height: 25,
    position: 'absolute',
    bottom: -100,
    left: '50%',
    marginLeft: -109.5,
    zIndex: 1,
    opacity: 1,
  },
  correctModalOverlay: {
    flex: 1,
    backgroundColor: '#7CF97C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctModalContent: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  correctTitle: {
   fontSize: 35,
    position: 'absolute',
    fontWeight: 'bold',
    color: '#fff',
    top: 137,
    alignItems: 'center',
  },
}); 
