import { StyleSheet, View, TouchableOpacity, Text, Image, Modal } from "react-native";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useQuest } from "@/src/hooks/useQuest";
import { ThemedText } from "@/src/components/ThemedText";
import { QuestAnswer } from "@/src/components/questProvider";
import { useState, useEffect } from "react";
import { ThemedView } from "@/src/components/ThemedView";
import QuestionRenderer from "@/src/components/questions/QuestionRenderer";

// Option type for internal use
interface QuestionOption {
  id: string;
  text: string;
}

// Simple outcome type
interface SimpleOutcome {
  id: string;
  text: string;
  xpReward: number;
  isCorrectAnswer: boolean;
}

export default function QuestQuestion() {
  const { questionID, questID } = useLocalSearchParams<{
    questID?: string;
    questionID?: string;
  }>();
  const { getOptions, getAnswer, hasAnswer, getQuestion, selectOption, getAllQuestions } = useQuest();
  const [selectedOptions, setSelectedOptions] = useState<QuestionOption[]>([]);
  const [checked, setChecked] = useState(false);
  let [answer, setAnswer] = useState<QuestAnswer | null>(null);
  const [showIncorrectModal, setShowIncorrectModal] = useState(false);
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const router = useRouter();

  if (questionID === undefined) {
    throw new Error("Question ID is undefined!");
  }

  const question = getQuestion(questionID);
  const allQuestions = getAllQuestions();
  const currentIndex = allQuestions.findIndex((q) => q.id === questionID);
  const progress = (currentIndex + 1) / allQuestions.length;

  function handleOptionSelect(option: QuestionOption) {
    if (checked) return;
    if (question.type === "multiselect") {
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

  function checkAnswer() {
    if (checked) return;
    if (question.type === "multiselect" && selectedOptions.length > 0) {
      const result = selectOption(question.id, selectedOptions[0].id);
      setAnswer(result);
      setChecked(true);
      if (!result.outcome.isCorrectAnswer) setShowIncorrectModal(true);
      else setShowCorrectModal(true);
    } else if (selectedOptions.length > 0) {
      const result = selectOption(question.id, selectedOptions[0].id);
      setAnswer(result);
      setChecked(true);
      if (!result.outcome.isCorrectAnswer) setShowIncorrectModal(true);
      else setShowCorrectModal(true);
    }
  }

  function OutcomeDisplay() {
    if (checked && answer && answer.outcome.isCorrectAnswer) {
      return (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackText}>✅ Correct!</Text>
          <Text style={styles.xpText}>{answer.outcome.text}{"\n"}🎉 {Math.abs(answer.outcome.xpReward)} XP</Text>
        </View>
      );
    }
    return null;
  }

  function ContinueButton() {
    if (checked && answer && answer.outcome.isCorrectAnswer) {
      if (answer.nextQuestion === null) {
        return (
          <Link style={styles.continueLink} href={`/quests/${questID}`}>
            Finish
          </Link>
        );
      } else {
        return (
          <Link style={styles.continueLink} href={`/quests/${questID}/questions/${answer.nextQuestion.id}`}>
            Continue
          </Link>
        );
      }
    }
    return null;
  }

  const options = getOptions(question);
  const selectedOptionProp =
    question.type === "multiselect"
      ? selectedOptions.length > 0 ? selectedOptions[0] : null
      : selectedOptions.length > 0 ? selectedOptions[0] : null;

  useEffect(() => {
    if (showIncorrectModal && checked && answer && !answer.outcome.isCorrectAnswer) {
      const timer = setTimeout(() => {
        setShowIncorrectModal(false);
        if (answer.nextQuestion === null) {
          router.replace(`/quests/${questID}`);
        } else {
          router.replace(`/quests/${questID}/questions/${answer.nextQuestion.id}`);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (showCorrectModal && checked && answer && answer.outcome.isCorrectAnswer) {
      const timer = setTimeout(() => {
        setShowCorrectModal(false);
        if (answer.nextQuestion === null) {
          router.replace(`/quests/${questID}`);
        } else {
          router.replace(`/quests/${questID}/questions/${answer.nextQuestion.id}`);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showIncorrectModal, showCorrectModal, checked, answer, questID, router]);

  return (
    <ThemedView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      {/* Question Number */}
      <Text style={styles.questionNumber}>Question {currentIndex + 1}</Text>

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

      {/* Check Answer Button */}
      {!checked && (
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
      )}

      {/* Feedback */}
      <OutcomeDisplay />

      {/* Continue/Next Button */}
      <View style={styles.continueContainer}>
        <ContinueButton />
      </View>

      {/* Correct Modal */}
      <Modal
        visible={showCorrectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCorrectModal(false)}
      >
        <View style={styles.correctModalOverlay}>
          <View style={styles.correctModalContent}>
            <Text style={styles.correctTitle}>🎉 Correct</Text>
            <View style={styles.foxContainer}>
              <Image
                source={require('@/src/assets/images/happy-fox.png')}
                style={styles.foxImage}
                resizeMode="contain"
              />
              <Image
                source={require('@/src/assets/images/fox-shadow.png')}
                style={styles.foxShadow}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Incorrect Modal */}
      <Modal
        visible={showIncorrectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIncorrectModal(false)}
      >
        <View style={styles.incorrectModalOverlay}>
          <View style={styles.incorrectModalContent}>
            <Text style={styles.incorrectTitle}>❌ Incorrect</Text>
            <View style={styles.foxContainer}>
              <Image
                source={require('@/src/assets/images/sad-fox.png')}
                style={styles.foxImage}
                resizeMode="contain"
              />
              <Image
                source={require('@/src/assets/images/fox-shadow.png')}
                style={styles.foxShadow}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'flex-start',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 32,
    overflow: 'hidden',
    marginTop: 48,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 8,
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
    marginTop: 'auto',
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
  incorrectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 99, 132, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incorrectModalContent: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  incorrectTitle: {
    fontSize: 35,
    position: 'absolute',
    fontWeight: 'bold',
    color: '#fff',
    top: 137,
    alignItems: 'center',
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
    opacity: 0.4,
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
