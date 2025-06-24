import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native";
import { Question } from "@/src/types/quest";

// Option type for internal use
interface QuestionOption {
  id: string;
  text: string;
}

type Props = {
  question: Question;
  selectedOption: QuestionOption | QuestionOption[] | null;
  onSelect: (option: QuestionOption ) => void;
  disabled: boolean;
};

export default function QuestionRenderer({
  question,
  selectedOption,
  onSelect,
  disabled,
}: Props) {
  
  // Convert string options to option objects
  const options: QuestionOption[] = question.options.map((optionText, index) => ({
    id: `option_${question.id}_${index}`,
    text: optionText
  }));

  switch (question.type) {
    case "trueFalse":
      return (
        <View style={styles.optionsContainer}>
          {["True", "False"].map((label) => {
            const option = options.find((o) => o.text === label);
            if (!option) return null;
            const isSelected = (selectedOption as QuestionOption | null)?.id === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                disabled={disabled}
                onPress={() => onSelect(option)}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOption,
                  disabled && !isSelected && styles.disabledOption,
                ]}
              >
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );

    case "regular":
      return (
        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const isSelected = (selectedOption as QuestionOption | null)?.id === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                disabled={disabled}
                onPress={() => onSelect(option)}
                style={[
                  styles.imageButton,
                  isSelected && styles.selectedOption,
                  disabled && !isSelected && styles.disabledOption,
                ]}
              >
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );

    case "multiselect":
      return (
        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const isSelected = Array.isArray(selectedOption)
              ? selectedOption.some((o) => 'id' in o && o.id === option.id)
              : false;

            return (
              <TouchableOpacity
                key={option.id}
                disabled={disabled}
                onPress={() => onSelect(option)}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOption,
                  disabled && !isSelected && styles.disabledOption,
                ]}
              >
                <Text style={styles.optionText}>{option.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );

    
    default:
      return null;
  }
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