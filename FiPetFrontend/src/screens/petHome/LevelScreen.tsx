"use client"
import { View, Text, StyleSheet, ScrollView, Dimensions, SafeAreaView, Image, ViewStyle, StyleProp, ImageStyle, TouchableOpacity } from "react-native"
import { useFonts } from 'expo-font'
import TabHeader from "@/src/components/TabHeader"
import { useGamificationStats } from "@/src/hooks/useGamificationStats"
import { AnimatedCircularProgress } from 'react-native-circular-progress'
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"


export default function LevelScreen() {
  const { userProgress, streakProgress } = useGamificationStats()
  const screenWidth = Dimensions.get("window").width;
  const trophyWidth = screenWidth * 0.4;
  let levels = new Array<number>();
  levels.length = 20;
  levels = levels.fill(0, 0, 20);

  const router = useRouter();

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

  /**
   * Draws a trophy icon.
   *
   * @param {object} params
   * @param {number} params.size is the width/height of the trophy.
   * @param {number} params.level is the level, if set the number will appear as text on top of the trophy.
   */
  function Trophy({size, trophyStyle, level}: {size: number, trophyStyle: ImageStyle, level?: number}) {

      let imageSource = require("@/src/assets/images/trophy.png");
      let _trophyStyle = {
        ...trophyStyle,
        width: size,
        height: size,
      }

      const fontSize = Math.min(
        size * 0.6,
        size / (1.0 * `${level}`.length)
      );

      if ( level !== null ) {
        _trophyStyle = {
          ..._trophyStyle,
          position: "absolute",
        }
        return (
          <View style={{
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Image style={_trophyStyle} source={imageSource}/>
            <Text style={{
              fontFamily: "PoppinsBold",
              position: "absolute",
              fontSize: fontSize,
            }}>{level}</Text>
          </View>
        );

      } else {
        return (<Image style={_trophyStyle} source={imageSource}/>);
      }
  }

  /**
   * Draws a trophy icon with a progress bar around it indicating the progress towards level completion.
   *
   * @param {object} params
   * @param {number} params.size is the width/height of the component.
   * @param {number} params.progress is a completion percentage (0-100)
   * @param {number} params.level is the level, if set the number will appear as text on top of the trophy.
   */
  function TrophyProgress({size, progress, level, style}: {size: number, progress: number, level?: number, style?: StyleProp<ViewStyle>}) {
    const lineWidth = size*0.07;
    const imagePadding = size*0.15;

    let fillColor = "#FEBF01";
    if (progress === 100 ) {
      fillColor = "#28B031";
    }

    let trophyStyle: StyleProp<ImageStyle> = {
      opacity: progress === 100 ? 0.4 : 0.8,
    };
    let trophySize = size - ((lineWidth + imagePadding) * 2);

    return (
      <AnimatedCircularProgress
        style={style}
        size={size}
        width={lineWidth}
        fillLineCap="round"
        duration={1000}
        fill={progress}
        rotation={180}
        tintColor={fillColor}
        backgroundColor="#D1D3D4"
        children={() => { // @ts-ignore There is an error if I don't pass the child as props...
          return <Trophy size={trophySize} level={level} trophyStyle={trophyStyle}/>
        }}
      >
      </AnimatedCircularProgress>
    );
  }

  return (
    <View style={styles.container}>
      <TabHeader
        xp={userProgress.currentXP}
        coins={userProgress.coins}
        streak={streakProgress.currentStreak}
        title="Level"
        gradient={{
          startColor: "#168FF9",
          endColor: "#16D3F9",
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backArrowContainer}>
          <Image
            source={require('@/src/assets/images/arrow.png')}
            style={styles.backArrow}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.trophyContainer}>
          <TrophyProgress size={trophyWidth} progress={userProgress.levelProgress} />
          <LinearGradient
            colors={["#f3f3f3", "#e9e9e9", "#e9e9e9", "#c7c7c7"]}
            locations={[0.05, 0.1, 0.9, 1.0]}
            style={{
              borderRadius: 14,
              paddingHorizontal: 5,
              paddingVertical: 3,
              height: 40,
              width: trophyWidth,
            }}
          >
            <Text style={styles.levelText}>Level {userProgress.level}</Text>
          </LinearGradient>
        </View>
        <LinearGradient
          colors={["#f0f0f0", "#e4e4e4", "#c7c7c7"]}
          locations={[0.1, 0.6, 1.0]}
          style={styles.divider}
        />
        <View style={styles.levelGrid}>
          {levels.map((_, ind) => 
            <TrophyProgress
            key={ind}
            size={screenWidth * 0.13}
            level={ind+1}
            style={{
              flexGrow: 0,
            }}
            progress={userProgress.level > ind+1 ? 100 : (userProgress.level === ind+1 ? userProgress.levelProgress : 0)}/>
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
  levelText: {
    fontFamily: "PoppinsRegular",
    fontSize: 24,
    width: "100%",
    textAlign: "center",
  },
  content: {
    flex: 1,
    flexDirection: "column",
    alignItems: 'center',
    alignContent: 'center',
    paddingVertical: "10%",
    gap: "5%",
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
  divider: {
    height: 6,
    width: "70%",
    borderRadius: 3,
  },
  trophyContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: "5%",
    gap: "5%",
  },
  levelGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Dimensions.get("screen").width * 0.05,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "67%",
  },
  backArrowContainer: {
    top: "5%",
    left: "5%",
    position: "absolute",
    padding: 8,
  },
  backArrow: {
    width: 32,
    height: 24,
  },
})
