import { StyleSheet, View, TouchableOpacity, Text, Image } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useQuest } from "@/src/hooks/useQuest";
import { ThemedText } from "@/src/components/ThemedText";
import { Outcome, QuestionOption } from "@/src/types/quest";
import { QuestAnswer } from "@/src/components/questProvider";
import { useState } from "react";
import { ThemedView } from "@/src/components/ThemedView";

export default function QuestQuestion() {
  const { questionID, questID } = useLocalSearchParams<{
    questID?: string;
    questionID?: string;
  }>();
  const { getOptions, getAnswer, hasAnswer, getQuestion, selectOption, getAllQuestions } = useQuest();
  let [answer, setAnswer] = useState<QuestAnswer | null>(null);
  let [questionHasAnswer, setHasAnswer] = useState<boolean | null>(null);

  if (questionID === undefined) {
    throw new Error("Question ID is undefined!");
  }

  const question = getQuestion(questionID);
  const allQuestions = getAllQuestions();
  const currentIndex = allQuestions.findIndex((q) => q.id === questionID);
  const progress = (currentIndex + 1) / allQuestions.length;

  function handleOptionSelect(option: QuestionOption) {
    if (questionHasAnswer) return;
    setAnswer(selectOption(question.id, option.id));
    setHasAnswer(true);
  }

  const options = getOptions(question);
  questionHasAnswer = hasAnswer(question);
  if (questionHasAnswer) {
    answer = getAnswer(question);
  }

  function OutcomeReward({ outcome }: { outcome: Outcome }) {
    if (outcome.itemReward) {
      return (
        <>
          <ThemedText>You found a new item! [{outcome.itemReward.name}]</ThemedText>
          <ThemedText>Description: {outcome.itemReward.description}</ThemedText>
        </>
      );
    }
    return null;
  }

  function OutcomeDisplay() {
    if (questionHasAnswer && answer != null) {
      return (
        <View
          style={[
            styles.feedbackBox,
            { backgroundColor: answer.outcome.xpReward >= 0 ? "#d4edda" : "#f8d7da" },
          ]}
        >
          <Text style={styles.feedbackText}>
            {answer.outcome.xpReward >= 0 ? "✅ Great job!" : "❌ Try again!"}
          </Text>
          <Text style={styles.xpText}>
            {answer.outcome.text}{"\n"}🎉 {Math.abs(answer.outcome.xpReward)} XP
          </Text>
          <OutcomeReward outcome={answer.outcome} />
        </View>
      );
    }
    return null;
  }

  function ContinueButton() {
    if (questionHasAnswer && answer != null) {
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

  return (
    <ThemedView style={styles.screen}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      {/* Question */}
     <View style={styles.messageRow}>
    <Image source={require("@/src/assets/images/businessman.png")} style={styles.avatar} />
    <View style={styles.chatBubble}>
    <Text style={styles.chatText}>{question.text}</Text>
    </View>
  </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = answer?.option.id === option.id;
          const isDisabled = questionHasAnswer && !isSelected;

          return (
            <TouchableOpacity
              key={option.id}
              disabled={questionHasAnswer}
              onPress={() => handleOptionSelect(option)}
              style={[
                styles.optionButton,
                isSelected && styles.selectedOption,
                isDisabled && styles.disabledOption,
              ]}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Outcome Display */}
      <OutcomeDisplay />

      {/* Continue Button */}
      <View style={styles.continueContainer}>
        <ContinueButton />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    height: "100%",
    padding: 24,
    paddingTop: 100,
    justifyContent: "flex-start",
     backgroundColor: "#fff",
  },
  progressContainer: {
    height: 8,
    width: "100%",
    backgroundColor: "#eee",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 24,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFD700",
  },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#333",
  },
  optionsContainer: {
    marginTop: 10,
    marginBottom: 24,
    alignItems: "center",
  },
  optionButton: {
    width: "90%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: "#ccc",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
  selectedOption: {
    backgroundColor: "#c8f7c5",
    borderColor: "#2fae19",
  },
  disabledOption: {
    opacity: 0.6,
  },
  feedbackBox: {
    padding: 8,
    borderRadius: 12,
    marginVertical: 16,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  xpText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
  },
  continueContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  continueLink: {
    fontSize: 20,
    backgroundColor: "#58cc02",
    color: "white",
    borderRadius: 25,
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 40,
    overflow: "hidden",
    elevation: 4,
    
  },
  messageRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: 24,
},

avatar: {
  width: 100,
  height: 140,
  padding: 8,
  marginRight: 12,
},
  chatBubble: {
  backgroundColor: "#faf7f7", // Light blue chat bubble
  padding: 8,
  borderRadius: 16,
  maxWidth: "70%",
  alignSelf: "flex-start", // Aligns to the left like someone is speaking
  marginBottom: 6,
  borderTopLeftRadius: 0, // Makes it look like a speech bubble
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.5,
  shadowRadius: 6,
  elevation: 2, // Android shadow
},

chatText: {
  fontSize: 20,
  fontWeight: "bold",
  textAlign: "center",
  color: "#333",
  lineHeight: 30,
},
});
