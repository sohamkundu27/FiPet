import React, { useState } from 'react';
import { View, Button, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { createQuest, getActiveQuests, getQuestById, deleteQuest } from '@/src/services/questService'; // Use your correct import path
import { exampleQuest, Quest } from '@/src/types/quest'; // Use your correct import path
import { ThemedText } from '@/src/components/ThemedText'; // Assuming you have ThemedText
import { ThemedView } from '@/src/components/ThemedView'; // Assuming you have ThemedView

const TestQuestServiceScreen = () => {
  const [message, setMessage] = useState('');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdQuestId, setCreatedQuestId] = useState<string | null>(null);

  const handleCreateQuest = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { id, ...questToCreate } = exampleQuest; // Omit ID for creation
      const createdQuest = await createQuest(questToCreate);
      setMessage(`Quest created successfully! ID: ${createdQuest.id}`);
      setCreatedQuestId(createdQuest.id);
      console.log('Created Quest:', createdQuest);
    } catch (error: any) {
      setMessage(`Error creating quest: ${error.message}`);
      console.error('Error creating quest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetActiveQuests = async () => {
    setLoading(true);
    setMessage('');
    setQuests([]);
    try {
      const activeQuests = await getActiveQuests();
      setQuests(activeQuests);
      setMessage(`Found ${activeQuests.length} active quests.`);
      console.log('Active Quests:', activeQuests);
    } catch (error: any) {
      setMessage(`Error getting active quests: ${error.message}`);
      console.error('Error getting active quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCreatedQuest = async () => {
      if (!createdQuestId) {
          setMessage("No quest ID available to fetch. Create one first.");
          return;
      }
      setLoading(true);
      setMessage('');
      try {
          const quest = await getQuestById(createdQuestId);
          if (quest) {
              setMessage(`Fetched quest with ID ${createdQuestId}: ${quest.title}`);
              console.log(`Fetched Quest ${createdQuestId}:`, quest);
          } else {
              setMessage(`Quest with ID ${createdQuestId} not found in Firestore.`);
              console.log(`Quest with ID ${createdQuestId} not found.`);
          }
      } catch (error: any) {
          setMessage(`Error getting quest by ID ${createdQuestId}: ${error.message}`);
          console.error(`Error getting quest by ID ${createdQuestId}:`, error);
      } finally {
          setLoading(false);
      }
  };

    const handleDeleteCreatedQuest = async () => {
        if (!createdQuestId) {
            setMessage("No quest ID available to delete.");
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            await deleteQuest(createdQuestId);
            setMessage(`Quest with ID ${createdQuestId} deleted successfully.`);
            setCreatedQuestId(null);
            setQuests([]);
            console.log(`Quest with ID ${createdQuestId} deleted.`);
        } catch (error: any) {
            setMessage(`Error deleting quest with ID ${createdQuestId}: ${error.message}`);
            console.error(`Error deleting quest with ID ${createdQuestId}:`, error);
        } finally {
            setLoading(false);
        }
    };


  return (
    <ThemedView style={styles.container}> 
      <ThemedText>{message}</ThemedText>
      {loading && <ActivityIndicator size="small" color="#0000ff" />} 
      <Button title="Create Example Quest" onPress={handleCreateQuest} disabled={loading} />
      <Button title="Get Active Quests" onPress={handleGetActiveQuests} disabled={loading} />
      <Button title="Get Last Created Quest" onPress={handleGetCreatedQuest} disabled={loading || !createdQuestId} /> 
      <Button title="Delete Last Created Quest" onPress={handleDeleteCreatedQuest} disabled={loading || !createdQuestId} /> 


      <ScrollView style={styles.scrollView}> 
        {quests.map(q => (
          <View key={q.id} style={styles.questItem}> 
            <ThemedText>ID: {q.id}</ThemedText>
            <ThemedText>Title: {q.title}</ThemedText>
            <ThemedText>Active: {q.isActive ? 'Yes' : 'No'}</ThemedText>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80, // Adjusted padding
  },
  scrollView: {
    marginTop: 20,
  },
  questItem: {
    marginVertical: 10,
    borderWidth: 1,
    padding: 10,
    borderColor: '#ccc',
  },
});

export default TestQuestServiceScreen; 