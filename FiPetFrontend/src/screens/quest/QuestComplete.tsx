// Goal: Page shows XP/rewards and completion screen.
// STATUS: NOT IMPLEMENTED
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuest } from '@/src/hooks/useQuest';

export default function QuestComplete() {
  const router = useRouter();
  // Get quest and answer ratio from context
  const { quest, getCorrectAnswerRatio } = useQuest();
  const correctRatio = getCorrectAnswerRatio();
  const mood = correctRatio > 0.8 ? 'Happy' : 'Sad';
  const xpEarned = mood === 'Sad' ? 0 : (quest?.xpReward || 0);
  const title = mood === 'Sad' ? 'So Close' : 'Well done!';
  const emoji = mood === 'Sad' ? '😢' : '🎉';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}<Text style={styles.emoji}>{emoji}</Text></Text>
      <Text style={styles.xpText}>+{xpEarned} <Text style={styles.xpHighlight}>XP</Text></Text>
      <Text style={styles.moodText}>Mood: {mood}</Text>
      <View style={styles.foxContainer}>
        <Image
          source={mood === 'Sad' ? require('@/src/assets/images/sad-fox.png') : require('@/src/assets/images/happy-fox.png')}
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
        <TouchableOpacity style={styles.outlineButton} onPress={() => router.replace('/home')}>
          <Text style={styles.outlineButtonText}>RETURN HOME</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gradientButton} onPress={() => router.replace('/quest')}>
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
      {/* Simulated bottom nav bar area */}
      <View style={styles.bottomNavBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#222',
    top: 112,
    textAlign: 'center',
    position: 'absolute',
    fontFamily: 'Poppins-Bold',
  },
  emoji: {
    fontSize: 22,
  },
  xpText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#222',
    top:158,
    textAlign: 'center',
    position: 'absolute',

  },
  xpHighlight: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 30,
  },
  moodText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#444',
    position: 'absolute',
    top: 196,
    textAlign: 'center',
  },
  foxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 228.27,
    height: 271,
    marginBottom: 32,
    position: 'absolute',
    top: 280,
    left: 83,
  },
  foxImage: {
    width: 228.27,
    height: 271,
    zIndex: 2,
  },
  foxShadow: {
    width: 219,
    height: 25,
    position: 'absolute',
    bottom: -100,
    alignItems: 'center',
    zIndex: 1,
    opacity: 0.4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 700,
    gap: 12,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#bbb',
    borderRadius: 13,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    marginRight: 8,
    minWidth: 155,
    minHeight: 46,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 14,
  },
  gradientButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 8,
    minWidth: 155,
    minHeight: 46,
    alignItems: 'center',
  },
  gradientButtonBg: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 155,
    minHeight: 46,
  },
  gradientButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomNavBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
