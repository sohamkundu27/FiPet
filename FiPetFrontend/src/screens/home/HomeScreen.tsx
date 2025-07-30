"use client"
import React from 'react';
import { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, SafeAreaView, Pressable } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { useFonts } from 'expo-font';
import TabHeader from "@/src/components/TabHeader"
import { useGamificationStats } from "@/src/hooks/useGamificationStats"
import { getFontSize } from '@/src/hooks/useFont';
import { useRouter, usePathname, useFocusEffect } from 'expo-router';
import { Quest } from '@/src/services/quest/Quest';
import { useAuth } from '@/src/hooks/useRequiresAuth';
import { collection, limit, query } from '@firebase/firestore';
import { db } from '@/src/config/firebase';
import { QUEST_COLLECTION } from '@/src/types/quest';

export default function HomeScreen() {

  const { level, streak, mood, coins, addMood } = useGamificationStats();
  const [quests, setQuests] = useState<Quest[] | null>(null);
  const moodProgress = useRef<AnimatedCircularProgress>(null);
  const levelProgress = useRef<AnimatedCircularProgress>(null);

  const router = useRouter();
  const pathname = usePathname();
  const oldPathName = useRef<string>("");
  const currentPathName = useRef<string>(pathname);

  const streakProgress = streak.progress;

  const windowWidth = Dimensions.get("window").width
  const petCircleSize = windowWidth * 0.65
  const progressSize = windowWidth * 0.85

  const [loaded] = useFonts({
    PoppinsBold: require('@/src/assets/fonts/Poppins-Bold.ttf'),
    PoppinsMedium: require('@/src/assets/fonts/Poppins-Medium.ttf'),
    PoppinsRegular: require('@/src/assets/fonts/Poppins-Regular.ttf'),
    PoppinsSemiBold: require('@/src/assets/fonts/Poppins-SemiBold.ttf'),
  });

  const { user } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      async function fetchQuest() {
        const questQuery = query(collection(db, QUEST_COLLECTION), limit(2));
        const quests = await Quest.fromFirebaseQuery(db, questQuery, false, false, user.uid);
        setQuests(quests.filter((quest) => !quest.isComplete));
      }
      fetchQuest();
    }, [user])
  );

  function didRouteChange(pathname: string) {
    return pathname !== oldPathName.current;
  }

  useEffect(() => {
    oldPathName.current = currentPathName.current;
    currentPathName.current = pathname;
  }, [pathname, mood, level, streak]);

  useEffect(() => {
    moodProgress.current?.reAnimate(didRouteChange(pathname) ? 0 : mood.previous, mood.current, 1000);
  }, [mood, pathname]);

  useEffect(() => {
    levelProgress.current?.reAnimate(didRouteChange(pathname) ? 0 : level.previousProgress, level.progress, 1000);
  }, [level.progress, level.previousProgress, pathname]);

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
                ref={moodProgress}
                size={progressSize}
                width={14}
                fill={0}
                tintColor="#FBBF24"
                backgroundColor="#E5E7EB"
                rotation={227}
                arcSweepAngle={90}
                lineCap="round"
                style={[styles.progressArc, { transform: [{ scaleX: -1 }] }]}
              />

              <AnimatedCircularProgress
                ref={levelProgress}
                size={progressSize}
                width={14}
                fill={0}
                tintColor="#3B82F6"
                backgroundColor="#E5E7EB"
                rotation={227}
                arcSweepAngle={90}
                lineCap="round"
                style={styles.progressArc}
              />
              <View style={styles.petCircle}>
                <Pressable
                  onPress={() => {
                    addMood(5);
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    {mood.moodClassification === "Happy" ?
                      <Image source={require("@/src/assets/images/happy-fox.png")} style={{ width: petCircleSize * .88, height: petCircleSize * .88, resizeMode: "contain", zIndex: 1 }} /> :
                      mood.moodClassification === "Bored" ?
                        <Image source={require("@/src/assets/images/fox_no_shadow.png")} style={{ width: petCircleSize * .88, height: petCircleSize * .88, resizeMode: "contain", marginTop: ((Dimensions.get("window").width * .85) - (Dimensions.get("window").width * .65)) / 8, zIndex: 1, marginLeft: petCircleSize * .88 * 0.095454 }} /> :

                        <Image source={require("@/src/assets/images/sad-fox.png")} style={{ width: petCircleSize * .88, height: petCircleSize * .88, resizeMode: "contain", zIndex: 1 }} />
                    }
                    {mood.moodClassification === "Bored" ?
                      <Image source={require("@/src/assets/images/fox-shadow.png")} style={{ width: petCircleSize * .75, height: petCircleSize * .09, resizeMode: 'contain', position: 'absolute', bottom: -((Dimensions.get("window").width * .85) - (Dimensions.get("window").width * .65)) / 18 }} /> :

                      <Image source={require("@/src/assets/images/fox-shadow.png")} style={{ width: petCircleSize * .75, height: petCircleSize * .09, resizeMode: 'contain', position: 'absolute', bottom: -((Dimensions.get("window").width * .85) - (Dimensions.get("window").width * .65)) / 8 }} />

                    }
                  </View>
                </Pressable>
              </View>
            </View>
            <Text style={styles.levelText}>Mood</Text>
          </View>

          <View style={styles.levelIndicator}>
            <Image source={require("@/src/assets/images/trophy.png")} style={styles.icon} />
            <Text style={{ fontSize: getFontSize(16), lineHeight: getFontSize(16) * 1.3, fontFamily: 'PoppinsRegular', color: "#374151" }}>Level {level.current}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={{ flexDirection: 'row', }}>
            <Image source={require("@/src/assets/images/daily-streak.png")} style={{ width: Dimensions.get("window").width * .15, height: Dimensions.get("window").width * .15, resizeMode: 'contain', marginRight: 5 }} />
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
                {streak.days.map((day, key) => (
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
                    style={[styles.progressBarFill, { width: `${streakProgress}%` }]}
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
            <Image source={require("@/src/assets/images/quest-selected.png")} style={{ width: Dimensions.get("window").width * .15, height: Dimensions.get("window").width * .15, resizeMode: 'contain' }} />
            <View>
              <Text style={styles.sectionTitle}>Quests</Text>
              <Text style={styles.sectionSubtitle}>Complete quests to earn extra XP</Text>
            </View>
          </View>
          {quests && quests.length > 0 ? (
            quests?.map((quest) => {
              return (
                <LinearGradient
                  key={quest.id}
                  colors={["#F97216", "#F9C116"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.quest}
                >
                  <View style={styles.questContent}>
                    <Text style={styles.questTitle}>
                      {quest.title}
                    </Text>
                    <Text style={styles.questSubtitle}>
                      {quest.description}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => {
                      router.push(`/quests/${quest.id}`);
                    }}
                  >
                    <Image source={require("@/src/assets/images/play.png")} style={{ width: Dimensions.get("window").width / 6.8, height: Dimensions.get("window").width / 6.8 }} />
                    <Text style={styles.playText}>Play</Text>
                  </TouchableOpacity>
                </LinearGradient>
              );
            })
          ) : (
            <LinearGradient
              colors={["#F97216", "#F9C116"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.quest}
            >
              <View style={styles.questContent}>
                <Text style={styles.questTitle}>
                  Quest Completed!
                </Text>
                <Text style={styles.questSubtitle}>
                  You’ve finished all available quests.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.playButton}
              >
                <Image source={require("@/src/assets/images/done.png")} style={{ width: Dimensions.get("window").width / 6.8, height: Dimensions.get("window").width / 6.8 }} />
                <Text style={styles.playText}>Done</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
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
    fontSize: getFontSize(18),
    lineHeight: getFontSize(18) * 1.5,
    color: '#4A5568',
    fontFamily: 'PoppinsRegular',
  },
  petSection: {
    alignItems: "center",
    marginTop: 25,
    marginBottom: 10,
  },
  petContainer: {
    position: "relative",
    alignItems: "center",
  },
  petCircle: {
    width: Dimensions.get("window").width * .65,
    height: Dimensions.get("window").width * .65,
    //borderRadius: 500,
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
    fontSize: getFontSize(24),
    lineHeight: getFontSize(24) * 1.5,
    fontFamily: 'PoppinsBold',
    color: "#222",
  },
  sectionSubtitle: {
    color: "#666",
    marginBottom: 10,
    fontSize: getFontSize(14),
    lineHeight: getFontSize(14) * 1.5,
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
    fontSize: getFontSize(15),
    lineHeight: getFontSize(15) * 1.5,
    fontFamily: 'PoppinsSemiBold'
  },
  left2: {
    color: "#fff",
    fontSize: getFontSize(13),
    lineHeight: getFontSize(13) * 1.5,
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
    fontSize: getFontSize(13),
    lineHeight: getFontSize(13) * 1.5,
  },
  quest: {
    borderRadius: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 25,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10
  },
  questContent: {
    flex: 1,
    marginRight: 12,
  },
  questTitle: {
    color: "#fff",
    fontFamily: 'PoppinsSemiBold',
    fontSize: getFontSize(20),
    lineHeight: getFontSize(20) * 1.5,
  },
  questSubtitle: {
    color: "#fff",
    fontSize: getFontSize(13),
    lineHeight: getFontSize(13) * 1.5,
    marginTop: 2,
    maxWidth: Dimensions.get("window").width * .6,
    fontFamily: 'PoppinsRegular'
  },
  playButton: {
    paddingVertical: 8,
    //paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playText: {
    color: "white",
    fontSize: getFontSize(15),
    lineHeight: getFontSize(15) * 1.5,
    fontFamily: 'PoppinsMedium'
  },
  progressBarContainer: {
    marginBottom: 10,
    alignItems: "center",
    width: "100%",
  },
  progressBarBackground: {
    height: Dimensions.get("window").width * .02,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 100,
    overflow: "hidden",
  },
  progressBarFill: {
    height: Dimensions.get("window").width * .02,
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
    fontSize: getFontSize(12),
    lineHeight: getFontSize(12) * 1.5,
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
    fontSize: getFontSize(16),
    lineHeight: getFontSize(16) * 1.5,
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
    width: Dimensions.get("window").width * .05,
    height: Dimensions.get("window").width * .06,
    resizeMode: "contain",
  },
  icon: {
    width: Dimensions.get("window").width * .05,
    height: Dimensions.get("window").width * .05,
    margin: 0,
    marginRight: 5,
    resizeMode: 'contain'
  },
})
