import { View, StyleSheet, ViewStyle } from "react-native";
import React from "react";
import { Question } from "../services/quest/Question";


type QuestProgressBarProps = (
  {
    questions: Question[],
    questionID: string,
    currentQuestion?: Question,
  } |
  {
    numSteps: number,
    currentStep: number,
  }
) & {style?: ViewStyle};

export default function QuestProgressBar({questions, questionID, currentQuestion, style}: {
  questions: Question[],
  questionID: string,
  currentQuestion?: Question,
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
    // Use the passed currentQuestion if available, otherwise find it
    const currentQuestion = args.currentQuestion || args.questions.find((q) => q.id === args.questionID);
    
    if (currentQuestion) {
      if (currentQuestion.isPractice) {
        // For practice questions, use the base question order as the current step
        currentStep = Math.floor(currentQuestion.order);
      } else {
        // For regular questions, use the order as the current step
        currentStep = currentQuestion.order;
      }
    } else {
      // Fallback: try to find by ID in the questions array
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
