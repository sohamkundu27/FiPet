import { UserSingleSelectQuestion } from "@/src/services/quest/UserQuestion";
import { View, StyleSheet, Text } from "react-native";
import { FeedbackProps } from "./FeedbackRenderer";

type SingleSelectProps = FeedbackProps & {
  question: UserSingleSelectQuestion,
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
