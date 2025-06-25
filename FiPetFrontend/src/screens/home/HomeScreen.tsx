"use client"
import { useEffect, useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { useAuth } from "@/src/hooks/useAuth"
import { db } from "@/src/config/firebase"
import { doc, getDocs, collection, onSnapshot, query, where, orderBy, Timestamp, setDoc, serverTimestamp, updateDoc } from "@firebase/firestore"
import { getLevelXPRequirement, getStreakXPRequirement } from "@/src/functions/getXPRequirement"
import { UserProgress, dayAbbreviations, StreakProgress, StreakDay } from "@/src/types/UserProgress"


const STREAK_DISPLAY_LEN = 7;
const MILLIS_IN_DAY = 1000 * 60 * 60 * 24;

/**
 * Modifies the date passed in to be the timestamp at the start of the day.
 */
function startOfDay ( date: Date ): Date {
  let sod = new Date(date);
  sod.setHours(0);
  sod.setMinutes(0);
  sod.setSeconds(0);
  sod.setMilliseconds(0);
  return sod;
}

export default function HomeScreen() {

  const [mood, setMood] = useState(25)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 0,
    currentXP: 0,
    earnedXP: 0,
    requiredLevelXP: 0,
    requiredStreakXP: 0,
    coins: 0,
  });
  const [streakProgress, setStreak] = useState<StreakProgress>({
    currentStreak: 0,
    days: []
  });
  const _auth = useAuth();
  const user = _auth.userState;

  function loadStreakInfo() {

    if ( !user ) {
      return;
    }
    
    const streakCollection = collection( db, 'users', user.uid, 'streakData' );
    const today = startOfDay( new Date() );

    const displayStartDate = new Date(today.valueOf() - ((STREAK_DISPLAY_LEN-1) * MILLIS_IN_DAY));
    const displayStartTimestamp = new Timestamp(displayStartDate.getSeconds(), displayStartDate.getMilliseconds());
    const streakQuery = query(
      streakCollection,
      where("endTime", ">=", displayStartTimestamp),
      orderBy("endTime", "asc")
    );

    getDocs(streakQuery).then(async (snapshot) => {

      let i = 0;
      let currentDate = new Date(displayStartDate);
      let days: StreakDay[] = [];

      while( currentDate.valueOf() < today.valueOf() ) {

        const currentDay = currentDate.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;

        if ( i >= snapshot.docs.length ) {
          days.push({
            dayAbbreviation: dayAbbreviations[currentDay],
            achieved: false
          });
          currentDate = new Date( currentDate.valueOf() + MILLIS_IN_DAY );
          continue;
        }

        const streakStartTimestamp = snapshot.docs[i].get("startTime", {serverTimestamps: 'estimate'}) as Timestamp;
        const streakStartDate = startOfDay(streakStartTimestamp.toDate());
        const streakDuration = snapshot.docs[i].get("duration") as number;

        if ( currentDate.valueOf() <  streakStartDate.valueOf() ) {
          days.push({
            dayAbbreviation: dayAbbreviations[currentDay],
            achieved: false
          });
          currentDate = new Date( currentDate.valueOf() + MILLIS_IN_DAY );
        } else if ( currentDate.valueOf() > streakStartDate.valueOf() + ((streakDuration - 1) * MILLIS_IN_DAY ) ) {
          i ++;
        } else {
          days.push({
            dayAbbreviation: dayAbbreviations[currentDay],
            achieved: true
          });
          currentDate = new Date( currentDate.valueOf() + MILLIS_IN_DAY );
        }
      }

      let _currentStreak;
      const currentDay = today.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      if ( i < snapshot.docs.length ) {
        const streakStart = snapshot.docs[i].get("startTime") as Timestamp;
        _currentStreak = ((today.valueOf() - startOfDay(streakStart.toDate()).valueOf()) / MILLIS_IN_DAY) + 1;
        await updateDoc(snapshot.docs[i].ref, {
          endTime: serverTimestamp(),
          duration: _currentStreak,
        });
        days.push({
          dayAbbreviation: dayAbbreviations[currentDay],
          achieved: true
        });
      } else {
        const refName = `${today.getMonth().toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}-${today.getFullYear()}`;
        const streakDocRef = doc( streakCollection, refName );
        await setDoc(streakDocRef, {
          startTime: serverTimestamp(),
          endTime: serverTimestamp(),
          duration: 1,
        });
        _currentStreak = 1;
        days.push({
          dayAbbreviation: dayAbbreviations[currentDay],
          achieved: true
        });
      }

      setStreak({
        currentStreak: _currentStreak,
        days: days
      });

    }).catch((error) => {
      console.error(error);
    });

  }

  function loadProgressInfo() {

    if ( !user ) {
      return;
    }
    
    const userDocRef = doc( db, 'users', user.uid );

    const progressUnsub = onSnapshot( userDocRef, {
      next: (snapshot) => {
        const userData = snapshot.data();
        const level = userData?.current_level || 0;
        const previousXP = userData?.previous_xp || 0;
        const currentXP = userData?.current_xp || 0;
        setUserProgress({
          level: level,
          currentXP: currentXP,
          earnedXP: currentXP - previousXP,
          requiredLevelXP: getLevelXPRequirement(level),
          requiredStreakXP: getStreakXPRequirement(level, streakProgress),
          coins: userData?.coins || 0,
        })
      },
      error: (err) => {
        console.error( err );
      }
    });

    return progressUnsub;
  }

  useEffect(loadStreakInfo, [user]);
  useEffect(loadProgressInfo, [user, streakProgress]);

  const xpPercentage = Math.min((userProgress.earnedXP / userProgress.requiredStreakXP) * 100, 100) || 0;
  const levelProgress = Math.round(Math.min((userProgress.currentXP / userProgress.requiredLevelXP) * 100, 100)) || 0;

  const windowWidth = Dimensions.get("window").width
  const petCircleSize = windowWidth * 0.65
  const progressSize = windowWidth * 0.85

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#F97216", "#F99F16"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <Text style={styles.headerText}>Home</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Image source={require("@/src/assets/images/xp.png")} style={styles.icon} />
            <Text style={styles.statText}>{userProgress.currentXP}</Text>
          </View>
          <View style={styles.statItem}>
            <Image source={require("@/src/assets/images/streak.png")} style={styles.icon} />
            <Text style={styles.statText}>{streakProgress.currentStreak}</Text>
          </View>
          <View style={styles.statItem}>
            <Image source={require("@/src/assets/images/coin.png")} style={styles.icon} />
            <Text style={styles.statText}>{userProgress.coins}</Text>
          </View>
        </View>
      </LinearGradient>

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
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#374151" }}>Level {userProgress.level}</Text>
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
                    <Text style={styles.left}>{day.achieved ? "🔥" : " "}</Text>
                    <Text style={styles.left}>{day.dayAbbreviation}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.left}>Weekly Streak Calendar</Text>
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
            <TouchableOpacity style={styles.playButton}>
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
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 7,
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 5,
    resizeMode: 'contain'
  },
  statText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
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
    fontWeight: "bold",
    color: "#222",
  },
  sectionSubtitle: {
    color: "#666",
    marginBottom: 10,
    fontSize: 14
  },
  progressCard: {
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "bold",
  },
  right: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  cardButton: {
    color: "#2D8EFF",
    fontWeight: "bold",
  },
  quest: {
    borderRadius: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  questSubtitle: {
    color: "#fff",
    fontSize: 13,
    marginTop: 2,
    maxWidth: 200,
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
    fontWeight: "bold",
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
    fontWeight: "600",
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
})

