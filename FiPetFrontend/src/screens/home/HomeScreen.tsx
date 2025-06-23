"use client"
import { useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { AnimatedCircularProgress } from 'react-native-circular-progress'

export default function HomeScreen() {
  const [xp, setXp] = useState(650)
  const [level, setLevel] = useState(6)
  const [mood, setMood] = useState(65)
  const petData = {
    level: 3,
    currentXP: xp,
    requiredXP: 1000,
    stats: {
      coins: 1400,
      trophies: 6,
      streak: 3,
    },
  }

  const xpPercentage = (petData.currentXP / petData.requiredXP) * 100
  const levelProgress = 65

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#F97216", "#F99F16"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <Text style={styles.headerText}>Home</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Image source={require("@/src/assets/images/temp-fox-logo.png")} style={styles.icon} />
            <Text style={styles.statText}>6</Text>
          </View>
          <View style={styles.statItem}>
            <Image source={require("@/src/assets/images/temp-fox-logo.png")} style={styles.icon} />
            <Text style={styles.statText}>3</Text>
          </View>
          <View style={styles.statItem}>
            <Image source={require("@/src/assets/images/temp-fox-logo.png")} style={styles.icon} />
            <Text style={styles.statText}>1400</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.petSection}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', }}>
          <Text style={[styles.levelText, { marginBottom: -20 }]}>Level</Text>
          <View style={styles.petContainer}>
            <AnimatedCircularProgress
              size={320}
              width={14}
              fill={levelProgress}
              tintColor="#FBBF24"
              backgroundColor="#E5E7EB"
              rotation={210}
              arcSweepAngle={110}
              lineCap="round"
              style={[styles.progressArc, { transform: [{ scaleX: -1 }] }]}
            />

            <AnimatedCircularProgress
              size={320}
              width={14}
              fill={mood}
              tintColor="#3B82F6"
              backgroundColor="#E5E7EB"
              rotation={210}
              arcSweepAngle={110}
              lineCap="round"
              style={styles.progressArc}
            />
            <View style={styles.petCircle}>
              <Image source={require("@/src/assets/images/temp-fox-logo.png")} style={styles.petImage} />
            </View>
          </View>
          <Text style={[styles.levelText, { marginBottom: -20 }]}>Mood</Text>
        </View>

        <View style={styles.levelIndicator}>
          <Text style={styles.levelText}>Level {level}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Streak</Text>
        <Text style={styles.sectionSubtitle}>Earn XP to add to your daily streak</Text>
        <LinearGradient
          colors={["#D26AFF", "#2D8EFF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.progressCard}
        >
          <View style={{ justifyContent: "center" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.left}>🔥</Text>
                <Text style={styles.left}>F</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.left}>🔥</Text>
                <Text style={styles.left}>S</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.left}>🔥</Text>
                <Text style={styles.left}>S</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.left}>🔥</Text>
                <Text style={styles.left}>M</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.left}>🔥</Text>
                <Text style={styles.left}>T</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.left}>🔥</Text>
                <Text style={styles.left}>W</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.left}>🔥</Text>
                <Text style={styles.left}>T</Text>
              </View>
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
              <Text style={styles.cardButton}>Today's Progress</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quests</Text>
        <Text style={styles.sectionSubtitle}>Complete quests to earn extra XP</Text>
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
            <Text style={styles.playText}>Play</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  },
  statText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  petSection: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 20
  },
  petContainer: {
    position: "relative",
    alignItems: "center",
  },
  petCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#F9FAFB",
    borderWidth: 0,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  sectionSubtitle: {
    color: "#666",
    marginBottom: 10,
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
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  questSubtitle: {
    color: "#fff",
    fontSize: 13,
    marginTop: 2,
    maxWidth: 200,
  },
  playButton: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  playText: {
    color: "#F97216",
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
    alignItems: "center",
    marginTop: 25,
  },
  levelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  progressArc: {
    position: "absolute",
    marginTop: -20
  },
  divider: {
    height: 2,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 20,
    marginBottom: 20,
  },
})

