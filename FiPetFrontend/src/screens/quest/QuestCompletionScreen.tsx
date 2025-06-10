import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  Animated,
} from 'react-native';

import { ThemedView } from '@/src/components/ThemedView';
import { ThemedText } from '@/src/components/ThemedText';

// temporary reward and XP data
const xpEarned = 150;
const rewards = ['Temporary Reward', 'Badge'];

export default function PetEvolutionScreen() {
  const router = useRouter();
  const [evolved, setEvolved] = useState(false);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    // Trigger evolution animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setEvolved(true);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <AntDesign name="arrowleft" size={28} color="#4a90e2" />
      </TouchableOpacity>

      <View style={styles.card}>
        <ThemedText type="title" style={styles.title}>
          Evolution Complete!
        </ThemedText>

        <Animated.View style={[styles.petContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Image
            source={
              evolved
                ? require('@/src/assets/images/react-logo.png') // change these to actual icons
                : require('@/src/assets/images/react-logo.png')
            }
            style={styles.petImage}
            resizeMode="contain"
          />
        </Animated.View>

        <ThemedText type="subtitle" style={styles.xpText}>
          +{xpEarned} XP earned!
        </ThemedText>

        <ThemedText type="subtitle" style={styles.rewardLabel}>
          Rewards Unlocked:
        </ThemedText>
        {rewards.map((reward, index) => (
          <ThemedText key={index} style={styles.rewardText}>
            🏅 {reward} {/* add reward badge image */}
          </ThemedText>
        ))}

        <TouchableOpacity
          style={styles.returnButton}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.returnText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
  },
  card: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: '#f9fff6',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#b2d8b2',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2f4858',
  },
  petContainer: {
    width: 160,
    height: 160,
    marginBottom: 20,
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  xpText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#215732',
  },
  rewardLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 15,
    color: '#4a4a4a',
    marginBottom: 2,
  },
  returnButton: {
    marginTop: 24,
    backgroundColor: 'rgba(10, 126, 164, 1.00)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  returnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
