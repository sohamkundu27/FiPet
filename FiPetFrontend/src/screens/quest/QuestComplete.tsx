import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuest } from '@/src/hooks/useQuest';
import { useAuth } from '@/src/hooks/useRequiresAuth';
import { useGamificationStats } from '@/src/hooks/useGamificationStats';

export default function QuestComplete() {
  const router = useRouter();
  const { quest, loading } = useQuest();
  const { user } = useAuth();
  const { addXP, addCoins } = useGamificationStats();
  const rewardsApplied = useRef(false);

  if (!quest || loading || !quest.isComplete) {
    throw "Quest was not completed!";
  }

  const questions = quest.getQuestions();
  const questionCount = questions.reduce((data, question) => {
    return {
      regular: data.regular + (question.isPractice ? 0 : 1),
      correct: data.correct + (question.getAnswer().correct ? 1 : 0),
    }
  }, {
    regular: 0,
    correct: 0,
  });
  const correctRatio = questionCount.correct / questionCount.regular;
  const mood = correctRatio > 0.8 ? 'Happy' : 'Sad';

  // Calculate XP and coins based on performance
  const baseXP = quest?.reward.xp || 0;
  const baseCoins = quest?.reward.coins || 0;

  // Performance multiplier: minimum 20% reward even for poor performance, scale up to 100% for perfect score
  // Example: 3/5 correct = 60% ratio = 60% of base rewards
  // Example: 5/5 correct = 100% ratio = 100% of base rewards  
  // Example: 1/5 correct = 20% ratio = 20% of base rewards (minimum)
  const performanceMultiplier = Math.max(0.2, correctRatio);
  const earnedXP = Math.round(baseXP * performanceMultiplier);
  const earnedCoins = Math.round(baseCoins * performanceMultiplier);

  const title = mood === 'Sad' ? 'So Close' : 'Well done!';
  const emoji = mood === 'Sad' ? '😢' : '🎉';

  // Update user rewards using GamificationProvider functions
  useEffect(() => {
    const updateUserRewards = () => {
      // Prevent multiple reward applications
      if (rewardsApplied.current) {
        console.log('Rewards already applied, skipping...');
        return;
      }

      try {
        const leveledUp = addXP(earnedXP);
        addCoins(earnedCoins);
        rewardsApplied.current = true;

        console.log(`Updated user rewards: +${earnedXP} XP, +${earnedCoins} coins`);
        if (leveledUp) {
          console.log('User leveled up!');
        }
      } catch (error) {
        console.error('Error updating user rewards:', error);
      }
    };

    updateUserRewards();
  }, [earnedXP, earnedCoins]); // Removed addXP and addCoins from dependencies


  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.textSection}>
          <Text style={styles.title}>{title}<Text style={styles.emoji}>{emoji}</Text></Text>
          <Text style={styles.xpText}>+{earnedXP} <Text style={styles.xpHighlight}>XP</Text></Text>
          {earnedCoins > 0 && (
            <Text style={styles.coinText}>+{earnedCoins} <Text style={styles.coinHighlight}>🪙</Text></Text>
          )}
          <Text style={styles.moodText}>Mood: {mood}</Text>
        </View>

        <View style={styles.foxContainer}>
          <Image
            source={mood === 'Sad' ? require('@/src/assets/images/Evo1-sad-fox.png') : require('@/src/assets/images/Evo1-happy-fox.png')}
            style={styles.foxImage}
            resizeMode="contain"
          />
          <Image
            source={require('@/src/assets/images/fox-shadow.png')}
            style={styles.foxShadow}
            resizeMode="contain"
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.outlineButton} onPress={() => {
            router.replace('/(tabs)/quests')
            router.replace({ pathname: '/home', params: { refetch: Date.now().toString() } });
          }}>
            <Text style={styles.outlineButtonText}>RETURN HOME</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gradientButton} onPress={() => router.replace('/(tabs)/quests')}>
            <LinearGradient
              colors={["#4F8CFF", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButtonBg}
            >
              <Text style={styles.gradientButtonText}>NEXT QUEST</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '15%',
    paddingBottom: '15%',
    paddingHorizontal: 20,
  },
  textSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  emoji: {
    fontSize: 22,
  },
  xpText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  xpHighlight: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 30,
  },
  coinText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  coinHighlight: {
    color: '#FBBF24',
    fontWeight: 'bold',
    fontSize: 24,
  },
  moodText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  foxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    maxWidth: 228.27,
    aspectRatio: 228.27 / 271,
    position: 'relative',
  },
  foxImage: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  foxShadow: {
    width: '96%',
    height: 25,
    position: 'absolute',
    bottom: -12,
    zIndex: 1,
    opacity: 0.4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingHorizontal: 20,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#bbb',
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    minWidth: 150,
    minHeight: 46,
    alignItems: 'center',
    flex: 1,
    maxWidth: 160,
  },
  outlineButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  gradientButton: {
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 150,
    minHeight: 46,
    alignItems: 'center',
    flex: 1,
    maxWidth: 160,
  },
  gradientButtonBg: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 46,
  },
  gradientButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
});
