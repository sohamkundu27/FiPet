import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { View, Image, Dimensions, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getFontSize } from '@/src/hooks/useFont';
import { getFontSize } from '@/src/hooks/useFont';
import { useGamificationStats } from '@/src/hooks/useGamificationStats';
import TabHeader from '@/src/components/TabHeader';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const windowWidth = Dimensions.get('window').width;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function PetHouse() {
  const { level, coins, mood, streak } = useGamificationStats();
  const { level, coins, mood, streak } = useGamificationStats();
  const router = useRouter();
  const [showInventory, setShowInventory] = useState(false);
  const [showPassport, setShowPassport] = useState(false);
  const moodProgress = useRef<AnimatedCircularProgress>(null);
  const levelProgress = useRef<AnimatedCircularProgress>(null);
  const streakProgress = useRef<AnimatedCircularProgress>(null);

  const pathname = usePathname();
  const oldPathName = useRef<string>("");
  const currentPathName = useRef<string>(pathname);

  const [foxSize, setFoxSize] = useState(windowWidth * .85)
  const [textBottomPosition, setTextBottomPosition] = useState(windowHeight * 0.055 + windowWidth * 0.065 + windowWidth * .85 + 10)
  const foxBottomPosition = windowHeight * 0.055 + windowWidth * 0.065;

  const [shelfLayout, setShelfLayout] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [shelfLayout2, setShelfLayout2] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [hasAdjustedSize, setHasAdjustedSize] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shelfLayout2 && shelfLayout && !hasAdjustedSize) {
      const shelfBottom = shelfLayout.y + shelfLayout.height;
      const shelfTop2 = shelfLayout2.y;
      const calculatedOverlap = shelfBottom - shelfTop2;

      if (calculatedOverlap >= 0) {
        setFoxSize(windowWidth * .85 - calculatedOverlap);
        setTextBottomPosition(windowHeight * 0.055 + windowWidth * 0.065 + (windowWidth * .85 - calculatedOverlap) + 20);
        setHasAdjustedSize(true);
      }
    }
  }, [shelfLayout, shelfLayout2]);
  
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
    levelProgress.current?.reAnimate(didRouteChange(pathname) ? 0 : level.previousProgress, Math.round(level.progress), 1000);
  }, [level.progress, level.previousProgress, pathname]);

  useEffect(() => {
    streakProgress.current?.reAnimate(didRouteChange(pathname) ? 0 : streak.previousProgress, streak.progress, 1000);
  }, [streak.progress, streak.previousProgress, pathname]);

  function LevelIcon() {
    return (
      <View style={{
        width: windowHeight * 0.066964,
        height: windowHeight * 0.066964,
        width: windowHeight * 0.066964,
        height: windowHeight * 0.066964,
        borderRadius: 30,
        backgroundColor: '#FFDD3C',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
      }}>
        <View style={{
          width: windowHeight * 0.055804,
          height: windowHeight * 0.055804,
          width: windowHeight * 0.055804,
          height: windowHeight * 0.055804,
          borderRadius: 25,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          <Image
            source={require('@/src/assets/images/trophy.png')}
            style={{ width: windowHeight * 0.033482, height: windowHeight * 0.033482, resizeMode: 'contain' }}
            style={{ width: windowHeight * 0.033482, height: windowHeight * 0.033482, resizeMode: 'contain' }}
          />
        </View>
      </View>
    );
  }

  function StreakIcon() {
    return (
      <View style={{
        width: windowHeight * 0.066964,
        height: windowHeight * 0.066964,
        width: windowHeight * 0.066964,
        height: windowHeight * 0.066964,
        borderRadius: 30,
        backgroundColor: '#E43134',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
      }}>
        <View style={{
          width: windowHeight * 0.055804,
          height: windowHeight * 0.055804,
          width: windowHeight * 0.055804,
          height: windowHeight * 0.055804,
          borderRadius: 25,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          <Image
            source={require('@/src/assets/images/streak-fire-full.png')}
            style={{ width: windowHeight * 0.033482, height: windowHeight * 0.033482, resizeMode: 'contain' }}
            style={{ width: windowHeight * 0.033482, height: windowHeight * 0.033482, resizeMode: 'contain' }}
          />
        </View>
      </View>
    );
  }

  function MoodIcon() {
    return (
      <View style={{
        width: windowHeight * 0.055804,
        height: windowHeight * 0.055804,
        width: windowHeight * 0.055804,
        height: windowHeight * 0.055804,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}>
        <Text style={{ fontSize: getFontSize(20), color: '#333', fontFamily: 'Poppins-Regular' }}>❤️</Text>
        <Text style={{ fontSize: getFontSize(20), color: '#333', fontFamily: 'Poppins-Regular' }}>❤️</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TabHeader
        xp={level.xp}
        coins={coins.coins}
        streak={streak.current}
        title="Pet"
        gradient={{
          startColor: "#168FF9",
          endColor: "#16D3F9",
        }}
      />
      <View style={styles.content}>
        <Image
          source={require('@/src/assets/images/Shelf.png')}
          style={{
            width: windowWidth * 0.7246,
            height: windowWidth * 0.1932,
            width: windowWidth * 0.7246,
            height: windowWidth * 0.1932,
            resizeMode: 'contain',
            position: 'absolute',
            top: windowHeight * 0.06,
            left: 0,
            right: 0,
            alignSelf: 'center',
            zIndex: 2,
          }}
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            setShelfLayout({ x, y, width, height });
            console.log('Shelf Layout Event:', { x, y, width, height });
          }}
        />

        <Image
          source={require('@/src/assets/images/Shelf.png')}
          style={{
            width: windowWidth * 0.7246,
            height: 0,
            //resizeMode: 'contain',
            position: 'absolute',
            bottom: (foxBottomPosition + foxSize + 20) + getFontSize(16) * 3 + 30,
            left: 0,
            right: 0,
            alignSelf: 'center',
            zIndex: 2,
          }}
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            setShelfLayout2({ x, y, width, height });
            console.log('Shelf 2 Layout Event:', { x, y, width, height });
          }}
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            setShelfLayout({ x, y, width, height });
            console.log('Shelf Layout Event:', { x, y, width, height });
          }}
        />

        <Image
          source={require('@/src/assets/images/Shelf.png')}
          style={{
            width: windowWidth * 0.7246,
            height: 0,
            //resizeMode: 'contain',
            position: 'absolute',
            bottom: (foxBottomPosition + foxSize + 20) + getFontSize(16) * 3 + 30,
            left: 0,
            right: 0,
            alignSelf: 'center',
            zIndex: 2,
          }}
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            setShelfLayout2({ x, y, width, height });
            console.log('Shelf 2 Layout Event:', { x, y, width, height });
          }}
        />


        {/* Top right circles - going down */}
        {/* Progress circle 1 - Level */}
        <TouchableOpacity
          onPress={() => { router.push("/petHome/level"); }}
          onPress={() => { router.push("/petHome/level"); }}
          activeOpacity={0.5}
          style={{
            position: 'absolute',
            top: windowHeight * 0.05023,
            right: windowHeight * 0.01677,
            top: windowHeight * 0.05023,
            right: windowHeight * 0.01677,
          }}
        >
          <AnimatedCircularProgress
            ref={levelProgress}
            size={windowHeight * 0.06697}
            width={windowHeight * 0.0066964}
            fill={0}
            backgroundColor="#bec0c0"
            tintColor="#FFDD3C"
            children={() => <LevelIcon />}
          />
        </TouchableOpacity>
        <View style={{
          position: 'absolute',
          top: windowHeight * 0.12297,
          right: windowHeight * 0.01677,
          width: windowHeight * 0.067,
          height: windowHeight * 0.022,
          top: windowHeight * 0.12297,
          right: windowHeight * 0.01677,
          width: windowHeight * 0.067,
          height: windowHeight * 0.022,
          backgroundColor: '#E9E9E9',
          borderRadius: 14,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 4,
        }}>
          <Text style={{
            fontSize: getFontSize(10),
            fontSize: getFontSize(10),
            color: '#333',
            fontFamily: 'Poppins-Regular',
            textAlign: 'center'
            textAlign: 'center'
          }}>Level {level.current}</Text>
        </View>


        {/* Progress circle 2 - Happiness */}
        <AnimatedCircularProgress
          style={{
            position: 'absolute',
            top: windowHeight * 0.1507,
            right: windowHeight * 0.01677,
            top: windowHeight * 0.1507,
            right: windowHeight * 0.01677,
            zIndex: 3,
          }}
          ref={moodProgress}
          size={windowHeight * 0.06697}
          width={windowHeight * 0.0066964}
          fill={0}
          backgroundColor="#bec0c0"
          tintColor="#28B031"
          children={() => <MoodIcon />}
        />
          children={() => <MoodIcon />}
        />
        <View style={{
          position: 'absolute',
          top: windowHeight * 0.2231,
          right: windowHeight * 0.01677,
          width: windowHeight * 0.067,
          height: windowHeight * 0.022,
          top: windowHeight * 0.2231,
          right: windowHeight * 0.01677,
          width: windowHeight * 0.067,
          height: windowHeight * 0.022,
          backgroundColor: '#E9E9E9',
          borderRadius: 14,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 4,
        }}>
          <Text style={{
            fontSize: getFontSize(10),
            fontSize: getFontSize(10),
            color: '#333',
            fontFamily: 'Poppins-Regular',
            textAlign: 'center'
            textAlign: 'center'
          }}>{mood.moodClassification}</Text>
        </View>


        {/* Progress circle 3 - Streak */}
        <AnimatedCircularProgress
          style={{
            position: 'absolute',
            top: windowHeight * 0.2516,
            right: windowHeight * 0.01677,
            top: windowHeight * 0.2516,
            right: windowHeight * 0.01677,
            zIndex: 3,
          }}
          ref={streakProgress}
          size={windowHeight * 0.06697}
          width={windowHeight * 0.0066964}
          fill={0}
          backgroundColor="#bec0c0"
          tintColor="#E43134"
          children={() => <StreakIcon />}
        />
          children={() => <StreakIcon />}
        />
        <View style={{
          position: 'absolute',
          top: windowHeight * 0.3239,
          right: windowHeight * 0.01677,
          width: windowHeight * 0.067,
          height: windowHeight * 0.022,
          top: windowHeight * 0.3239,
          right: windowHeight * 0.01677,
          width: windowHeight * 0.067,
          height: windowHeight * 0.022,
          backgroundColor: '#E9E9E9',
          borderRadius: 14,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 4,
        }}>
          <Text style={{
            fontSize: getFontSize(10),
            fontSize: getFontSize(10),
            color: '#333',
            fontFamily: 'Poppins-Regular',
            textAlign: 'center'
            textAlign: 'center'
          }}>{streak.minutesUsed}/{streak.minutesRequired} min</Text>
        </View>


        {/* Text bubble positioned above fox */}
        <View style={{
          alignItems: 'center',
          position: 'absolute',
          bottom: textBottomPosition,
          right: windowWidth * .5,
          zIndex: 4,
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            width: windowWidth * 0.43478,
            padding: 5,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: getFontSize(16),
              lineHeight: getFontSize(16) * 1.5,
              color: '#333',
              textAlign: 'center',
              fontFamily: 'Poppins-Medium'
            }}>Hi again! I'm ready for the next quest.</Text>


        {/* Text bubble positioned above fox */}
        <View style={{
          alignItems: 'center',
          position: 'absolute',
          bottom: textBottomPosition,
          right: windowWidth * .5,
          zIndex: 4,
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            width: windowWidth * 0.43478,
            padding: 5,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{
              fontSize: getFontSize(16),
              lineHeight: getFontSize(16) * 1.5,
              color: '#333',
              textAlign: 'center',
              fontFamily: 'Poppins-Medium'
            }}>Hi again! I'm ready for the next quest.</Text>
          </View>
        </View>


        {/* Rug image */}
        <Image
          source={require('@/src/assets/images/Rug.png')}
          style={{
            position: 'absolute',
            bottom: windowHeight * 0.055,
            alignSelf: 'center',
            width: windowWidth * 0.8,
            height: windowWidth * 0.25,
            bottom: windowHeight * 0.055,
            alignSelf: 'center',
            width: windowWidth * 0.8,
            height: windowWidth * 0.25,
            resizeMode: 'contain',
            zIndex: 2,
          }}
        />


        {/* Brown floor background below the separator line */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: windowHeight * 0.075 + windowWidth * 0.25,
            backgroundColor: '#E2B486',
            zIndex: 0,
          }}
        />

        {/* Fox image with size restrictions */}


        {/* Brown floor background below the separator line */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: windowHeight * 0.075 + windowWidth * 0.25,
            backgroundColor: '#E2B486',
            zIndex: 0,
          }}
        />

        {/* Fox image with size restrictions */}
        <Image
          source={require('@/src/assets/images/fox_no_shadow.png')}
          style={{
            position: 'absolute',
            bottom: foxBottomPosition,
            alignSelf: 'center',
            width: foxSize,
            height: foxSize,
            marginLeft: windowWidth * 0.108696,
            resizeMode: 'contain',
            zIndex: 3,
          }}
          source={require('@/src/assets/images/fox_no_shadow.png')}
          style={{
            position: 'absolute',
            bottom: foxBottomPosition,
            alignSelf: 'center',
            width: foxSize,
            height: foxSize,
            marginLeft: windowWidth * 0.108696,
            resizeMode: 'contain',
            zIndex: 3,
          }}
        />




        {/* Group image - behind brown floor but in front of background */}
        <Image
          source={require('@/src/assets/images/Group.png')}
          style={{
            position: 'absolute',
            bottom: windowHeight * 0.075 + windowWidth * 0.25,
            width: windowWidth,
            height: windowWidth * .52,
            bottom: windowHeight * 0.075 + windowWidth * 0.25,
            width: windowWidth,
            height: windowWidth * .52,
            resizeMode: 'cover',
            zIndex: 1,
          }}
        />

        {/* Inventory View */}
        {showInventory && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#8CDDD1',
            zIndex: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}>


            {/* Inventory Content */}
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 100,
              paddingBottom: 100,
              flexDirection: 'column',
              gap: 80,
            }}>
              {/* Inventory Shelf 1 */}
              <View style={{ position: 'relative' }}>
                <Image
                  source={require('@/src/assets/images/Inventory_Shelf.png')}
                  style={{
                    width: 350,
                    height: 50,
                    resizeMode: 'contain',
                  }}
                />
                <View style={{
                  position: 'absolute',
                  top: -67,
                  left: 0,
                  right: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 40,
                }}>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                </View>
              </View>


              {/* Inventory Shelf 2 */}
              <View style={{ position: 'relative' }}>
                <Image
                  source={require('@/src/assets/images/Inventory_Shelf.png')}
                  style={{
                    width: 350,
                    height: 50,
                    resizeMode: 'contain',
                  }}
                />
                <View style={{
                  position: 'absolute',
                  top: -67,
                  left: 0,
                  right: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 40,
                }}>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                </View>
              </View>


              {/* Inventory Shelf 3 */}
              <View style={{ position: 'relative' }}>
                <Image
                  source={require('@/src/assets/images/Inventory_Shelf.png')}
                  style={{
                    width: 350,
                    height: 50,
                    resizeMode: 'contain',
                  }}
                />
                <View style={{
                  position: 'absolute',
                  top: -67,
                  left: 0,
                  right: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 40,
                }}>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                </View>
              </View>


              {/* Inventory Shelf 4 */}
              <View style={{ position: 'relative' }}>
                <Image
                  source={require('@/src/assets/images/Inventory_Shelf.png')}
                  style={{
                    width: 350,
                    height: 50,
                    resizeMode: 'contain',
                  }}
                />
                <View style={{
                  position: 'absolute',
                  top: -67,
                  left: 0,
                  right: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 40,
                }}>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                  <Text style={{ fontSize: 64, color: '#333', fontFamily: 'Poppins-Regular' }}>X</Text>
                </View>
              </View>
            </View>

            {/* Close button */}
            <TouchableOpacity
              onPress={() => setShowInventory(false)}
              style={{
                position: 'absolute',
                bottom: 30,
                left: 25,
                width: windowHeight * 0.055804,
                height: windowHeight * 0.055804,
                borderRadius: 100,
                width: windowHeight * 0.055804,
                height: windowHeight * 0.055804,
                borderRadius: 100,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Text style={{ fontSize: getFontSize(24), lineHeight: getFontSize(24) * 1.5, color: '#333', fontFamily: 'Poppins-Regular' }}>×</Text>
              <Text style={{ fontSize: getFontSize(24), lineHeight: getFontSize(24) * 1.5, color: '#333', fontFamily: 'Poppins-Regular' }}>×</Text>
            </TouchableOpacity>

            {/* Bottom right button */}
            <View style={{
              position: 'absolute',
              bottom: 30,
              right: 25,
              width: windowHeight * 0.055804,
              height: windowHeight * 0.055804,
              borderRadius: 100,
              width: windowHeight * 0.055804,
              height: windowHeight * 0.055804,
              borderRadius: 100,
              backgroundColor: '#fff',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 6,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}>
              <Text style={{ fontSize: getFontSize(24), lineHeight: getFontSize(24) * 1.5, color: '#333' }}>+</Text>
              <Text style={{ fontSize: getFontSize(24), lineHeight: getFontSize(24) * 1.5, color: '#333' }}>+</Text>
            </View>
          </View>
        )}


        {/* Inventory button - bottom left */}
        {!showPassport && (
          <>
            <TouchableOpacity
              onPress={() => setShowInventory(!showInventory)}
              activeOpacity={0.7}
              style={{
                position: 'absolute',
                bottom: windowHeight * 0.0335,
                left: windowHeight * 0.0279,
                width: windowHeight * 0.0558,
                height: windowHeight * 0.0558,
                borderRadius: 100,
                bottom: windowHeight * 0.0335,
                left: windowHeight * 0.0279,
                width: windowHeight * 0.0558,
                height: windowHeight * 0.0558,
                borderRadius: 100,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Image
                source={require('@/src/assets/images/arrow_right.png')}
                style={{ width: windowHeight * 0.033482, height: windowHeight * 0.033482, resizeMode: 'contain' }}
              />
              <Image
                source={require('@/src/assets/images/arrow_right.png')}
                style={{ width: windowHeight * 0.033482, height: windowHeight * 0.033482, resizeMode: 'contain' }}
              />
            </TouchableOpacity>
            <View style={{
              position: 'absolute',
              bottom: windowHeight * 0.0056,
              left: windowHeight * 0.0223,
              height: windowHeight * 0.0223,
              paddingHorizontal: 5,
              bottom: windowHeight * 0.0056,
              left: windowHeight * 0.0223,
              height: windowHeight * 0.0223,
              paddingHorizontal: 5,
              backgroundColor: '#E9E9E9',
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 4,
            }}>
              <Text style={{
                fontSize: getFontSize(10),
                lineHeight: getFontSize(10) * 1.5,
                fontSize: getFontSize(10),
                lineHeight: getFontSize(10) * 1.5,
                color: '#333',
                fontFamily: 'Poppins-Regular',
              }}>Inventory</Text>
            </View>


          </>
        )}


        {/* Passport button - bottom right */}
        {!showPassport && (
          <>
            <TouchableOpacity
              onPress={() => setShowPassport(true)}
              activeOpacity={0.7}
              style={{
                position: 'absolute',
                bottom: windowHeight * 0.0335,
                right: windowHeight * 0.0279,
                width: windowHeight * 0.0558,
                height: windowHeight * 0.0558,
                borderRadius: 100,
                bottom: windowHeight * 0.0335,
                right: windowHeight * 0.0279,
                width: windowHeight * 0.0558,
                height: windowHeight * 0.0558,
                borderRadius: 100,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Text style={{ fontSize: getFontSize(24), lineHeight: getFontSize(24) * 1.5, color: '#333' }}>🐾</Text>
              <Text style={{ fontSize: getFontSize(24), lineHeight: getFontSize(24) * 1.5, color: '#333' }}>🐾</Text>
            </TouchableOpacity>
            <View style={{
              position: 'absolute',
              bottom: windowHeight * 0.0056,
              right: windowHeight * 0.0223,
              height: windowHeight * 0.0223,
              paddingHorizontal: 5,
              bottom: windowHeight * 0.0056,
              right: windowHeight * 0.0223,
              height: windowHeight * 0.0223,
              paddingHorizontal: 5,
              backgroundColor: '#E9E9E9',
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 4,
            }}>
              <Text style={{
                fontSize: getFontSize(10),
                lineHeight: getFontSize(10) * 1.5,
                fontSize: getFontSize(10),
                lineHeight: getFontSize(10) * 1.5,
                color: '#333',
                fontFamily: 'Poppins-Regular',
              }}>Passport</Text>
            </View>
          </>
        )}


        {/* Passport Modal */}
        {showPassport && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}>
            <View style={{
              width: '95%',
              height: '80%',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: 20,
              padding: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{
                fontSize: 24,
                color: '#333',
                fontFamily: 'Poppins-Regular',
                marginBottom: 20,
              }}>
                Pet Passport
              </Text>


              {/* Close button */}
              <TouchableOpacity
                onPress={() => setShowPassport(false)}
                style={{
                  position: 'absolute',
                  top: 15,
                  right: 15,
                  width: windowHeight * 0.033482,
                  height: windowHeight * 0.033482,
                  borderRadius: 100,
                  width: windowHeight * 0.033482,
                  height: windowHeight * 0.033482,
                  borderRadius: 100,
                  backgroundColor: '#fff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <Text style={{ fontSize: getFontSize(18), lineHeight: getFontSize(18) * 1.5, color: '#333', fontFamily: 'Poppins-Regular' }}>×</Text>
                <Text style={{ fontSize: getFontSize(18), lineHeight: getFontSize(18) * 1.5, color: '#333', fontFamily: 'Poppins-Regular' }}>×</Text>
              </TouchableOpacity>


              <Text style={{
                fontSize: 16,
                color: '#666',
                fontFamily: 'Poppins-Regular',
                textAlign: 'center',
              }}>
                Passport content will go here...
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    paddingTop: 100,
    backgroundColor: "#8CDDD1",
  },
});