import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useQuest } from '@/src/hooks/useQuest';
import QuestProgressBar from '@/src/components/QuestProgressBar';

export default function PreQuestReadingScreen() {
  const { quest, loading, error } = useQuest();
  const router = useRouter();
  const [page, setPage] = useState(0);

  if (loading || !quest) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Handle missing preQuest document
  if (error) {
    return (
      <View style={[styles.loadingContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }]}>
        <Text style={[styles.loadingText, { textAlign: 'center', paddingHorizontal: 8 }]}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            paddingVertical: 12,
            paddingHorizontal: 32,
            backgroundColor: '#FF7A00', // App's orange
            borderRadius: 24,
          }}
        >
          <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const readings = quest.getReadings();
  const totalPages = readings.length;
  const isLastPage = page === totalPages - 1;
  const isFirstPage = page === 0;

  const handleNext = () => {
    if (!isLastPage) {
      setPage(page + 1);
    } else {
      const latestQuestion = quest.getLatestQuestion();
      if (!latestQuestion) {
        router.replace(`/(tabs)/quests/${quest.id}/questions/${quest.getQuestions()[0].id}`);
      } else {
        router.replace(`/(tabs)/quests/${quest.id}/questions/${latestQuestion.id}`);
      }
    }
  };

  const handleBack = () => {
    if (!isFirstPage) setPage(page - 1);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.mainContainer}>
        {/* Fixed progress bar and back arrow at the top */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backArrowContainer}>
            <Text style={{ fontSize: 38, textAlign: 'center', lineHeight: 40 }}>×</Text>
          </TouchableOpacity>
          <QuestProgressBar currentStep={page} numSteps={totalPages}/>
        </View>
        
        {/* Scrollable content */}
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.topText}>{String(readings[page].topText || '')}</Text>
          
          <View style={styles.imageContainer}>
            <Image source={require('@/src/assets/images/preQuestReading1.png')} style={styles.foxImage} resizeMode="contain" />
          </View>
          
          <Text style={styles.bottomText}>{String(readings[page].bottomText || '')}</Text>
        </ScrollView>
        
        {/* Fixed button row at the bottom */}
        <View style={styles.footerContainer}>
          <View style={styles.buttonRow}>
            {!isFirstPage && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>{isLastPage ? 'Start Quest' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressBarLong: {
    flex: 3,
  },
  progressBarShort: {
    flex: 1,
  },
  progressBarActive: {
    backgroundColor: '#6C63FF',
  },
  progressBarInactive: {
    backgroundColor: '#E0E0E0',
  },
  backArrowContainer: {
    padding: 8,
  },
  backArrow: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  topText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  imageContainer: {
    marginBottom: 40,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  foxImage: {
    width: 300,
    height: 300,
  },
  bottomText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  footerContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    backgroundColor: '#E8E8E8',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 120,
  },
  nextButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 120,
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
}); 
