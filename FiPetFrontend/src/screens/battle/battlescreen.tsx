"use client"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions } from "react-native"
import { useFonts } from 'expo-font'
import TabHeader from "@/src/components/TabHeader"
import { useGamificationStats } from "@/src/hooks/useGamificationStats"
import { LinearGradient } from 'expo-linear-gradient'

export default function BattleScreen() {
  const { level, streak, coins } = useGamificationStats();
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isLargeTablet = width >= 1024;

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
    <View style={[styles.container, isTablet && styles.containerTablet]}>
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

      <ScrollView 
        contentContainerStyle={[
          { paddingTop: 20 }, 
          isTablet && { paddingTop: 40, paddingHorizontal: 60 },
          isLargeTablet && { paddingHorizontal: 120 }
        ]}
      >
        <View style={[styles.section, isTablet && styles.sectionTablet]}>
          <View style={[styles.sectionHeader, isTablet && styles.sectionHeaderTablet]}>
            <Image 
              source={require("@/src/assets/images/daily-streak.png")} 
              style={[styles.sectionIcon, isTablet && styles.sectionIconTablet]} 
            />
            <View>
              <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>Live Play</Text>
              <Text style={[styles.sectionSubtitle, isTablet && styles.sectionSubtitleTablet]}>Play against real users to earn extra XP</Text>
            </View>
          </View>

          <View style={[styles.sectionContent, isTablet && styles.sectionContentTablet]}>
            <TouchableOpacity style={[styles.startButton, isTablet && styles.startButtonTablet]}>
              <View style={[styles.startButtonInner, isTablet && styles.startButtonInnerTablet]}>
                <Image 
                  source={require("@/src/assets/images/play.png")} 
                  style={[styles.buttonIcon, isTablet && styles.buttonIconTablet]} 
                />
                <Text style={[styles.startButtonText, isTablet && styles.startButtonTextTablet]}>Start A Game</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.findButton, isTablet && styles.findButtonTablet]}>
              <LinearGradient
                colors={['#A855F7', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.findButtonInner, isTablet && styles.findButtonInnerTablet]}
              >
                <Image 
                  source={require("@/src/assets/images/play.png")} 
                  style={[styles.buttonIcon, isTablet && styles.buttonIconTablet]} 
                />
                <Text style={[styles.findButtonText, isTablet && styles.findButtonTextTablet]}>Find A Game</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, isTablet && styles.sectionTablet]}>
          <View style={[styles.sectionHeader, isTablet && styles.sectionHeaderTablet]}>
            <Image 
              source={require("@/src/assets/images/daily-streak.png")} 
              style={[styles.sectionIcon, isTablet && styles.sectionIconTablet]} 
            />
            <View>
              <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>Leaderboard</Text>
              <Text style={[styles.sectionSubtitle, isTablet && styles.sectionSubtitleTablet]}>Earn XP to add to your daily streak</Text>
            </View>
          </View>

          <View style={[styles.leaderboardBox, isTablet && styles.leaderboardBoxTablet]}>
            <View style={[styles.leaderboardHeader, isTablet && styles.leaderboardHeaderTablet]}>
              <Text style={[styles.tableHeader, styles.tableHeaderRank, isTablet && styles.tableHeaderTablet]}>Place</Text>
              <Text style={[styles.tableHeader, styles.tableHeaderUsername, isTablet && styles.tableHeaderTablet]}>Username</Text>
              <Text style={[styles.tableHeader, styles.tableHeaderXP, isTablet && styles.tableHeaderTablet]}>XP</Text>
              <Text style={[styles.tableHeader, styles.tableHeaderStreak, isTablet && styles.tableHeaderTablet]}>Streak</Text>
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
                <View style={[styles.leaderboardRow, isTablet && styles.leaderboardRowTablet]}>
                  <Text style={[styles.rank, isTablet && styles.rankTablet]}>{`${index + 4}th`}</Text>
                  <Text 
                    style={[styles.username, isTablet && styles.usernameTablet]} 
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                  >
                    {user.name}
                  </Text>
                  <View style={[styles.xpCell, isTablet && styles.xpCellTablet]}>
                    <Text style={[styles.xpText, isTablet && styles.xpTextTablet]}>{user.score}</Text>
                    <Image 
                      source={require("@/src/assets/images/xp.png")} 
                      style={[styles.xpIcon, isTablet && styles.xpIconTablet]} 
                    />
                  </View>
                  <View style={[styles.streakCell, isTablet && styles.streakCellTablet]}>
                    <Text style={[styles.streakText, isTablet && styles.streakTextTablet]}>{user.streak.toLocaleString()}</Text>
                    <Image 
                      source={require("@/src/assets/images/streak-fire-full.png")} 
                      style={[styles.streakIcon, isTablet && styles.streakIconTablet]} 
                    />
                  </View>
                </View>
                <View style={[styles.rowDivider, isTablet && styles.rowDividerTablet]} />
              </View>
            ))}

            <View style={[styles.leaderboardRow, isTablet && styles.leaderboardRowTablet]}>
              <Text style={[styles.rank, { fontFamily: 'PoppinsBold' }, isTablet && styles.rankTablet]}>3,042</Text>
              <Text 
                style={[styles.username, { fontFamily: 'PoppinsBold' }, isTablet && styles.usernameTablet]} 
                numberOfLines={1} 
                ellipsizeMode="tail"
              >
                You
              </Text>
              <View style={[styles.xpCell, isTablet && styles.xpCellTablet]}>
                <Text style={[styles.xpText, { fontFamily: 'PoppinsBold' }, isTablet && styles.xpTextTablet]}>32.7K</Text>
                <Image 
                  source={require("@/src/assets/images/xp.png")} 
                  style={[styles.xpIcon, isTablet && styles.xpIconTablet]} 
                />
              </View>
              <View style={[styles.streakCell, isTablet && styles.streakCellTablet]}>
                <Text style={[styles.streakText, { fontFamily: 'PoppinsBold' }, isTablet && styles.streakTextTablet]}>37</Text>
                <Image 
                  source={require("@/src/assets/images/streak-fire-full.png")} 
                  style={[styles.streakIcon, isTablet && styles.streakIconTablet]} 
                />
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
  containerTablet: {
    backgroundColor: "#F0F9FF",
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
  sectionTablet: {
    marginHorizontal: 0,
    marginBottom: 48,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderTablet: {
    marginBottom: 24,
  },
  sectionIcon: {
    width: 55,
    height: 55,
    marginRight: 10,
    resizeMode: 'contain',
  },
  sectionIconTablet: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'PoppinsBold',
    color: "#1F2937",
  },
  sectionTitleTablet: {
    fontSize: 32,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontFamily: 'PoppinsRegular',
    color: "#6B7280",
  },
  sectionSubtitleTablet: {
    fontSize: 20,
  },
  sectionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  sectionContentTablet: {
    gap: 20,
    marginTop: 20,
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
  startButtonTablet: {
    borderRadius: 24,
  },
  startButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  startButtonInnerTablet: {
    paddingVertical: 20,
    paddingHorizontal: 28,
  },
  findButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  findButtonTablet: {
    borderRadius: 24,
  },
  findButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  findButtonInnerTablet: {
    paddingVertical: 20,
    paddingHorizontal: 28,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 8,
  },
  buttonIconTablet: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  startButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 18,
    color: '#4F46E5',
  },
  startButtonTextTablet: {
    fontSize: 24,
  },
  findButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 18,
    color: '#fff',
  },
  findButtonTextTablet: {
    fontSize: 24,
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
  leaderboardBoxTablet: {
    borderRadius: 28,
    padding: 20,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  leaderboardHeaderTablet: {
    paddingBottom: 12,
    marginBottom: 10,
  },
  tableHeader: {
    fontFamily: 'PoppinsMedium',
    fontSize: 14,
    color: '#6B7280',
  },
  tableHeaderTablet: {
    fontSize: 18,
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
  leaderboardRowTablet: {
    paddingVertical: 16,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 2,
  },
  rowDividerTablet: {
    marginVertical: 4,
  },
  rank: {
    width: '18%',
    fontSize: 15,
    fontFamily: 'PoppinsRegular',
    color: '#1F2937',
  },
  rankTablet: {
    fontSize: 20,
  },
  username: {
    width: '32%',
    fontSize: 15,
    fontFamily: 'PoppinsRegular',
    color: '#374151',
    overflow: 'hidden',
  },
  usernameTablet: {
    fontSize: 20,
  },
  xpCell: {
    width: '25%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 25
  },
  xpCellTablet: {
    paddingLeft: 40,
  },
  xpText: {
    fontSize: 15,
    fontFamily: 'PoppinsMedium',
    color: '#3B82F6',
  },
  xpTextTablet: {
    fontSize: 20,
  },
  xpIcon: {
    width: 20,
    height: 20,
    marginLeft: 4,
    resizeMode: 'contain',
  },
  xpIconTablet: {
    width: 28,
    height: 28,
    marginLeft: 6,
  },
  streakCell: {
    width: '25%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 30
  },
  streakCellTablet: {
    paddingLeft: 45,
  },
  streakText: {
    fontSize: 15,
    fontFamily: 'PoppinsMedium',
    color: '#F59E0B',
  },
  streakTextTablet: {
    fontSize: 20,
  },
  streakIcon: {
    width: 20,
    height: 20,
    marginLeft: 4,
    resizeMode: 'contain',
  },
  streakIconTablet: {
    width: 28,
    height: 28,
    marginLeft: 6,
  },
})
