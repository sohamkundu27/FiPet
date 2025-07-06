import { View, Text, StyleSheet } from 'react-native';
import { useGamificationStats } from '@/src/hooks/useGamificationStats';
import TabHeader from '@/src/components/TabHeader';

export default function Battle() {
  const {userProgress, streakProgress} = useGamificationStats();

  return (
    <View style={styles.container}>
      <TabHeader
        xp={userProgress.currentXP}
        coins={userProgress.coins}
        streak={streakProgress.currentStreak}
        title="Home"
        gradient={{
          startColor: "#F97216",
          endColor: "#F99F16",
        }}
      />
      <View style={styles.content}>
        <Text>Battle Page (Dummy Page)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    paddingTop: 100,
  },
});
