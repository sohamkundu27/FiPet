import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

// temporary badges abd xp values
const xpEarned = 150;
const rewards = [
  { name: 'Temporary Reward', icon: require('@/src/assets/images/react-logo.png') },
  { name: 'Badge', icon: require('@/src/assets/images/react-logo.png') },
];

const currentXP = 850;
const xpToNextLevel = 1000;

export default function QuestCompletionScreen() {
  const router = useRouter();
  const [evolved, setEvolved] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const newXP = currentXP + xpEarned;
  const xpProgress = Math.min(newXP / xpToNextLevel, 1);
  const progressAnim = useRef(new Animated.Value(currentXP / xpToNextLevel)).current;

  useEffect(() => {
    // Pet evolution animation
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

    // Animate XP bar
    Animated.timing(progressAnim, {
      toValue: xpProgress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  const handleReturnHome = () => {
    router.replace({
      pathname: '/home',
      params: {
        newXP: xpEarned,
        petEvolved: evolved ? 'true' : 'false',
      },
    });
  };

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
                ? require('@/src/assets/images/react-logo.png')
                : require('@/src/assets/images/react-logo.png')
            }
            style={styles.petImage}
            resizeMode="contain"
          />
        </Animated.View>

        <ThemedText type="subtitle" style={styles.xpText}>
          +{xpEarned} XP earned!
        </ThemedText>

        {/* XP Progress Bar */}
        <View style={styles.xpBarWrapper}>
          <View style={styles.xpBarBackground}>
            <Animated.View
              style={[
                styles.xpBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.xpBarLabel}>
            {newXP} / {xpToNextLevel} XP
          </Text>
        </View>

        <ThemedText type="subtitle" style={styles.rewardLabel}>
          Rewards Unlocked:
        </ThemedText>

        {rewards.map((reward, index) => (
          <View key={index} style={styles.rewardRow}>
            <Image source={reward.icon} style={styles.rewardIcon} />
            <ThemedText style={styles.rewardText}>{reward.name}</ThemedText>
          </View>
        ))}

        <TouchableOpacity style={styles.returnButton} onPress={handleReturnHome}>
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
  xpBarWrapper: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  xpBarBackground: {
    width: '100%',
    height: 18,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 10,
  },
  xpBarLabel: {
    marginTop: 6,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  rewardLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rewardIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  rewardText: {
    fontSize: 15,
    color: '#4a4a4a',
  },
  returnButton: {
    marginTop: 24,
    backgroundColor: '#0a7ea4',
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
