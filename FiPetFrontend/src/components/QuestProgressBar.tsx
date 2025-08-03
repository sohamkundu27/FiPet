import { View, StyleSheet, ViewStyle } from "react-native";
import React from "react";
import { Question } from "../services/quest/Question";


type QuestProgressBarProps = (
  {
    questions: Question[],
    questionID: string,
  } |
  {
    numSteps: number,
    currentStep: number,
  }
) & {style?: ViewStyle};

export default function QuestProgressBar({questions, questionID, style}: {
  questions: Question[],
  questionID: string,
  style?: ViewStyle
}): React.JSX.Element;
export default function QuestProgressBar({numSteps, currentStep, style}: {
  numSteps: number,
  currentStep: number,
  style?: ViewStyle,
}): React.JSX.Element;

export default function QuestProgressBar(args: QuestProgressBarProps): React.JSX.Element {

  const style = args.style;
  let numSteps: number = 0;
  let currentStep: number = 0;
  if ( "questionID" in args ) {
    const currentQuestion = args.questions.find((q) => q.id === args.questionID);
    if (currentQuestion) {
      if (currentQuestion.isPractice) {
        // For practice questions, find the base question's index in the main questions array
        const baseQuestionOrder = Math.floor(currentQuestion.order);
        currentStep = args.questions.findIndex((q) => !q.isPractice && q.order === baseQuestionOrder);
      } else {
        // For regular questions, find the index in the questions array
        currentStep = args.questions.findIndex((q) => q.id === args.questionID);
      }
    } else {
      currentStep = args.questions.findIndex((q) => q.id === args.questionID);
    }
    numSteps = args.questions.length;
  } else {
    numSteps = args.numSteps;
    currentStep = args.currentStep;
  }

  const stepList: React.JSX.Element[] = [];

  for (let step = 0; step < numSteps; step ++) {
    stepList.push(
        <View
          key={step}
          style={[
            styles.progressStep,
            step === 0 ? styles.progressStepFirst : styles.progressStepSmall,
            step <= currentStep ? styles.progressStepActive : styles.progressStepInactive,
          ]}
        />
    );
  }

  return (
    <View style={{...style, ...styles.progressBarSteps}}>
      {stepList}
    </View>
  );
};

const styles = StyleSheet.create({
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
});
