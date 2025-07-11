import React from "react";
import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet, Text, View, Image, ColorValue } from "react-native";

type TabHeaderProps = {
  xp: number,
  streak: number,
  coins: number,
  gradient?: {
    startColor: ColorValue,
    endColor:  ColorValue,
  }
  title: string,
}

export default function TabHeader({xp, streak, coins, gradient, title}: TabHeaderProps) {
  return (
    <LinearGradient colors={[gradient?.startColor || "#F97216", gradient?.endColor || "#F99F16"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Image source={require("@/src/assets/images/xp.png")} style={styles.icon} />
          <Text style={styles.statText}>{xp}</Text>
        </View>
        <View style={styles.statItem}>
          <Image source={require("@/src/assets/images/streak.png")} style={styles.icon} />
          <Text style={styles.statText}>{streak}</Text>
        </View>
        <View style={styles.statItem}>
          <Image source={require("@/src/assets/images/coin.png")} style={styles.icon} />
          <Text style={styles.statText}>{coins}</Text>
        </View>
      </View>
    </LinearGradient>
  );

}

const styles = StyleSheet.create({
  header: {
    paddingTop: 65,
    paddingHorizontal: 20,
    paddingBottom: 7,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    lineHeight: 24 * 1.5,
    fontFamily: "PoppinsBold",
    color: "#fff",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    backgroundColor: "#E9E9E9",
    borderRadius: 20,
    padding: 0,
    height: 29,
    paddingHorizontal: 15,
  },
  icon: {
    width: 20,
    height: 20,
    margin: 0,
    marginRight: 5,
    resizeMode: 'contain'
  },
  statText: {
    color: "black",
    fontFamily: 'PoppinsRegular',
    fontSize: 15,
    margin: 0,
    lineHeight: 15 * 1.5,
    position: "relative",
    top: 1,
  },
});
