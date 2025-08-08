import { View, StyleSheet, ViewStyle } from "react-native";
import React from "react";
import { UserQuestion } from "../services/quest/UserQuestion";


type QuestProgressBarProps = (
  {
    questions: UserQuestion[],
    questionID: string,
    currentQuestion?: UserQuestion,
    hasPreQuest?: boolean,
    preQuestCompleted?: boolean,
    isPreQuest?: boolean,
  } |
  {
    numSteps: number,
    currentStep: number,
    isPreQuest?: boolean,
    questions?: UserQuestion[],
    hasPreQuest?: boolean,
  }
) & {style?: ViewStyle};

export default function QuestProgressBar({questions, questionID, currentQuestion, hasPreQuest, preQuestCompleted, isPreQuest, style}: {
  questions: UserQuestion[],
  questionID: string,
  currentQuestion?: UserQuestion,
  hasPreQuest?: boolean,
  preQuestCompleted?: boolean,
  isPreQuest?: boolean,
  style?: ViewStyle
}): React.JSX.Element;
export default function QuestProgressBar({numSteps, currentStep, isPreQuest, questions, hasPreQuest, style}: {
  numSteps: number,
  currentStep: number,
  isPreQuest?: boolean,
  questions?: UserQuestion[],
  hasPreQuest?: boolean,
  style?: ViewStyle,
}): React.JSX.Element;

export default function QuestProgressBar(args: QuestProgressBarProps): React.JSX.Element {

  const style = args.style;
  let numSteps: number = 0;
  let currentStep: number = 0;
  let hasPreQuest: boolean = false;
  let preQuestCompleted: boolean = false;
  let isPreQuest: boolean = false;
  
  if ( "questionID" in args ) {
    hasPreQuest = args.hasPreQuest || false;
    preQuestCompleted = args.preQuestCompleted || false;
    isPreQuest = args.isPreQuest || false;
    
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
    isPreQuest = args.isPreQuest || false;
    hasPreQuest = args.hasPreQuest || false;
  }

  // For pre-quest reading screen (uses numSteps/currentStep format)
  if (isPreQuest) {
    const progressPercentage = ((currentStep + 1) / numSteps) * 100;
    const questionCount = (args as any).questions?.length || 3; // Fallback to 3 if questions not provided
    
    return (
      <View style={{...style, ...styles.progressBarSteps}}>
        <View style={[styles.progressStep, styles.progressStepLarge, styles.progressStepInactive]}>
          <View
            style={[
              styles.progressStepFill,
              {
                width: `${progressPercentage}%`,
              }
            ]}
          />
        </View>
        {/* Add small bars for questions that will appear later */}
        {Array.from({ length: questionCount }, (_, index) => (
          <View
            key={`future-question-${index}`}
            style={[
              styles.progressStep,
              styles.progressStepSmall,
              styles.progressStepInactive,
            ]}
          />
        ))}
      </View>
    );
  }

  // For question screens with pre-quest support
  const stepList: React.JSX.Element[] = [];
  
  // Add pre-quest section if it exists
  if (hasPreQuest) {
    stepList.push(
      <View
        key="prequest"
        style={[
          styles.progressStep,
          styles.progressStepLarge,
          preQuestCompleted ? styles.progressStepActive : styles.progressStepInactive,
        ]}
      />
    );
  }

  // Add question sections
  for (let step = 0; step < numSteps; step++) {
    stepList.push(
      <View
        key={hasPreQuest ? `question-${step}` : step}
        style={[
          styles.progressStep,
          hasPreQuest ? styles.progressStepSmall : styles.progressStepSmall,
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
    position: 'relative',
  },
  progressStepFirst: {
    flex: 3,
    height: 10,
  },
  progressStepLarge: {
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
  progressStepFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 4,
  },
});
