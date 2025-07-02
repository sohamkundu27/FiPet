"use client"
import { useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, SafeAreaView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { useFonts } from 'expo-font';
import TabHeader from "@/src/components/TabHeader"
import { useGamificationStats } from "@/src/hooks/useGamificationStats"

export default function HomeScreen() {

  const {userProgress, streakProgress} = useGamificationStats();
  const [mood, setMood] = useState(25);

  const xpPercentage = userProgress.streakProgress;
  const levelProgress = userProgress.levelProgress;

  const windowWidth = Dimensions.get("window").width
  const petCircleSize = windowWidth * 0.65
  const progressSize = windowWidth * 0.85

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
        title="Home"
        gradient={{
          startColor: "#F97216",
          endColor: "#F99F16",
        }}
      />
      <ScrollView>
        <View style={styles.petSection}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={styles.levelText}>Level</Text>
            <View style={styles.petContainer}>
              <AnimatedCircularProgress
                size={progressSize}
                width={14}
                fill={mood}
                tintColor="#FBBF24"
                backgroundColor="#E5E7EB"
                rotation={227}
                arcSweepAngle={90}
                lineCap="round"
                style={[styles.progressArc, { transform: [{ scaleX: -1 }] }]}
              />

              <AnimatedCircularProgress
                size={progressSize}
                width={14}
                fill={levelProgress}
                tintColor="#3B82F6"
                backgroundColor="#E5E7EB"
                rotation={227}
                arcSweepAngle={90}
                lineCap="round"
                style={styles.progressArc}
              />
              <View style={styles.petCircle}>
                <Image source={require("@/src/assets/images/sad-fox.png")} style={{ width: petCircleSize * .88, height: petCircleSize * .88, resizeMode: "contain" }} />
                <Image source={require("@/src/assets/images/fox-shadow.png")} style={{ width: petCircleSize * .75, resizeMode: 'contain' }} />
              </View>
            </View>
            <Text style={styles.levelText}>Mood</Text>
          </View>

          <View style={styles.levelIndicator}>
            <Image source={require("@/src/assets/images/trophy.png")} style={styles.icon} />
            <Text style={{ fontSize: 16, lineHeight: 16*1.5, fontFamily: 'PoppinsRegular', color: "#374151" }}>Level {userProgress.level}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={{ flexDirection: 'row', }}>
            <Image source={require("@/src/assets/images/daily-streak.png")} style={{ width: 50, height: 50, marginRight: 5 }} />
            <View>
              <Text style={styles.sectionTitle}>Daily Streak</Text>
              <Text style={styles.sectionSubtitle}>Earn XP to add to your daily streak</Text>
            </View>
          </View>
          <LinearGradient
            colors={["#D26AFF", "#2D8EFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressCard}
          >
            <View style={{ justifyContent: "center" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {streakProgress.days.map((day, key) => (
                  <View key={key} style={{ alignItems: "center" }}>
                    <Text style={styles.left}>{day.achieved ? (
                      <Image style={styles.streakProgressFire} source={require("@/src/assets/images/streak-fire-full.png")} />
                    ) : (
                      <Image style={styles.streakProgressFire} source={require("@/src/assets/images/streak-fire-empty.png")} />
                    )}</Text>
                    <Text style={styles.left}>{day.dayAbbreviation}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.left2}>Weekly Streak Calendar</Text>
            </View>
            <View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <LinearGradient
                    colors={["#F97216", "#F9C116"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${xpPercentage}%` }]}
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.right}>
                <Text style={styles.cardButton}>Today&apos;s Progress</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <View style={{ flexDirection: 'row' }}>
            <Image source={require("@/src/assets/images/quest-selected.png")} style={{ width: 50, height: 50, }} />
            <View>
              <Text style={styles.sectionTitle}>Quests</Text>
              <Text style={styles.sectionSubtitle}>Complete quests to earn extra XP</Text>
            </View>
          </View>
          <LinearGradient
            colors={["#F97216", "#F9C116"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.quest}
          >
            <View>
              <Text style={styles.questTitle}>Spend It or Save It?</Text>
              <Text style={styles.questSubtitle}>Understand the difference between spending or saving.</Text>
            </View>
            <TouchableOpacity style={styles.playButton}
              onPress={() => {
                                router.push(`/quests/quest_001`);
                            }}
            >
              <Image source={require("@/src/assets/images/play.png")} style={{ width: 60, height: 60 }} />
              <Text style={styles.playText}>Play</Text>
            </TouchableOpacity>
          </LinearGradient>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 18,
    lineHeight: 18*1.5,
    color: '#4A5568',
    fontFamily: 'PoppinsRegular',
  },
  petSection: {
    alignItems: "center",
    marginTop: 25,
    marginBottom: 10,
    borderColor: 'black',
  },
  petContainer: {
    position: "relative",
    alignItems: "center",
  },
  petCircle: {
    width: Dimensions.get("window").width * .65,
    height: Dimensions.get("window").width * .65,
    borderRadius: 500,
    alignItems: "center",
    justifyContent: "center",
  },
  petImage: {
    width: 220,
    height: 220,
    resizeMode: "contain",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 25*1.5,
    fontFamily: 'PoppinsBold',
    color: "#222",
  },
  sectionSubtitle: {
    color: "#666",
    marginBottom: 10,
    fontSize: 14,
    lineHeight: 14*1.5,
    fontFamily: 'PoppinsRegular'
  },
  progressCard: {
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  left: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'PoppinsSemiBold'
  },
  left2: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 22,
    fontFamily: 'PoppinsRegular'
  },
  right: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  cardButton: {
    color: "#2D8EFF",
    fontFamily: 'PoppinsRegular',
    fontSize: 13,
    lineHeight: 13*1.5,
  },
  quest: {
    borderRadius: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 25,
    shadowRadius: 4,
    elevation: 3,
  },
  questTitle: {
    color: "#fff",
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    lineHeight: 20*1.5,
  },
  questSubtitle: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 13*1.5,
    marginTop: 2,
    maxWidth: 200,
    fontFamily: 'PoppinsRegular'
  },
  playButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  playText: {
    color: "white",
    fontSize: 15,
    lineHeight: 15*1.5,
    fontFamily: 'PoppinsMedium'
  },
  progressBarContainer: {
    marginBottom: 10,
    alignItems: "center",
    width: "100%",
  },
  progressBarBackground: {
    height: 8,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "black",
    borderRadius: 4,
  },
  leftProgressContainer: {
    position: "absolute",
    left: -20,
    top: 20,
    alignItems: "center",
    zIndex: 1,
  },
  rightProgressContainer: {
    position: "absolute",
    right: -20,
    top: 20,
    alignItems: "center",
    zIndex: 1,
  },
  progressLabel: {
    fontSize: 12,
    lineHeight: 12*1.5,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 8,
  },
  leftProgressBar: {
    width: 8,
    height: 120,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  rightProgressBar: {
    width: 8,
    height: 120,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  leftProgressFill: {
    width: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 4,
  },
  rightProgressFill: {
    width: "100%",
    backgroundColor: "#FBBF24",
    borderRadius: 4,
  },
  levelIndicator: {
    flexDirection: "row",
    marginTop: 10,
  },
  levelText: {
    fontSize: 16,
    lineHeight: 16*1.5,
    fontFamily: 'PoppinsRegular',
    color: "#374151",
    marginHorizontal: ((Dimensions.get("window").width * .85) - (Dimensions.get("window").width * .65)) / 6,
    marginBottom: ((Dimensions.get("window").width * .85) - (Dimensions.get("window").width * .65)) / 8
  },
  progressArc: {
    position: "absolute",
    marginTop: -((Dimensions.get("window").width * .85) - (Dimensions.get("window").width * .65)) / 2,
  },
  divider: {
    height: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  streakProgressFire: {
    width: 17,
    height: 24,
    resizeMode: "contain",
  },
  icon: {
    width: 20,
    height: 20,
    margin: 0,
    marginRight: 5,
    resizeMode: 'contain'
  },
})

