/**
 * This file defines the QuestProvider which provides subsequent pages with information about a single quest.
 *
 * TODOS:
 * TODO: Update to use Firebase quests instead of ignoring 'questID' for the single example quest.
 * TODO: Update to use Firebase to track quest completion. (stored in memory at the moment using an AnswerDict)
 *
 * NOTES:
 * I considered whether or not to make the instance of this provider provide multiple quests,
 * but I decided I'd keep it simple for now. This could be a possible change in the future,
 * mainly if /quests/index.tsx wants to use information from this component.
 */
import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Quest, Question } from "../types/quest";
import { getQuestWithQuestions } from "../services/questService";
import { doc, setDoc, collection } from '@firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

// Extended Question type for internal use with option objects
interface ExtendedQuestion extends Question {
  optionObjects: Array<{
    id: string;
    text: string;
    nextQuestionId?: string;
    outcomeId?: string;
  }>;
}

// Simple outcome type
interface SimpleOutcome {
  id: string;
  text: string;
  xpReward: number;
  isCorrectAnswer: boolean;
}

/**
 * Helper types for saving answers in memory.
 */
export type QuestAnswer = {
  option: { id: string; text: string };
  outcome: SimpleOutcome;
  nextQuestion: ExtendedQuestion | null;
};

type QuestAnswerDict = {
  [key: string]: QuestAnswer
};

/***** Function types. ******/
/**
 * Returns the furthest question the user has reached in the quest.
 *
 * @throws {Error} if the quest is completed.
 */
type getFurthestQuestionFunType = () => ExtendedQuestion;

/**
 * Checks if the quest is complete.
 */
type isCompleteFunType = () => boolean;

/**
 * Gets a question from the quest and returns false on failure.
 *
 * @throws {Error} if question doesn't exist in the quest.
 */
type getQuestionFunType = ( questionID: string ) => ExtendedQuestion;

/**
 * Gets the options for a question.
 *
 * @throws {Error} if the question doesn't exist in the quest.
 */
type getOptionsFunType = ( question: ExtendedQuestion ) => Array<{ id: string; text: string }>;

/**
 * Selects an option given for the current quest question. Marks the current question as answered.
 *
 * @param {string} questionID is the id of the question being answered.
 * @param {string} optionID is the id of the option selected.
 *
 * @throws {Error} if the question does not exist in the quest.
 * @throws {Error} if the option does not exist in the question.
 *
 * @returns the outcome object and the next question if there is a next question.
 */
type selectOptionFunType = ( questionID: string, optionID: string) => Promise<QuestAnswer>;

/**
 * Gets the current answer to the question or false if it hasn't been answered.
 *
 * @throws {Error} if question hasn't been answered.
 *
 * @see hasAnswer
 */
type getAnswerFunType = ( question: ExtendedQuestion ) => QuestAnswer;

/**
 * Determines if a question has an answer.
 *
 * @see getAnswer
 */
type hasAnswerFunType = ( question: ExtendedQuestion ) => boolean;

/**
 * The type that useQuest returns.
 */
type QuestContextType = {
  getFurthestQuestion: getFurthestQuestionFunType,
  isComplete: isCompleteFunType,
  getQuestion: getQuestionFunType,
  selectOption: selectOptionFunType,
  getOptions: getOptionsFunType,
  getAnswer: getAnswerFunType,
  hasAnswer: hasAnswerFunType,
  getAllQuestions: () => ExtendedQuestion[],
  loading: boolean,
  error: string | null,
  quest: Quest | null,
  getCorrectAnswerRatio: () => number,
};

export const QuestContext = React.createContext<QuestContextType>(null!);

export const QuestProvider = ({ children, questID }: { children: any, questID: string }) => {
  const [quest, setQuest] = useState<Quest | null>(null);
  const [questions, setQuestions] = useState<ExtendedQuestion[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<QuestAnswerDict>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch quest and questions on mount
  useEffect(() => {
    const fetchQuestData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const questData = await getQuestWithQuestions(questID);
        if (!questData) {
          setError(`Quest with ID ${questID} not found`);
          return;
        }
        
        setQuest(questData.quest);
        
        // Convert questions to ExtendedQuestion format
        const extendedQuestions: ExtendedQuestion[] = questData.questions.map((q, questionIndex) => {
          console.log(`Question ${questionIndex}:`, {
            id: q.id,
            prompt: q.prompt,
            options: q.options,
            correctAnswers: q.correctAnswers,
            correctAnswersTypes: q.correctAnswers?.map(ca => typeof ca),
            correctAnswersLength: q.correctAnswers?.length,
            type: q.type
          });
          
          return {
            ...q,
            optionObjects: q.options.map((optionText, optionIndex) => ({
              id: `option_${q.id}_${optionIndex}`,
              text: optionText,
              nextQuestionId: questionIndex < questData.questions.length - 1 ? questData.questions[questionIndex + 1]?.id : undefined,
              outcomeId: `outcome_${q.id}_${optionIndex}`
            }))
          };
        });
        
        setQuestions(extendedQuestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quest data');
        console.error('Error fetching quest data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestData();
  }, [questID]);

  // if _furthestQuestion is null, it is assumed that the quest is complete.
  let _furthestQuestion: ExtendedQuestion | null = questions.length > 0 ? questions[0] : null;

  /**
   * Helper function for updating the furthest question reached.
   */
  const _updateFurthestQuestion = () => {
    // Start from the first question
    _furthestQuestion = questions.length > 0 ? questions[0] : null;
    
    console.log('Updating furthest question. Starting with:', _furthestQuestion?.prompt);
    console.log('Answered questions:', Object.keys(answeredQuestions));
    
    // Find the first unanswered question
    while ( _furthestQuestion != null && _furthestQuestion.id in answeredQuestions ) {
      let answer: QuestAnswer = answeredQuestions[_furthestQuestion.id];
      console.log('Question answered:', _furthestQuestion.prompt, 'Next question:', answer.nextQuestion?.prompt || 'None');
      
      if (answer.nextQuestion) {
        _furthestQuestion = answer.nextQuestion;
      } else {
        // No next question, quest is complete
        _furthestQuestion = null;
        break;
      }
    }
    
    console.log('Final furthest question:', _furthestQuestion?.prompt || 'None (complete)');
  }
  
  const getFurthestQuestion: getFurthestQuestionFunType = () => {
    _updateFurthestQuestion();

    if ( null === _furthestQuestion ) {
      throw new Error( "Quest has no more questions: it is complete!" );
    }

    return _furthestQuestion;
  }

  const isComplete: isCompleteFunType = () => {
    _updateFurthestQuestion();
    return _furthestQuestion === null;
  }

  const getAllQuestions = () => {
    return questions;
  };

  const getQuestion: getQuestionFunType = ( questionID ) => {
    for ( let questionOpt of questions ) {
      if ( questionID === questionOpt.id ) {
        return questionOpt;
      }
    }

    throw new Error( "Question doesn't exist in quest." );
  }

  const selectOption: selectOptionFunType = async ( questionID, optionID ) => {
    let question = getQuestion( questionID );

    // find selected option
    let selectedOption: { id: string; text: string } | null = null;
    let selectedOptionData: { id: string; text: string; nextQuestionId?: string } | null = null;
    for ( let option of question.optionObjects ) {
      if ( option.id === optionID ) {
        selectedOption = { id: option.id, text: option.text };
        selectedOptionData = option;
        break;
      }
    }
    if ( selectedOption === null ) {
      throw new Error( "Invalid Quest Option" );
    }

    // find next question
    let nextQuestion: ExtendedQuestion | null = null;
    if ( selectedOptionData?.nextQuestionId !== undefined ) {
      nextQuestion = getQuestion( selectedOptionData.nextQuestionId ) || null;
      if ( nextQuestion === null ) {
        throw new Error( "Invalid Quest Question" );
      }
    }
    
    // Check if the selected option is correct
    const selectedText = selectedOption.text.trim();
    
    // Handle cases where correctAnswers might be empty or malformed
    let isCorrect = false;
    if (question.correctAnswers && question.correctAnswers.length > 0) {
      // Find the index of the selected option
      const selectedOptionIndex = question.optionObjects.findIndex(opt => opt.id === selectedOption.id);
      
      // Check if the selected option index is in the correctAnswers array
      isCorrect = question.correctAnswers.some(correctAnswer => {
        // Skip undefined or null values
        if (correctAnswer === undefined || correctAnswer === null) {
          console.warn('Invalid correct answer found:', correctAnswer);
          return false;
        }
        // Convert to number and compare with selected option index
        const correctIndex = Number(correctAnswer);
        return correctIndex === selectedOptionIndex;
      });
    } else {
      // Fallback: if no correct answers defined, assume first option is correct
      console.warn('No correct answers defined for question:', question.prompt);
      isCorrect = question.optionObjects[0]?.id === selectedOption.id;
    }
    
    // Debug logging
    console.log('Question:', question.prompt);
    console.log('Selected option:', selectedText);
    console.log('Selected option index:', question.optionObjects.findIndex(opt => opt.id === selectedOption.id));
    console.log('Correct answer indices:', question.correctAnswers);
    console.log('Is correct:', isCorrect);
    console.log('Next question ID:', selectedOptionData?.nextQuestionId);
    console.log('Next question found:', nextQuestion?.prompt || 'None (quest complete)');
    
    // Create a simple outcome
    const outcome: SimpleOutcome = {
      id: selectedOption.id,
      text: selectedOption.text,
      xpReward: isCorrect ? 10 : 0, // XP reward based on correctness
      isCorrectAnswer: isCorrect
    };

    const newAnsweredQuestions = { ...answeredQuestions };
    newAnsweredQuestions[question.id] = {
      option: selectedOption,
      outcome: outcome,
      nextQuestion: nextQuestion,
    };
    setAnsweredQuestions(newAnsweredQuestions);
    
    // Save answer to Firestore
    if (user) {
      try {
        const userProgressRef = doc(db, 'users', user.uid, 'questProgress', questID);
        const answerRef = doc(collection(userProgressRef, 'answers'), question.id);
        await setDoc(answerRef, {
          questionId: question.id,
          option: selectedOption,
          outcome: outcome,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error saving answer to Firestore:', error);
      }
    }
    
    return newAnsweredQuestions[question.id];
  }

  const hasAnswer: hasAnswerFunType = ( question ) => {
    return question.id in answeredQuestions;
  }

  const getAnswer = ( question: ExtendedQuestion ): QuestAnswer => {
    if ( ! hasAnswer( question ) ) {
      throw new Error( "Question hasn't been answered" );
    }
    return answeredQuestions[question.id];
  }

  const getOptions: getOptionsFunType = ( question ) => {
    return question.optionObjects.map(opt => ({ id: opt.id, text: opt.text }));
  }

  // Helper to get correct answer ratio
  const getCorrectAnswerRatio = () => {
    const total = questions.length;
    if (total === 0) return 0;
    let correct = 0;
    for (const q of questions) {
      const ans = answeredQuestions[q.id];
      if (ans && ans.outcome.isCorrectAnswer) correct++;
    }
    return correct / total;
  };

  // Show loading or error state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Loading quest...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: 'red', textAlign: 'center' }}>Error: {error}</Text>
      </View>
    );
  }

  if (!quest || questions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center' }}>No quest data available</Text>
      </View>
    );
  }

  return (
    <QuestContext.Provider value={{ 
      isComplete, 
      getFurthestQuestion, 
      getQuestion, 
      getOptions, 
      selectOption, 
      getAnswer, 
      hasAnswer, 
      getAllQuestions,
      loading,
      error,
      quest,
      getCorrectAnswerRatio,
    }}>
      {children}
    </QuestContext.Provider>
  );
};
