import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { getPreQuestReadingById } from '@/src/services/preQuestReadingService';

const TestPreQuestImageLoadingScreen = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [firestoreData, setFirestoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFirestoreData();
  }, []);

  const loadFirestoreData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPreQuestReadingById('test-prequest-001');
      if (data) {
        setFirestoreData(data);
        console.log('Loaded Firestore data:', data);
      } else {
        setError('No Firestore data found. Please run the test script first to create test data.');
        console.log('No Firestore data found');
      }
    } catch (error) {
      setError('Error loading Firestore data: ' + (error as Error).message);
      console.error('Error loading Firestore data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = 4;
  const isLastPage = currentPage === totalPages;
  const isFirstPage = currentPage === 1;

  const pageData = firestoreData?.[`page${currentPage}` as keyof typeof firestoreData];

  const handleNext = () => {
    if (!isLastPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleReset = () => {
    setCurrentPage(1);
  };

  const handleReload = () => {
    loadFirestoreData();
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Firestore data...</Text>
        </View>
      </ThemedView>
    );
  }

  if (error || !firestoreData) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <ThemedText style={styles.title}>PreQuest Image Loading Test</ThemedText>
          
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error || 'No data available'}</ThemedText>
            <ThemedText style={styles.errorSubtext}>
              Please run the test script first to create test data in Firestore.
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
            <ThemedText style={styles.reloadButtonText}>🔄 Reload Data</ThemedText>
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <ThemedText style={styles.infoTitle}>How to create test data:</ThemedText>
            <ThemedText style={styles.infoText}>
              1. Run: node testPreQuestFunctionality.js
            </ThemedText>
            <ThemedText style={styles.infoText}>
              2. This will create test-prequest-001 with image URLs
            </ThemedText>
            <ThemedText style={styles.infoText}>
              3. Then reload this test screen
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedText style={styles.title}>PreQuest Image Loading Test</ThemedText>
        
        <ThemedText style={styles.description}>
          Testing dynamic image loading with Firestore data.
        </ThemedText>

        <View style={styles.pageInfo}>
          <ThemedText style={styles.pageText}>Page {currentPage} of {totalPages}</ThemedText>
          <ThemedText style={styles.imageInfo}>
            Data Source: Firestore (test-prequest-001)
          </ThemedText>
          <ThemedText style={styles.imageInfo}>
            Image URL: {pageData?.imageUrl ? 'Present' : 'Not provided (using fallback)'}
          </ThemedText>
        </View>

        <View style={styles.contentContainer}>
          <ThemedText style={styles.topText}>{pageData?.top || 'Loading...'}</ThemedText>
          
          {pageData?.imageUrl ? (
            <Image 
              key={`${currentPage}-${pageData.imageUrl}`}
              source={{ uri: pageData.imageUrl }} 
              style={styles.foxImage} 
              resizeMode="contain"
              onLoad={() => console.log(`Dynamic image loaded for page ${currentPage}`)}
              onError={(error) => console.log(`Error loading image for page ${currentPage}:`, error)}
            />
          ) : (
            <Image 
              key={`fallback-${currentPage}`}
              source={require('@/src/assets/images/preQuestReading1.png')} 
              style={styles.foxImage} 
              resizeMode="contain"
            />
          )}
          
          <ThemedText style={styles.bottomText}>{pageData?.bottom || 'Loading...'}</ThemedText>
        </View>

        <View style={styles.buttonRow}>
          {!isFirstPage && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ThemedText style={styles.buttonText}>Back</ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <ThemedText style={styles.buttonText}>
              {isLastPage ? 'Complete' : 'Next'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <ThemedText style={styles.resetButtonText}>Reset to Page 1</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
          <ThemedText style={styles.reloadButtonText}>🔄 Reload Firestore Data</ThemedText>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoTitle}>Test Information:</ThemedText>
          <ThemedText style={styles.infoText}>
            • Using real Firestore data from test-prequest-001
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Images should load from URLs stored in Firestore
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Fallback image used when no URL is provided
          </ThemedText>
          <ThemedText style={styles.infoText}>
            • Check console for image loading events
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 24,
    alignItems: 'center',
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
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
    textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 16,
  },
  reloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pageInfo: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  pageText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  imageInfo: {
    fontSize: 14,
    color: '#666',
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  topText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
    textAlign: 'center',
  },
  foxImage: {
    width: 332,
    height: 332,
    marginBottom: 32,
  },
  bottomText: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  nextButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: '#eee',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginRight: 8,
  },
  buttonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 16,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#e8f4fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default TestPreQuestImageLoadingScreen; 