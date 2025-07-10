import React, { useState } from 'react';
import { View, Button, Text, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { updatePreQuestReadingImages, getPreQuestReadingById } from '@/src/services/preQuestReadingService';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { doc, setDoc } from '@firebase/firestore';
import { db } from '@/src/config/firebase';

const TestPreQuestImagesScreen = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [preQuestData, setPreQuestData] = useState<any>(null);
  const [testPreQuestId, setTestPreQuestId] = useState<string>('test-prequest-001');

  // Test image URLs (using placeholder images)
  const testImageUrls = {
    page1: 'https://picsum.photos/400/400?random=1',
    page2: 'https://picsum.photos/400/400?random=2',
    page3: 'https://picsum.photos/400/400?random=3',
    page4: 'https://picsum.photos/400/400?random=4'
  };

  const createTestPreQuest = async () => {
    setLoading(true);
    setMessage('');
    try {
      const testPreQuestData = {
        page1: {
          top: "Welcome to the test preQuest!",
          bottom: "This is page 1 of our test preQuest."
        },
        page2: {
          top: "Page 2 content",
          bottom: "This is page 2 of our test preQuest."
        },
        page3: {
          top: "Page 3 content",
          bottom: "This is page 3 of our test preQuest."
        },
        page4: {
          top: "Final page",
          bottom: "This is the final page of our test preQuest."
        }
      };

      const preQuestRef = doc(db, 'preQuestReadings', testPreQuestId);
      await setDoc(preQuestRef, testPreQuestData);
      
      setMessage(`Test preQuest created successfully with ID: ${testPreQuestId}`);
      console.log('Created test preQuest:', testPreQuestData);
    } catch (error: any) {
      setMessage(`Error creating test preQuest: ${error.message}`);
      console.error('Error creating test preQuest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreQuestImages = async () => {
    setLoading(true);
    setMessage('');
    try {
      await updatePreQuestReadingImages(testPreQuestId, testImageUrls);
      setMessage(`Successfully updated preQuest images for ID: ${testPreQuestId}`);
      console.log('Updated preQuest images:', testImageUrls);
    } catch (error: any) {
      setMessage(`Error updating preQuest images: ${error.message}`);
      console.error('Error updating preQuest images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchPreQuestData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await getPreQuestReadingById(testPreQuestId);
      if (data) {
        setPreQuestData(data);
        setMessage(`Successfully fetched preQuest data for ID: ${testPreQuestId}`);
        console.log('Fetched preQuest data:', data);
      } else {
        setMessage(`No preQuest found with ID: ${testPreQuestId}`);
      }
    } catch (error: any) {
      setMessage(`Error fetching preQuest data: ${error.message}`);
      console.error('Error fetching preQuest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestWithRealId = () => {
    Alert.prompt(
      'Enter PreQuest ID',
      'Please enter a real preQuest ID from your Firestore:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update Images',
          onPress: async (preQuestId) => {
            if (preQuestId) {
              setLoading(true);
              setMessage('');
              try {
                await updatePreQuestReadingImages(preQuestId, testImageUrls);
                setMessage(`Successfully updated preQuest images for ID: ${preQuestId}`);
                
                // Fetch the updated data to verify
                const data = await getPreQuestReadingById(preQuestId);
                if (data) {
                  setPreQuestData(data);
                  console.log('Updated preQuest data:', data);
                }
              } catch (error: any) {
                setMessage(`Error: ${error.message}`);
                console.error('Error:', error);
              } finally {
                setLoading(false);
              }
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const runFullTest = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Step 1: Create test preQuest
      setMessage('Step 1: Creating test preQuest...');
      await createTestPreQuest();
      
      // Step 2: Update with images
      setMessage('Step 2: Updating with image URLs...');
      await updatePreQuestReadingImages(testPreQuestId, testImageUrls);
      
      // Step 3: Fetch and verify
      setMessage('Step 3: Fetching updated data...');
      const data = await getPreQuestReadingById(testPreQuestId);
      if (data) {
        setPreQuestData(data);
        setMessage(`✅ Full test completed successfully! PreQuest ID: ${testPreQuestId}`);
        console.log('Full test completed. Final data:', data);
      }
    } catch (error: any) {
      setMessage(`❌ Test failed: ${error.message}`);
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedText style={styles.title}>PreQuest Images Test</ThemedText>
        
        <ThemedText style={styles.description}>
          This test will create a test preQuest document, update it with image URLs, and verify the data structure.
        </ThemedText>

        <View style={styles.buttonContainer}>
          <Button
            title="🚀 Run Full Test (Create + Update + Verify)"
            onPress={runFullTest}
            disabled={loading}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Create Test PreQuest"
            onPress={createTestPreQuest}
            disabled={loading}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Update Test PreQuest Images"
            onPress={handleUpdatePreQuestImages}
            disabled={loading}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Fetch PreQuest Data"
            onPress={handleFetchPreQuestData}
            disabled={loading}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Test with Real PreQuest ID"
            onPress={handleTestWithRealId}
            disabled={loading}
          />
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <ThemedText style={styles.loadingText}>Loading...</ThemedText>
          </View>
        )}

        {message && (
          <View style={styles.messageContainer}>
            <ThemedText style={styles.messageText}>{message}</ThemedText>
          </View>
        )}

        {preQuestData && (
          <View style={styles.dataContainer}>
            <ThemedText style={styles.dataTitle}>PreQuest Data:</ThemedText>
            <ScrollView style={styles.dataScroll}>
              <ThemedText style={styles.dataText}>
                {JSON.stringify(preQuestData, null, 2)}
              </ThemedText>
            </ScrollView>
          </View>
        )}

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>Test Image URLs:</ThemedText>
          {Object.entries(testImageUrls).map(([page, url]) => (
            <ThemedText key={page} style={styles.infoText}>
              {page}: {url}
            </ThemedText>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>Test PreQuest ID:</ThemedText>
          <ThemedText style={styles.infoText}>{testPreQuestId}</ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  messageContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  messageText: {
    fontSize: 14,
  },
  dataContainer: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dataScroll: {
    maxHeight: 300,
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: '#e8f4fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default TestPreQuestImagesScreen; 