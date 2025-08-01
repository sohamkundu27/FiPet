import { useAuth } from "@/src/hooks/useRequiresAuth";
import { UserSingleSelectOption } from "@/src/services/quest/UserOption";
import { UserSingleSelectQuestion } from "@/src/services/quest/UserQuestion";
import { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { QuestionProps } from "./QuestionRenderer";
import { useLocalSearchParams } from "expo-router";

type SingleSelectProps = QuestionProps & {
  question: UserSingleSelectQuestion,
};

// Helper function to call the answeredQuestion Firebase function
const recordAnsweredQuestion = async (
  userId: string,
  questId: string,
  questionId: string,
  isCorrect: boolean,
  answer: any
) => {
  try {
    // Use emulator URL since the project is using Firebase emulators
    const functionUrl = 'http://10.0.2.2:5001/fipet-521d1/us-central1/answeredQuestion';
    
    console.log('Calling Firebase function with data:', {
      userId,
      questId,
      questionId,
      isCorrect,
      answer
    });

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        questId,
        questionId,
        isCorrect,
        answer,
      }),
    });

    console.log('Firebase function response status:', response.status);
    console.log('Firebase function response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firebase function error response:', errorText);
      throw new Error(`Failed to record answered question: ${response.status} ${errorText}`);
    }

    const responseData = await response.text();
    console.log('Firebase function success response:', responseData);
  } catch (error) {
    console.error('Error recording answered question:', error);
    throw error;
  }
};

export default function SingleSelect({question, onSubmit, rewardHook, ref, preSubmit, onError, onReadyForSubmit, onUnreadyForSubmit}: SingleSelectProps) {

  const {user} = useAuth();
  const { questID } = useLocalSearchParams<{ questID: string }>();

  const incorrectOptions = question.getOptions();
  const correctOption = question.getCorrectOption();
  const options = useMemo(() => [...incorrectOptions, correctOption], [incorrectOptions,correctOption]);

  useEffect(() => {
    options.sort(() => Math.random() - 0.5);
  }, [options]);

  const [selectedOption, setSelected] = useState<UserSingleSelectOption|null>(null);

  ref.current = {
    submit: async () => {
      preSubmit();
      if (!selectedOption) {
        onError("No option selected!");
        return;
      }

      try {
        // Use Firebase function instead of direct Firestore write
        const isCorrect = selectedOption.correct;
        
        // Call the Firebase function to record the answer
        if (user && questID) {
          await recordAnsweredQuestion(
            user.uid,
            questID,
            question.id,
            isCorrect,
            {
              optionId: selectedOption.id,
              optionText: selectedOption.text,
              correct: selectedOption.correct,
              correctOptionId: question.getCorrectOption().id
            }
          );
        }

        // Calculate reward (similar to original logic)
        let reward = question.reward;
        if (rewardHook) {
          reward = await rewardHook(isCorrect, question.reward);
        }

        // Mark the question as answered locally so the UI can show feedback
        question.markAsAnswered(selectedOption, reward);

        // Call onSubmit with the results
        onSubmit(isCorrect, reward);
      } catch (err) {
        console.error(err);
        onError("An error occurred when attempting to answer the question.");
      }
    },
  };

  return (
    <View style={styles.optionsContainer}>
      {options.map((option) => {

        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => {
              if (onReadyForSubmit) {
                onReadyForSubmit();
              }
              setSelected(option);
            }}
            style={[
              styles.imageButton,
              selectedOption?.id === option.id && styles.selectedOption,
            ]}
          >
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        );
      })}
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
  imageButton: {
    width: "90%",
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: "#ccc",
    elevation: 2,
    alignItems: "center",
    backgroundColor: "#fff",
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
