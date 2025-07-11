import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuest } from '@/src/hooks/useQuest';
import { Stack } from 'expo-router';

export default function QuestionExplanationScreen() {
  const { questID, questionID } = useLocalSearchParams<{
    questID?: string;
    questionID?: string;
  }>();
  const { getQuestion, getAnswer, getOptions, getAllQuestions } = useQuest();
  const router = useRouter();

  if (!questionID || !questID) {
    return null;
  }

  const question = getQuestion(questionID);
  const answer = getAnswer(question);
  const options = getOptions(question);
  const allQuestions = getAllQuestions();
  const currentIndex = allQuestions.findIndex((q) => q.id === questionID);
  const progress = (currentIndex + 1) / allQuestions.length;

  // Debug logging
  console.log('Question practiceId:', question.practiceId);
  console.log('Question object:', question);

  // Find the selected option index
  const selectedOptionIndex = options.findIndex(opt => opt.id === answer.option.id);
  
  // Find correct answer indices
  const correctIndices = question.correctAnswers?.map(ca => Number(ca)) || [];

  const handlePracticeMore = () => {
    // Check if there's a practice question available
    if (question.practiceId) {
      // Navigate to practice question with original question context
      router.push(`/quests/${questID}/practice/${question.practiceId}?originalQuestionID=${questionID}`);
    } else {
      // Navigate to next question or quest completion
      if (answer.nextQuestion === null) {
        router.replace(`/quests/${questID}`);
      } else {
        router.replace(`/quests/${questID}/questions/${answer.nextQuestion.id}`);
      }
    }
  };

  const getOptionStyle = (index: number) => {
    if (correctIndices.includes(index)) {
      return styles.correctOption;
    } else if (index === selectedOptionIndex) {
      return styles.incorrectOption;
    }
    return styles.optionButton;
  };

  const buttonText = question.practiceId ? 'PRACTICE MORE' : 'CONTINUE';
  console.log('Button text:', buttonText);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {/* Fixed progress bar and back arrow at the top */}
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingTop: 87, paddingHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backArrowContainer}>
            <Image
              source={require('@/src/assets/images/arrow.png')}
              style={styles.backArrow}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={[styles.progressBarSteps, { flex: 1 }]}>
            {allQuestions.map((_, step) => (
              <View
                key={step}
                style={[
                  styles.progressStep,
                  step === 0 ? styles.progressStepFirst : styles.progressStepSmall,
                  step <= currentIndex ? styles.progressStepActive : styles.progressStepInactive,
                ]}
              />
            ))}
          </View>
        </View>
        {/* Scrollable content below */}
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Number */}
          <Text style={styles.questionNumber}>Question {currentIndex + 1}</Text>

          {/* Question Text */}
          <Text style={styles.questionText}>{question.prompt}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <View
                key={option.id}
                style={[
                  styles.optionButton,
                  getOptionStyle(index),
                ]}
              >
                <Text style={[
                  styles.optionText,
                  correctIndices.includes(index) && styles.correctOptionText,
                  index === selectedOptionIndex && !correctIndices.includes(index) && styles.incorrectOptionText,
                ]}>
                  {option.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Explanation */}
          {question.incorrectResponse && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <Text style={styles.explanationText}>{question.incorrectResponse}</Text>
            </View>
          )}

          {/* Practice More Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.practiceMoreButton} onPress={handlePracticeMore}>
              <Text style={styles.practiceMoreText}>
                {buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingBottom: 50,
  },
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
    backgroundColor: '#eee',
  },
  backArrowContainer: {
    padding: 8,
    marginRight: 8,
  },
  backArrow: {
    width: 32,
    height: 24,
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
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  incorrectOption: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  optionText: {
    fontSize: 16,
    color: '#222',
  },
  correctOptionText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  incorrectOptionText: {
    color: '#C62828',
    fontWeight: 'bold',
  },
  explanationContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  practiceMoreButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: 'center',
  },
  practiceMoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
}); 