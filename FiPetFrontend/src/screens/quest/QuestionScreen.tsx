import { StyleSheet, View, TouchableOpacity, Text, Image, Modal, ScrollView, ActivityIndicator } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useQuest } from "@/src/hooks/useQuest";
import { ThemedText } from "@/src/components/ThemedText";
import { QuestAnswer } from "@/src/components/questProvider";
import { useState, useEffect } from "react";
import { ThemedView } from "@/src/components/ThemedView";
import QuestionRenderer from "@/src/components/questions/QuestionRenderer";
import CorrectModal from '@/src/components/modals/correctModal';
import IncorrectModal from '@/src/components/modals/incorrectModal';
import { getPracticeQuestionById } from '@/src/services/practiceQuestionService';

// Option type for internal use
interface QuestionOption {
  id: string;
  text: string;
}

export default function QuestionScreen() {
  const { questionID, questID, practiceID, originalQuestionID } = useLocalSearchParams<{
    questID?: string;
    questionID?: string;
    practiceID?: string;
    originalQuestionID?: string;
  }>();
  const router = useRouter();
  const { getOptions, getAnswer, hasAnswer, getQuestion, selectOption, getAllQuestions } = useQuest();

  // State for both types
  const [selectedOptions, setSelectedOptions] = useState<QuestionOption[]>([]);
  const [checked, setChecked] = useState(false);
  const [answer, setAnswer] = useState<QuestAnswer | null>(null);
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [showIncorrectModal, setShowIncorrectModal] = useState(false);
  const [practiceQuestion, setPracticeQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Detect if this is a practice question
  const isPractice = !!practiceID;

  // For practice questions, load the question
  useEffect(() => {
    if (isPractice && practiceID) {
      setLoading(true);
      getPracticeQuestionById(practiceID)
        .then(q => setPracticeQuestion(q))
        .finally(() => setLoading(false));
    }
  }, [isPractice, practiceID]);

  // Get question and options
  let question: any = null;
  let options: QuestionOption[] = [];
  let allQuestions: any[] = [];
  let currentIndex = 0;
  if (isPractice) {
    question = practiceQuestion;
    options = practiceQuestion ? practiceQuestion.options.map((option: string, index: number) => ({ id: `option_${index}`, text: option })) : [];
    // For progress bar, use all quest questions
    allQuestions = getAllQuestions();
    currentIndex = originalQuestionID ? allQuestions.findIndex(q => q.id === originalQuestionID) : 0;
  } else {
    question = questionID ? getQuestion(questionID) : null;
    options = question ? getOptions(question) : [];
    allQuestions = getAllQuestions();
    currentIndex = questionID ? allQuestions.findIndex((q) => q.id === questionID) : 0;
  }

  // Option selection logic
  function handleOptionSelect(option: QuestionOption) {
    if (checked) return;
    if (question && question.type === "multiselect") {
      setSelectedOptions((prev) => {
        const exists = prev.some((o) => o.id === option.id);
        if (exists) {
          return prev.filter((o) => o.id !== option.id);
        } else {
          return [...prev, option];
        }
      });
    } else {
      setSelectedOptions([option]);
    }
  }

  // Check answer logic
  async function checkAnswer() {
    if (checked) return;
    if (!question) return;
    if (isPractice) {
      if (!practiceQuestion || selectedOptions.length === 0) return;
      // Find the selected option index
      const selectedOptionIndex = practiceQuestion.options.findIndex((opt: string) => opt === selectedOptions[0].text);
      // Check if the selected option is correct
      const correct = practiceQuestion.correctAnswers.some((correctAnswer: string) => {
        const correctIndex = Number(correctAnswer);
        return correctIndex === selectedOptionIndex;
      });
      setChecked(true);
      setAnswer({
        option: selectedOptions[0],
        outcome: {
          id: selectedOptions[0].id,
          text: selectedOptions[0].text,
          xpReward: correct ? 10 : 0,
          isCorrectAnswer: correct,
        },
        nextQuestion: null,
      });
      if (correct) {
        setShowCorrectModal(true);
      } else {
        setShowIncorrectModal(true);
      }
    } else {
      if (question.type === "multiselect" && selectedOptions.length > 0) {
        const result = await selectOption(question.id, selectedOptions[0].id);
        setAnswer(result);
        setChecked(true);
        if (!result.outcome.isCorrectAnswer) {
          setShowIncorrectModal(true);
        } else setShowCorrectModal(true);
      } else if (selectedOptions.length > 0) {
        const result = await selectOption(question.id, selectedOptions[0].id);
        setAnswer(result);
        setChecked(true);
        if (!result.outcome.isCorrectAnswer) {
          setShowIncorrectModal(true);
        } else setShowCorrectModal(true);
      }
    }
  }

  // Navigation for continue/correct
  function handleContinue() {
    if (isPractice) {
      // For practice, go back to quest
      router.replace(`/quests/${questID}`);
    } else if (answer && answer.nextQuestion) {
      router.replace(`/quests/${questID}/questions/${answer.nextQuestion.id}`);
    } else {
      router.replace(`/quests/${questID}`);
    }
  }

  // Navigation for explanation/incorrect
  function handleSeeExplanation() {
    // Use unified explanation route with appropriate params
    const params = new URLSearchParams();
    if (isPractice) {
      params.append('practiceID', practiceID!);
      params.append('originalQuestionID', originalQuestionID || '');
    } else {
      params.append('questionID', questionID!);
    }
    
    router.push(`/quests/${questID}/explanation?${params.toString()}`);
  }

  // UI rendering
  if (loading || (isPractice && !practiceQuestion)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Loading question...</Text>
      </View>
    );
  }
  if (!question) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: 'red' }}>Question not found</Text>
      </View>
    );
  }

  const selectedOptionProp =
    question.type === "multiselect"
      ? selectedOptions.length > 0 ? selectedOptions[0] : null
      : selectedOptions.length > 0 ? selectedOptions[0] : null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar Header */}
        <View style={styles.progressHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backArrowContainer}>
            <Image
              source={require('@/src/assets/images/arrow.png')}
              style={styles.backArrow}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.progressBarSteps}>
            {allQuestions.map((_, step) => (
              <View
                key={step}
                style={[
                  styles.progressStep,
                  step === 0 ? styles.progressStepFirst : styles.progressStepSmall,
                  step <= currentIndex ? styles.progressStepActive : styles.progressStepInactive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Question Number */}
        {isPractice && (
          <Text style={styles.questionNumber}>Practice Question {currentIndex + 1}</Text>
        )}
        {!isPractice && (
          <Text style={styles.questionNumber}>Question {currentIndex + 1}</Text>
        )}
        {/* Question Text */}
        <Text style={styles.questionText}>{question.prompt}</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const isSelected =
              question.type === "multiselect"
                ? selectedOptions.some((o) => o.id === option.id)
                : selectedOptionProp?.id === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOptionButton,
                  checked && styles.disabledOptionButton,
                ]}
                onPress={() => handleOptionSelect(option)}
                disabled={checked}
              >
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {checked && answer && answer.outcome.isCorrectAnswer && (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackText}>✅ Correct!</Text>
            <Text style={styles.xpText}>{answer.outcome.text}{"\n"}🎉 {Math.abs(answer.outcome.xpReward)} XP</Text>
          </View>
        )}

        {/* Continue/Next Button */}
        <View style={styles.continueContainer}>
          {checked && answer && answer.outcome.isCorrectAnswer && (
            <TouchableOpacity
              style={styles.continueLink}
              onPress={handleContinue}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
                {isPractice || (answer && !answer.nextQuestion) ? 'Finish' : 'Continue'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Check Answer Button - Fixed at bottom */}
      {!checked && (
        <View style={styles.checkAnswerContainer}>
          <TouchableOpacity
            style={[
              styles.checkAnswerButton,
              (question.type === "multiselect" && selectedOptions.length === 0) ||
              (!selectedOptionProp)
                ? styles.disabledCheckAnswerButton
                : null,
            ]}
            onPress={checkAnswer}
            disabled={
              (question.type === "multiselect" && selectedOptions.length === 0) ||
              !selectedOptionProp
            }
          >
            <Text style={styles.checkAnswerText}>CHECK ANSWER</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Correct Modal */}
      <CorrectModal
        isVisible={showCorrectModal}
        onClose={() => setShowCorrectModal(false)}
        onContinue={() => {
          setShowCorrectModal(false);
          handleContinue();
        }}
      />
      {/* Incorrect Modal */}
      <IncorrectModal
        isVisible={showIncorrectModal}
        onClose={() => setShowIncorrectModal(false)}
        onConfirm={() => {
          setShowIncorrectModal(false);
          handleSeeExplanation();
        }}
        onCancel={() => setShowIncorrectModal(false)}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100, // Extra space for fixed button
  },
  checkAnswerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 13,
    paddingBottom: 34, // Safe area bottom
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 87,
  },
  backArrowContainer: {
    padding: 8,
  },
  backArrow: {
    width: 32,
    height: 24,
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