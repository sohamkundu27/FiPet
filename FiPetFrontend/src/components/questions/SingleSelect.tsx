import { useAuth } from "@/src/hooks/useRequiresAuth";
import { UserSingleSelectOption } from "@/src/services/quest/UserOption";
import { UserSingleSelectQuestion } from "@/src/services/quest/UserQuestion";
import { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { QuestionProps } from "./QuestionRenderer";

type SingleSelectProps = QuestionProps & {
  question: UserSingleSelectQuestion,
};

export default function SingleSelect({question, onSubmit, ref, preSubmit, onError, onReadyForSubmit, onUnreadyForSubmit}: SingleSelectProps) {

  const {user} = useAuth();

  const options = question.getOptions();

  useEffect(() => {
    options.sort(() => Math.random() - 0.5);
  }, [options]);

  const [selectedOption, setSelected] = useState<UserSingleSelectOption|null>(null);

  ref.current = {
    submit: () => {
      preSubmit();
      if (!selectedOption) {
        onError("No option selected!");
        return;
      }
      question.answer(selectedOption, user).then((results) => {
        onSubmit(results.correct, results.reward);
      }).catch((err) => {
        console.error(err);
        onError("An error occured when attempting to answer the question.");
      });
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
