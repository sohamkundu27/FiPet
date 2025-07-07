"use client"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, SafeAreaView } from "react-native"
import { useFonts } from 'expo-font'
import TabHeader from "@/src/components/TabHeader"
import { useGamificationStats } from "@/src/hooks/useGamificationStats"

export default function BattleScreen() {
  const { userProgress, streakProgress } = useGamificationStats()

  const [loaded] = useFonts({
    PoppinsBold: require('@/src/assets/fonts/Poppins-Bold.ttf'),
    PoppinsMedium: require('@/src/assets/fonts/Poppins-Medium.ttf'),
    PoppinsRegular: require('@/src/assets/fonts/Poppins-Regular.ttf'),
    PoppinsSemiBold: require('@/src/assets/fonts/Poppins-SemiBold.ttf'),
  });

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <TabHeader
        xp={userProgress.currentXP}
        coins={userProgress.coins}
        streak={streakProgress.currentStreak}
        title="Battle"
        gradient={{
          startColor: "#F97216",
          endColor: "#F99F16",
        }}
      />

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Play</Text>
          <Text style={styles.sectionSubtitle}>Choose battle type:</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Battle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Button</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          {[
            { name: 'Player 1', score: 150 },
            { name: 'Player 2', score: 125 },
            { name: 'Player 3', score: 100 },
          ].map((user, index) => (
            <View key={index} style={styles.leaderboardRow}>
              <Text style={styles.leaderboardRank}>{index + 1}.</Text>
              <Text style={styles.leaderboardName}>{user.name}</Text>
              <Text style={styles.leaderboardScore}>{user.score} pts</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'PoppinsRegular',
    color: '#4A5568',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: "#222",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: "#666",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#F97216",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    textAlign: "center",
  },
  divider: {
    height: 2,
    backgroundColor: "#D1D5DB",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  leaderboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  leaderboardRank: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: "#1F2937",
    width: 30,
  },
  leaderboardName: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: "#374151",
    flex: 1,
  },
  leaderboardScore: {
    fontSize: 16,
    fontFamily: 'PoppinsMedium',
    color: "#F59E0B",
  }
})
