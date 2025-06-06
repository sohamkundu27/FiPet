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
import React, { useState } from "react";
import { Quest, Question, QuestionOption, Outcome, exampleQuest } from "../types/quest";

/**
 * Helper types for saving answers in memory.
 */
export type QuestAnswer = {
  option: QuestionOption,
  outcome: Outcome,
  nextQuestion: Question|null
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
type getFurthestQuestionFunType = () => Question;

/**
 * Checks if the quest is complete.
 */
type isCompleteFunType = () => boolean;

/**
 * Gets a question from the quest and returns false on failure.
 *
 * @throws {Error} if question doesn't exist in the quest.
 */
type getQuestionFunType = ( questionID: string ) => Question;

/**
 * Gets the options for a question.
 *
 * @throws {Error} if the question doesn't exist in the quest.
 */
type getOptionsFunType = ( question: Question ) => QuestionOption[];

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
type selectOptionFunType = ( questionID: string, optionID: string) => QuestAnswer;

/**
 * Gets the current answer to the question or false if it hasn't been answered.
 *
 * @throws {Error} if question hasn't been answered.
 *
 * @see hasAnswer
 */
type getAnswerFunType = ( question: Question ) => QuestAnswer;

/**
 * Determines if a question has an answer.
 *
 * @see getAnswer
 */
type hasAnswerFunType = ( question: Question ) => boolean;

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
};

export const QuestContext = React.createContext<QuestContextType>(null!);

export const QuestProvider = ({ children, questID }: { children: any, questID: string }) => {

  const quest: Quest = exampleQuest;
  const [answeredQuestions, setAnsweredQuestions] = useState<QuestAnswerDict>({});

  // if _furthestQuestion is null, it is assumed that the quest is complete.
  let _furthestQuestion: Question|null = quest.questions[0];


  /**
   * Helper function for updating the furthest question reached.
   */
  const _updateFurthestQuestion = () => {
    while ( _furthestQuestion != null && _furthestQuestion.id in answeredQuestions ) {
      let answer: QuestAnswer = answeredQuestions[_furthestQuestion.id];
      _furthestQuestion = answer.nextQuestion;
    }
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

  const getQuestion: getQuestionFunType = ( questionID ) => {
    for ( let questionOpt of quest.questions ) {
      if ( questionID === questionOpt.id ) {
        return questionOpt;
      }
    }

    throw new Error( "Question doesn't exist in quest." );
  }

  const selectOption: selectOptionFunType = ( questionID, optionID ) => {

    let question = getQuestion( questionID );

    // find selected option
    let selectedOption: QuestionOption | null = null;
    for ( let option of question.options ) {
      if ( option.id === optionID ) {
        selectedOption = option;
        break;
      }
    }
    if ( selectedOption === null ) {
      throw new Error( "Invalid Quest Option" );
    }

    // find next question
    let nextQuestion: Question | null = null;
    if ( selectedOption.nextQuestionId !== undefined ) {
      nextQuestion = getQuestion( selectedOption.nextQuestionId ) || null;
      if ( nextQuestion === null ) {
        throw new Error( "Invalid Quest Question" );
      }
    }
    

    // find outcome
    let outcome: Outcome | null = null;
    for ( let outcomeOption of quest.outcomes ) {
      if ( outcomeOption.id === selectedOption.outcomeId ) {
        outcome = outcomeOption;
        break;
      }
    }
    if ( outcome === null ) {
      throw new Error( "Invalid Quest Outcome" );
    }

    answeredQuestions[question.id] = {
      option: selectedOption,
      outcome: outcome,
      nextQuestion: nextQuestion,
    };
    setAnsweredQuestions(answeredQuestions);
    
    return answeredQuestions[question.id];
  }

  const hasAnswer: hasAnswerFunType = ( question ) => {
    return question.id in answeredQuestions;
  }

  const getAnswer = ( question: Question ): QuestAnswer => {
    if ( ! hasAnswer( question ) ) {
      throw new Error( "Question hasn't been answered" );
    }
    return answeredQuestions[question.id];
  }

  const getOptions: getOptionsFunType = ( question ) => {
    return question.options;
  }

  return (
    <QuestContext.Provider value={{ isComplete, getFurthestQuestion, getQuestion, getOptions, selectOption, getAnswer, hasAnswer }}>
      {children}
    </QuestContext.Provider>
  );
};
