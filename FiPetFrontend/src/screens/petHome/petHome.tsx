import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { View, Image, Dimensions, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useGamificationStats } from '@/src/hooks/useGamificationStats';
import TabHeader from '@/src/components/TabHeader';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const windowHeight = Dimensions.get('window').height;

export default function PetHouse() {
  const {level, coins, mood, streak} = useGamificationStats();
  const router = useRouter();
  const [showInventory, setShowInventory] = useState(false);
  const [showPassport, setShowPassport] = useState(false);
  const moodProgress = useRef<AnimatedCircularProgress>(null);
  const levelProgress = useRef<AnimatedCircularProgress>(null);
  const streakProgress = useRef<AnimatedCircularProgress>(null);

  const pathname = usePathname();
  const oldPathName = useRef<string>("");
  const currentPathName = useRef<string>(pathname);

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
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFDD3C',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
      }}>
        <View style={{
          width: 50,
          height: 50,
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
            style={{ width: 30, height: 30, resizeMode: 'contain' }}
          />
        </View>
      </View>
    );
  }

  function StreakIcon() {
    return (
      <View style={{
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E43134',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 3,
      }}>
        <View style={{
          width: 50,
          height: 50,
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
            style={{ width: 30, height: 30, resizeMode: 'contain' }}
          />
        </View>
      </View>
    );
  }

  function MoodIcon() {
    return (
      <View style={{
        width: 50,
        height: 50,
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
        <Text style={{ fontSize: 20, color: '#333', fontFamily: 'Poppins-Regular' }}>❤️</Text>
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
            width: 300,
            height: 80,
            resizeMode: 'contain',
            position: 'absolute',
            top: windowHeight * 0.06,
            left: 0,
            right: 0,
            alignSelf: 'center',
            zIndex: 2,
          }}
        />
        
        {/* Top right circles - going down */}
        {/* Progress circle 1 - Level */}
        <TouchableOpacity
          onPress={() => {router.push("/petHome/level");}}
          activeOpacity={0.5}
          style={{
            position: 'absolute',
            top: 45,
            right: 15,
          }}
        >
        <AnimatedCircularProgress
          ref={levelProgress}
          size={60}
          width={6}
          fill={0}
          backgroundColor="#bec0c0"
          tintColor="#FFDD3C"
          children={()=><LevelIcon/>}
          />
        </TouchableOpacity>
        <View style={{
          position: 'absolute',
          top: 110,
          right: 15,
          width: 60,
          height: 20,
          backgroundColor: '#E9E9E9',
          borderRadius: 14,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 4,
        }}>
          <Text style={{
            fontSize: 10,
            color: '#333',
            fontFamily: 'Poppins-Regular',
          }}>Level {level.current}</Text>
        </View>
        
        {/* Progress circle 2 - Happiness */}
        <AnimatedCircularProgress
          style={{
            position: 'absolute',
            top: 135,
            right: 15,
            zIndex: 3,
          }}
          ref={moodProgress}
          size={60}
          width={6}
          fill={0}
          backgroundColor="#bec0c0"
          tintColor="#28B031"
          children={()=><MoodIcon/>}
          />
        <View style={{
          position: 'absolute',
          top: 200,
          right: 15,
          width: 60,
          height: 20,
          backgroundColor: '#E9E9E9',
          borderRadius: 14,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 4,
        }}>
          <Text style={{
            fontSize: 10,
            color: '#333',
            fontFamily: 'Poppins-Regular',
          }}>{mood.moodClassification}</Text>
        </View>
        
        {/* Progress circle 3 - Streak */}
        <AnimatedCircularProgress
          style={{
            position: 'absolute',
            top: 225,
            right: 15,
            zIndex: 3,
          }}
          ref={streakProgress}
          size={60}
          width={6}
          fill={0}
          backgroundColor="#bec0c0"
          tintColor="#E43134"
          children={()=><StreakIcon/>}
          />
        <View style={{
          position: 'absolute',
          top: 290,
          right: 15,
          width: 60,
          height: 20,
          backgroundColor: '#E9E9E9',
          borderRadius: 14,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 4,
        }}>
          <Text style={{
            fontSize: 10,
            color: '#333',
            fontFamily: 'Poppins-Regular',
          }}>{streak.minutesUsed}/{streak.minutesRequired} min</Text>
        </View>
        <View style={{ alignItems: 'center', marginBottom: 10, position: 'absolute', top: windowHeight * 0.19, left: 30 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, width: 180, height: 60, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#333', textAlign: 'center', fontFamily: 'Poppins-Medium' }}>Hi again! I'm ready for the next quest.</Text>
          </View>
        </View>
        {/* Rug image */}
        <Image
          source={require('@/src/assets/images/Rug.png')}
          style={{
            position: 'absolute',
            bottom: 70,
            left: 25,
            width: 320,
            height: 90,
            resizeMode: 'contain',
            zIndex: 2,
          }}
        />
        
        <Image
          source={require('@/src/assets/images/fox.png')}
          style={{ width: 325, height: 325, resizeMode: 'contain', zIndex: 3, marginTop: 124, marginLeft: 45}}
        />
        
        {/* Group image - behind brown floor but in front of background */}
        <Image
          source={require('@/src/assets/images/Group.png')}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 180,
            height: 200,
            resizeMode: 'cover',
            zIndex: 1,
          }}
        />
        
        {/* Brown floor background below the separator line */}
        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: undefined,
          bottom: 0,
          height: 180,
          backgroundColor: '#E2B486',
          zIndex: 0,
        }} />

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
                width: 50,
                height: 50,
                borderRadius: 30,
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
              <Text style={{ fontSize: 24, color: '#333', fontFamily: 'Poppins-Regular' }}>×</Text>
            </TouchableOpacity>

            {/* Bottom right button */}
            <View style={{
              position: 'absolute',
              bottom: 30,
              right: 25,
              width: 50,
              height: 50,
              borderRadius: 30,
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
              <Text style={{ fontSize: 24, color: '#333' }}>+</Text>
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
                bottom: 30,
                left: 25,
                width: 50,
                height: 50,
                borderRadius: 30,
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
              <Text style={{ fontSize: 24, color: '#333', fontFamily: 'Poppins-Regular' }}>→</Text>
            </TouchableOpacity>
            <View style={{
              position: 'absolute',
              bottom: 5,
              left: 20,
              width: 60,
              height: 20,
              backgroundColor: '#E9E9E9',
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 4,
            }}>
              <Text style={{
                fontSize: 10,
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
                bottom: 30,
                right: 25,
                width: 50,
                height: 50,
                borderRadius: 30,
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
              <Text style={{ fontSize: 24, color: '#333' }}>🐾</Text>
            </TouchableOpacity>
            <View style={{
              position: 'absolute',
              bottom: 5,
              right: 20,
              width: 60,
              height: 20,
              backgroundColor: '#E9E9E9',
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 4,
            }}>
              <Text style={{
                fontSize: 10,
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
                  width: 30,
                  height: 30,
                  borderRadius: 15,
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
                <Text style={{ fontSize: 18, color: '#333', fontFamily: 'Poppins-Regular' }}>×</Text>
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
