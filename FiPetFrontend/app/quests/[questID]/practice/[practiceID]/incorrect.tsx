import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Stack } from 'expo-router';

export default function PracticeIncorrectAnswerScreen() {
  const { questID, practiceID } = useLocalSearchParams<{
    questID?: string;
    practiceID?: string;
  }>();
  const router = useRouter();

  if (!practiceID || !questID) {
    return null;
  }

  const handleSeeExplanation = () => {
    // Navigate to practice explanation screen
    router.push(`/quests/${questID}/practice/${practiceID}/explanation`);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>Not Quite</Text>
        <View style={styles.foxContainer}>
          <Image
            source={require('@/src/assets/images/sad-fox.png')}
            style={styles.foxImage}
            resizeMode="contain"
          />
          <Image
            source={require('@/src/assets/images/red-Vector.png')}
            style={styles.foxShadow}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity style={styles.explanationButton} onPress={handleSeeExplanation}>
          <Text style={styles.explanationButtonText}>SEE EXPLANATION</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 99, 132, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 50,
    textAlign: 'center',
    position: 'absolute',
    top: 112,
  },
  foxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    position: 'relative',
    width: 267.01,
    height: 250,
    position: 'absolute',
    top: 280,
  },
  foxImage: {
    width: 267.01,
    height: 250,
    marginBottom: 30,
    position: 'relative',
    zIndex: 2,
  },
  foxShadow: {
    width: 219,
    height: 25,
    position: 'absolute',
    bottom: -100,
    left: '50%',
    marginLeft: -109.5,
    zIndex: 1,
    opacity: 1,
  },
  explanationButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
    position: 'absolute',
    top: 700,
  },
  explanationButtonText: {
    color: '#FF6384',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
}); 