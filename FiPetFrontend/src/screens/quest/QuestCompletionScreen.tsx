import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Text,
  Platform,
} from 'react-native';

export default function QuestCompletionScreen() {
  const router = useRouter();
  // Static values for now
  const xpEarned = 1500;
  const mood = 'Happy';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Well done!<Text style={styles.emoji}>🎉</Text></Text>
      <Text style={styles.xpText}>+{xpEarned} <Text style={styles.xpHighlight}>XP</Text></Text>
      <Text style={styles.moodText}>Mood: {mood}</Text>
      <View style={styles.foxContainer}>
        <Image
          source={require('@/src/assets/images/happy-fox.png')}
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
        <TouchableOpacity style={styles.nextButton} onPress={() => {/* TODO: Implement next quest navigation */}}>
          <Text style={styles.nextButtonText}>NEXT QUEST</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  xpText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
    textAlign: 'center',
  },
  xpHighlight: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 22,
  },
  moodText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
    textAlign: 'center',
  },
  foxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
    marginBottom: 32,
    position: 'relative',
  },
  foxImage: {
    width: 180,
    height: 180,
    zIndex: 2,
  },
  foxShadow: {
    width: 140,
    height: 18,
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -70,
    zIndex: 1,
    opacity: 0.4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#bbb',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  outlineButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nextButton: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: 'linear-gradient(90deg, #4F8CFF 0%, #7C3AED 100%)', // fallback for web, will override below
    marginLeft: 8,
    ...Platform.select({
      ios: {
        backgroundColor: '#4F8CFF',
      },
      android: {
        backgroundColor: '#4F8CFF',
      },
    }),
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
