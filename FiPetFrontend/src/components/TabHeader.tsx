import React from "react";
import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet, Text, View, Image, ColorValue, Dimensions } from "react-native";
import { getFontSize } from '@/src/hooks/useFont';

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
    fontSize: getFontSize(24),
    lineHeight: getFontSize(24) * 1.5,
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
    marginLeft: Dimensions.get("window").width * .02,
    backgroundColor: "#E9E9E9",
    borderRadius: 100,
    padding: 0,
    height: Dimensions.get("window").width * .07,
    paddingHorizontal: Dimensions.get("window").width * .03,
  },
  icon: {
    width: Dimensions.get("window").width * .05,
    height: Dimensions.get("window").width * .05,
    margin: 0,
    marginRight: 5,
    resizeMode: 'contain'
  },
  statText: {
    color: "black",
    fontFamily: 'PoppinsRegular',
    fontSize: getFontSize(15),
    margin: 0,
    lineHeight: getFontSize(15) * 1.5,
    position: "relative",
    top: 1,
  },
});
