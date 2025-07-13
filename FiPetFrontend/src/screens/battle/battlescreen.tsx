"use client"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image } from "react-native"
import { useFonts } from 'expo-font'
import TabHeader from "@/src/components/TabHeader"
import { useGamificationStats } from "@/src/hooks/useGamificationStats"
import { LinearGradient } from 'expo-linear-gradient'

export default function BattleScreen() {
  const { level, streak, coins } = useGamificationStats()

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
        xp={level.xp}
        coins={coins.coins}
        streak={streak.current}
        title="Battle"
        gradient={{
          startColor: "#F97216",
          endColor: "#F9C116",
        }}
      />

      <ScrollView contentContainerStyle={{ paddingTop: 20 }}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image source={require("@/src/assets/images/daily-streak.png")} style={styles.sectionIcon} />
            <View>
              <Text style={styles.sectionTitle}>Live Play</Text>
              <Text style={styles.sectionSubtitle}>Play against real users to earn extra XP</Text>
            </View>
          </View>

          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.startButton}>
              <View style={styles.startButtonInner}>
                <Image source={require("@/src/assets/images/play.png")} style={styles.buttonIcon} />
                <Text style={styles.startButtonText}>Start A Game</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.findButton}>
              <LinearGradient
                colors={['#A855F7', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.findButtonInner}
              >
                <Image source={require("@/src/assets/images/play.png")} style={styles.buttonIcon} />
                <Text style={styles.findButtonText}>Find A Game</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image source={require("@/src/assets/images/daily-streak.png")} style={styles.sectionIcon} />
            <View>
              <Text style={styles.sectionTitle}>Leaderboard</Text>
              <Text style={styles.sectionSubtitle}>Earn XP to add to your daily streak</Text>
            </View>
          </View>

          <View style={styles.leaderboardBox}>
            <View style={styles.leaderboardHeader}>
              <Text style={[styles.tableHeader, styles.tableHeaderRank]}>Place</Text>
              <Text style={[styles.tableHeader, styles.tableHeaderUsername]}>Username</Text>
              <Text style={[styles.tableHeader, styles.tableHeaderXP]}>XP</Text>
              <Text style={[styles.tableHeader, styles.tableHeaderStreak]}>Streak</Text>
            </View>

            {[
              { name: '@userabc1_long_username', score: '10.4M', streak: 1092 },
              { name: '@alfkd', score: '10.4M', streak: 1092 },
              { name: '@randus_longusername', score: '10.4M', streak: 1092 },
              { name: '@ilovefipet', score: '10.4M', streak: 1092 },
              { name: '@afd4kd', score: '10.4M', streak: 1092 },
              { name: '@user12b', score: '9.8M', streak: 453 },
              { name: '@userxz99', score: '9.8M', streak: 931 },
            ].map((user, index) => (
              <View key={index}>
                <View style={styles.leaderboardRow}>
                  <Text style={styles.rank}>{`${index + 4}th`}</Text>
                  <Text style={styles.username} numberOfLines={1} ellipsizeMode="tail">
                    {user.name}
                  </Text>
                  <View style={styles.xpCell}>
                    <Text style={styles.xpText}>{user.score}</Text>
                    <Image source={require("@/src/assets/images/xp.png")} style={styles.xpIcon} />
                  </View>
                  <View style={styles.streakCell}>
                    <Text style={styles.streakText}>{user.streak.toLocaleString()}</Text>
                    <Image source={require("@/src/assets/images/streak-fire-full.png")} style={styles.streakIcon} />
                  </View>
                </View>
                <View style={styles.rowDivider} />
              </View>
            ))}

            <View style={[styles.leaderboardRow]}>
              <Text style={[styles.rank, { fontFamily: 'PoppinsBold' }]}>3,042</Text>
              <Text style={[styles.username, { fontFamily: 'PoppinsBold' }]} numberOfLines={1} ellipsizeMode="tail">You</Text>
              <View style={styles.xpCell}>
                <Text style={[styles.xpText, { fontFamily: 'PoppinsBold' }]}>32.7K</Text>
                <Image source={require("@/src/assets/images/xp.png")} style={styles.xpIcon} />
              </View>
              <View style={styles.streakCell}>
                <Text style={[styles.streakText, { fontFamily: 'PoppinsBold' }]}>37</Text>
                <Image source={require("@/src/assets/images/streak-fire-full.png")} style={styles.streakIcon} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 55,
    height: 55,
    marginRight: 10,
    resizeMode: 'contain',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'PoppinsBold',
    color: "#1F2937",
  },
  sectionSubtitle: {
    fontSize: 15,
    fontFamily: 'PoppinsRegular',
    color: "#6B7280",
  },
  sectionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  startButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  startButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  findButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  findButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 8,
  },
  startButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 18,
    color: '#4F46E5',
  },
  findButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 18,
    color: '#fff',
  },
  leaderboardBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  tableHeader: {
    fontFamily: 'PoppinsMedium',
    fontSize: 14,
    color: '#6B7280',
  },
  tableHeaderRank: {
    width: '18%',
    textAlign: 'left',
  },
  tableHeaderUsername: {
    width: '32%',
    textAlign: 'left',
  },
  tableHeaderXP: {
    width: '25%',
    textAlign: 'right',
    paddingRight: 58
  },
  tableHeaderStreak: {
    width: '20%',
    textAlign: 'right',
    paddingRight: 16
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    alignItems: 'center',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 2,
  },
  rank: {
    width: '18%',
    fontSize: 15,
    fontFamily: 'PoppinsRegular',
    color: '#1F2937',
  },
  username: {
    width: '32%',
    fontSize: 15,
    fontFamily: 'PoppinsRegular',
    color: '#374151',
    overflow: 'hidden',
  },
  xpCell: {
    width: '25%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 25
  },
  xpText: {
    fontSize: 15,
    fontFamily: 'PoppinsMedium',
    color: '#3B82F6',
  },
  xpIcon: {
    width: 20,
    height: 20,
    marginLeft: 4,
    resizeMode: 'contain',
  },
  streakCell: {
    width: '25%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 30
  },
  streakText: {
    fontSize: 15,
    fontFamily: 'PoppinsMedium',
    color: '#F59E0B',
  },
  streakIcon: {
    width: 20,
    height: 20,
    marginLeft: 4,
    resizeMode: 'contain',
  },
})
