import { SingleSelectQuestion } from "@/src/services/quest/Question";
import { View, StyleSheet, Text } from "react-native";
import { FeedbackProps } from "./FeedbackRenderer";

type SingleSelectProps = FeedbackProps & {
  question: SingleSelectQuestion,
};

export default function SingleSelectFeedback({question}: SingleSelectProps) {

  const answeredOption = question.getAnswer();
  const correctOption = question.getCorrectOption();
  const correct = answeredOption.id === correctOption.id;

  return (
    <View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        { !correct &&
          <View
            style={[
              styles.optionButton,
              styles.incorrectOption,
            ]}
          >
            <Text style={styles.optionText}>{answeredOption.text}</Text>
          </View>
        }
        <View
          style={[
            styles.optionButton,
            styles.correctOption,
          ]}
        >
          <Text style={styles.optionText}>{correctOption.text}</Text>
        </View>
      </View>

      {/* Feedback */}
      <View>
        <Text>{answeredOption.feedback}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
  correctOption: {
    backgroundColor: "#c8f7c5",
    borderColor: "#2fae19",
  },
  incorrectOption: {
    backgroundColor: "#FFE4E4",
    borderColor: "#FF0000",
  },
  disabledOption: {
    opacity: 0.6,
  },
  feedbackContainer: {
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  feedbackText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    textAlign: "center",
  },
  practiceButtonContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  practiceButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 160,
    shadowColor: "#6C63FF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  practiceButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  matchButton: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    maxHeight: "60%",
  },

});
