import { StyleSheet, Button } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useQuest } from "@/src/hooks/useQuest";
import { ThemedText } from "@/src/components/ThemedText";
import { Outcome, QuestionOption } from "@/src/types/quest";
import { QuestAnswer } from "@/src/components/questProvider";
import { useState } from "react";
import { ThemedView } from "@/src/components/ThemedView";

export default function QuestQuestion() {
  const { questionID, questID } = useLocalSearchParams<{
    questID?: string
    questionID?: string,
  }>();
  const { getOptions, getAnswer, hasAnswer, getQuestion, selectOption } = useQuest();
  let [answer, setAnswer] = useState<QuestAnswer|null>(null);
  let [questionHasAnswer, setHasAnswer] = useState<boolean|null>(null);

  if (questionID === undefined) {
    throw new Error("Question ID is undefined!");
  }
  const question = getQuestion(questionID);

  function handleOptionSelect(option: QuestionOption) {
  if ( questionHasAnswer ) {
  	return;
  }
    setAnswer( selectOption(question.id, option.id) );
    setHasAnswer( true );
  }

  const options = getOptions(question);
  questionHasAnswer = hasAnswer(question);
  if ( questionHasAnswer ) {
    answer = getAnswer(question);
  }

  function OutcomeReward({ outcome }: { outcome: Outcome}) {

    if ( outcome.itemReward ) {
  	  return (
  		  <>
  			  <ThemedText>You found a new item! [{outcome.itemReward.name}]</ThemedText>
  			  <ThemedText>Description: {outcome.itemReward.description}</ThemedText>
        </>
  	  );
    }
  }

  function OutcomeDisplay() {

  	  if ( questionHasAnswer && answer != null ) {
  		  return (
  			  <>
  				  <ThemedText style={{fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center"}}>{answer.outcome.text}</ThemedText>
  				  <ThemedText style={{marginBottom: 20}}>You've {answer.outcome.xpReward >= 0 ? 'gained' : 'lost'} {Math.abs(answer.outcome.xpReward)} xp!</ThemedText>
  				  <OutcomeReward outcome={answer.outcome} />
  			  </>
  		  );
  	  }
  }

  function ContinueButton() {
    if ( questionHasAnswer  && answer != null ) {
  	  if ( answer.nextQuestion === null ) {
  		  return (
  			  <Link style={{fontSize: 26, backgroundColor: 'blue', color: 'white', borderRadius: 5, width: "70%", textAlign: "center", padding: 7, margin: 10}} href={ `/quests/${questID}`}>Continue</Link>
  		  );
  	  } else {
  		  return (
  			  <Link style={{fontSize: 26, backgroundColor: 'blue', color: 'white', borderRadius: 5, width: "70%", textAlign: "center", padding: 7, margin: 10}} href={ `/quests/${questID}/questions/${answer.nextQuestion.id}`}>Continue</Link>
  		  );
  	  }
    }

  }

  return (
    <ThemedView style={{height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 30}}>
      <ThemedText style={styles.heading}>{question.text}</ThemedText>
    <ThemedView style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10%", paddingTop: "10%" }}>
  	  {options.map((option) => {
  		  if ( answer?.option.id === option.id ) {
  			  return (
  				  <Button color={styles.correctButton.backgroundColor} title={option.text} key={option.id} onPress={() => { handleOptionSelect(option); }}></Button>
  			  );
  		  } else if (questionHasAnswer) {
  				return (
  				  <Button disabled={true} title={option.text} key={option.id} onPress={() => { handleOptionSelect(option); }}></Button>
  				);
  		  } else {
  				return (
  				  <Button color={styles.button.backgroundColor} title={option.text} key={option.id} onPress={() => { handleOptionSelect(option); }}></Button>
  				);
  		  }
  	  })}
    </ThemedView>
    <ThemedView style={{}}>
  	  <OutcomeDisplay/>
    </ThemedView>
    <ThemedView style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
  	  <ContinueButton />
    </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: 'black', // changed to black
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#632121',
    textAlign: 'center',
    letterSpacing: 1,
  },
  button: {
    backgroundColor: '#186eaf',
  },
  correctButton: {
    backgroundColor: '#2fae19',
  },
  incorrectButton: {
    backgroundColor: '#821b17',
  },
  unselectedButton: {
    backgroundColor: '#324a5d',
  color: '#999',
  },
  bold: {
    fontWeight: 'bold',
    color: '#ff7f50',
  },
  question: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    backgroundColor: '#ffe066',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#b5ead7',
    shadowColor: '#ffe066',
    shadowOpacity: 0.13,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
