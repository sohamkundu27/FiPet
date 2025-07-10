import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';

const TestPreQuestRunnerScreen = () => {
  const router = useRouter();

  const navigateToTest = (testName: string) => {
    switch (testName) {
      case 'firestore':
        router.push('/testPreQuestImages' as any);
        break;
      case 'imageLoading':
        router.push('/testPreQuestImageLoading' as any);
        break;
      default:
        break;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>PreQuest Image Testing</ThemedText>
      
      <ThemedText style={styles.description}>
        Choose a test to verify the preQuest image functionality:
      </ThemedText>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => navigateToTest('firestore')}
        >
          <ThemedText style={styles.buttonText}>Test Firestore Integration</ThemedText>
          <ThemedText style={styles.buttonSubtext}>
            Test updating and fetching preQuest documents with image URLs
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={() => navigateToTest('imageLoading')}
        >
          <ThemedText style={styles.buttonText}>Test Image Loading</ThemedText>
          <ThemedText style={styles.buttonSubtext}>
            Test dynamic image loading with fallback functionality
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <ThemedText style={styles.infoTitle}>What to Test:</ThemedText>
        <ThemedText style={styles.infoText}>
          1. <ThemedText style={styles.bold}>Firestore Integration:</ThemedText> Verify that image URLs can be stored and retrieved from Firestore
        </ThemedText>
        <ThemedText style={styles.infoText}>
          2. <ThemedText style={styles.bold}>Image Loading:</ThemedText> Verify that images load correctly from URLs and fallback works
        </ThemedText>
        <ThemedText style={styles.infoText}>
          3. <ThemedText style={styles.bold}>Backward Compatibility:</ThemedText> Ensure existing preQuest documents still work
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    color: '#666',
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  testButton: {
    backgroundColor: '#6C63FF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  infoContainer: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default TestPreQuestRunnerScreen; 