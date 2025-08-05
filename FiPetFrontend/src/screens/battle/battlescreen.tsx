"use client"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Dimensions } from "react-native"
import { useFonts } from 'expo-font'
import TabHeader from "@/src/components/TabHeader"
import { useGamificationStats } from "@/src/hooks/useGamificationStats"
import { LinearGradient } from 'expo-linear-gradient'

export default function BattleScreen() {
  const { level, streak, coins } = useGamificationStats();
  const { width, height } = Dimensions.get('window');
  
  const scale = width / 375;
  
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
          <Text style={[styles.loadingText, { fontSize: 18 * scale }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const dynamicStyles = {
    // padding and margins
    sectionMargin: 20 * scale,
    sectionGap: 32 * scale,
    headerMargin: 16 * scale,
    contentMargin: 12 * scale,
    horizontalPadding: Math.max(20, (width - 375) * 0.1),
    
    // icon sizes
    sectionIconSize: 55 * scale,
    buttonIconSize: 24 * scale,
    xpIconSize: 20 * scale,
    streakIconSize: 20 * scale,
    
    // font sizes
    sectionTitleSize: 22 * scale,
    sectionSubtitleSize: 15 * scale,
    buttonTextSize: 18 * scale,
    tableHeaderSize: 14 * scale,
    tableRowSize: 15 * scale,
    
    // padding and spacing
    buttonPaddingVertical: 14 * scale,
    buttonPaddingHorizontal: 18 * scale,
    leaderboardPadding: 16 * scale,
    rowPaddingVertical: 12 * scale,
    
    // border radius
    buttonRadius: 16 * scale,
    leaderboardRadius: 20 * scale,
    
    // shadows
    shadowRadius: 8 * scale,
    shadowOffset: { width: 0, height: 4 * scale },
  };

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

      <ScrollView 
        contentContainerStyle={{
          paddingTop: 20 * scale,
          paddingBottom: 40 * scale,
          paddingHorizontal: dynamicStyles.horizontalPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Play Section */}
        <View style={{
          marginBottom: dynamicStyles.sectionGap,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: dynamicStyles.headerMargin,
          }}>
            <Image 
              source={require("@/src/assets/images/daily-streak.png")} 
              style={{
                width: dynamicStyles.sectionIconSize,
                height: dynamicStyles.sectionIconSize,
                marginRight: 12 * scale,
                resizeMode: 'contain',
              }} 
            />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: dynamicStyles.sectionTitleSize,
                fontFamily: 'PoppinsBold',
                color: "#1F2937",
              }}>
                Live Play
              </Text>
              <Text style={{
                fontSize: dynamicStyles.sectionSubtitleSize,
                fontFamily: 'PoppinsRegular',
                color: "#6B7280",
                marginTop: 2 * scale,
              }}>
                Play against real users to earn extra XP
              </Text>
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12 * scale,
            marginTop: dynamicStyles.contentMargin,
          }}>
            <TouchableOpacity 
              style={{
                flex: 1,
                backgroundColor: '#F3F4F6',
                borderRadius: dynamicStyles.buttonRadius,
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowOffset: dynamicStyles.shadowOffset,
                shadowRadius: dynamicStyles.shadowRadius,
                elevation: 6,
              }}
              activeOpacity={0.8}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: dynamicStyles.buttonPaddingVertical,
                paddingHorizontal: dynamicStyles.buttonPaddingHorizontal,
              }}>
                <Image 
                  source={require("@/src/assets/images/play.png")} 
                  style={{
                    width: dynamicStyles.buttonIconSize,
                    height: dynamicStyles.buttonIconSize,
                    resizeMode: 'contain',
                    marginRight: 8 * scale,
                  }} 
                />
                <Text style={{
                  fontFamily: 'PoppinsSemiBold',
                  fontSize: dynamicStyles.buttonTextSize,
                  color: '#4F46E5',
                }}>
                  Start A Game
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{
                flex: 1,
                borderRadius: dynamicStyles.buttonRadius,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowOffset: dynamicStyles.shadowOffset,
                shadowRadius: dynamicStyles.shadowRadius,
                elevation: 6,
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#A855F7', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: dynamicStyles.buttonPaddingVertical,
                  paddingHorizontal: dynamicStyles.buttonPaddingHorizontal,
                }}
              >
                <Image 
                  source={require("@/src/assets/images/play.png")} 
                  style={{
                    width: dynamicStyles.buttonIconSize,
                    height: dynamicStyles.buttonIconSize,
                    resizeMode: 'contain',
                    marginRight: 8 * scale,
                  }} 
                />
                <Text style={{
                  fontFamily: 'PoppinsSemiBold',
                  fontSize: dynamicStyles.buttonTextSize,
                  color: '#fff',
                }}>
                  Find A Game
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leaderboard Section */}
        <View style={{
          marginBottom: dynamicStyles.sectionGap,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: dynamicStyles.headerMargin,
          }}>
            <Image 
              source={require("@/src/assets/images/daily-streak.png")} 
              style={{
                width: dynamicStyles.sectionIconSize,
                height: dynamicStyles.sectionIconSize,
                marginRight: 12 * scale,
                resizeMode: 'contain',
              }} 
            />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: dynamicStyles.sectionTitleSize,
                fontFamily: 'PoppinsBold',
                color: "#1F2937",
              }}>
                Leaderboard
              </Text>
              <Text style={{
                fontSize: dynamicStyles.sectionSubtitleSize,
                fontFamily: 'PoppinsRegular',
                color: "#6B7280",
                marginTop: 2 * scale,
              }}>
                Earn XP to add to your daily streak
              </Text>
            </View>
          </View>

          <View style={{
            backgroundColor: '#fff',
            borderRadius: dynamicStyles.leaderboardRadius,
            padding: dynamicStyles.leaderboardPadding,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: dynamicStyles.shadowRadius * 1.5,
            shadowOffset: dynamicStyles.shadowOffset,
            elevation: 5,
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingBottom: 12 * scale,
              borderBottomColor: '#E5E7EB',
              borderBottomWidth: 1,
              marginBottom: 8 * scale,
            }}>
              <Text style={{
                width: '18%',
                fontFamily: 'PoppinsMedium',
                fontSize: dynamicStyles.tableHeaderSize,
                color: '#6B7280',
                textAlign: 'left',
              }}>
                Place
              </Text>
              <Text style={{
                width: '32%',
                fontFamily: 'PoppinsMedium',
                fontSize: dynamicStyles.tableHeaderSize,
                color: '#6B7280',
                textAlign: 'left',
              }}>
                Username
              </Text>
              <Text style={{
                width: '25%',
                fontFamily: 'PoppinsMedium',
                fontSize: dynamicStyles.tableHeaderSize,
                color: '#6B7280',
                textAlign: 'right',
              }}>
                XP
              </Text>
              <Text style={{
                width: '25%',
                fontFamily: 'PoppinsMedium',
                fontSize: dynamicStyles.tableHeaderSize,
                color: '#6B7280',
                textAlign: 'right',
              }}>
                Streak
              </Text>
            </View>

            {/* Leaderboard Rows */}
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
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: dynamicStyles.rowPaddingVertical,
                  alignItems: 'center',
                }}>
                  <Text style={{
                    width: '18%',
                    fontSize: dynamicStyles.tableRowSize,
                    fontFamily: 'PoppinsRegular',
                    color: '#1F2937',
                  }}>
                    {`${index + 4}th`}
                  </Text>
                  <Text 
                    style={{
                      width: '32%',
                      fontSize: dynamicStyles.tableRowSize,
                      fontFamily: 'PoppinsRegular',
                      color: '#374151',
                      overflow: 'hidden',
                    }} 
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                  >
                    {user.name}
                  </Text>
                  <View style={{
                    width: '25%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}>
                    <Text style={{
                      fontSize: dynamicStyles.tableRowSize,
                      fontFamily: 'PoppinsMedium',
                      color: '#3B82F6',
                    }}>
                      {user.score}
                    </Text>
                    <Image 
                      source={require("@/src/assets/images/xp.png")} 
                      style={{
                        width: dynamicStyles.xpIconSize,
                        height: dynamicStyles.xpIconSize,
                        marginLeft: 6 * scale,
                        resizeMode: 'contain',
                      }} 
                    />
                  </View>
                  <View style={{
                    width: '25%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}>
                    <Text style={{
                      fontSize: dynamicStyles.tableRowSize,
                      fontFamily: 'PoppinsMedium',
                      color: '#F59E0B',
                    }}>
                      {user.streak.toLocaleString()}
                    </Text>
                    <Image 
                      source={require("@/src/assets/images/streak-fire-full.png")} 
                      style={{
                        width: dynamicStyles.streakIconSize,
                        height: dynamicStyles.streakIconSize,
                        marginLeft: 6 * scale,
                        resizeMode: 'contain',
                      }} 
                    />
                  </View>
                </View>
                <View style={{
                  height: 1,
                  backgroundColor: '#E5E7EB',
                  marginVertical: 4 * scale,
                }} />
              </View>
            ))}

            {/* User's Row */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: dynamicStyles.rowPaddingVertical,
              alignItems: 'center',
            }}>
              <Text style={{
                width: '18%',
                fontSize: dynamicStyles.tableRowSize,
                fontFamily: 'PoppinsBold',
                color: '#1F2937',
              }}>
                3,042
              </Text>
              <Text 
                style={{
                  width: '32%',
                  fontSize: dynamicStyles.tableRowSize,
                  fontFamily: 'PoppinsBold',
                  color: '#374151',
                  overflow: 'hidden',
                }} 
                numberOfLines={1} 
                ellipsizeMode="tail"
              >
                You
              </Text>
              <View style={{
                width: '25%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}>
                <Text style={{
                  fontSize: dynamicStyles.tableRowSize,
                  fontFamily: 'PoppinsBold',
                  color: '#3B82F6',
                }}>
                  32.7K
                </Text>
                <Image 
                  source={require("@/src/assets/images/xp.png")} 
                  style={{
                    width: dynamicStyles.xpIconSize,
                    height: dynamicStyles.xpIconSize,
                    marginLeft: 6 * scale,
                    resizeMode: 'contain',
                  }} 
                />
              </View>
              <View style={{
                width: '25%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}>
                <Text style={{
                  fontSize: dynamicStyles.tableRowSize,
                  fontFamily: 'PoppinsBold',
                  color: '#F59E0B',
                }}>
                  37
                </Text>
                <Image 
                  source={require("@/src/assets/images/streak-fire-full.png")} 
                  style={{
                    width: dynamicStyles.streakIconSize,
                    height: dynamicStyles.streakIconSize,
                    marginLeft: 6 * scale,
                    resizeMode: 'contain',
                  }} 
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'PoppinsRegular',
    color: '#4A5568',
  },
})