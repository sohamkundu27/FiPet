import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Platform, Dimensions, FlatList, ViewToken, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

const viewabilityConfig = {
  itemVisiblePercentThreshold: 50
};

export default function WelcomeScreen() {
  const [username, setUsername] = useState('');
  const [currentEggIndex, setCurrentEggIndex] = useState(0);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index !== undefined && viewableItems[0].index !== null) {
      setCurrentEggIndex(viewableItems[0].index);
    }
  }).current;

  const [loaded] = useFonts({
    SpaceMono: require('@/src/assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const eggs = [
    { id: 1, name: 'Classic Egg', color: '#FFB6C1', gradient: ['#FFE5E5', '#FFB6C1'] },
    { id: 2, name: 'Crystal Egg', color: '#87CEEB', gradient: ['#E5F2FF', '#87CEEB'] },
    { id: 3, name: 'Galaxy Egg', color: '#DDA0DD', gradient: ['#F5E6F5', '#DDA0DD'] },
  ];

  const renderEgg = ({ item, index }: { item: typeof eggs[0], index: number }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [-width * 0.3, 0, width * 0.3],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View style={{ width }}>
        <Animated.View
          style={[
            styles.eggWrapper,
            {
              transform: [
                { scale },
                { translateX }
              ],
              opacity,
            }
          ]}
        >
          <View
            style={[
              styles.eggContainer,
              {
                backgroundColor: '#FFFFFF',
                borderColor: item.color,
              }
            ]}
          >
            <View style={[
              styles.eggInner,
              {
                backgroundColor: item.gradient[0],
                borderColor: item.color,
              }
            ]}>
              <Text style={styles.eggEmoji}>🥚</Text>
              <Text style={[
                styles.eggName,
                { color: item.color }
              ]}>
                {item.name}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  const handleSubmit = () => {
    if (username.length >= 3 && username.length <= 20) {
      router.replace('/home');
    }
  };

  const currentEgg = eggs[currentEggIndex];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>✨ Welcome to FiPet! ✨</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Choose your username!</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your name (3-20 characters)"
              maxLength={20}
              placeholderTextColor="#A0AEC0"
            />
            {username.length > 0 && username.length < 3 && (
              <Text style={styles.errorText}>
                Oops! Name must be at least 3 characters
              </Text>
            )}
          </View>

          <View style={styles.eggSection}>
            <Text style={styles.eggTitle}>Choose Your First Pet Egg! 🥚</Text>
            <View style={styles.carouselContainer}>
              <Animated.FlatList
                ref={flatListRef}
                data={eggs}
                renderItem={renderEgg}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                getItemLayout={(data, index) => ({
                  length: width,
                  offset: width * index,
                  index,
                })}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: true }
                )}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                contentContainerStyle={styles.flatListContent}
                snapToInterval={width}
                decelerationRate={0.8}
              />
              <View style={styles.paginationDots}>
                {eggs.map((_, index) => {
                  const inputRange = [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                  ];

                  const dotOpacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                  });

                  const dotScale = scrollX.interpolate({
                    inputRange,
                    outputRange: [1, 1.3, 1],
                    extrapolate: 'clamp',
                  });

                  return (
                    <Animated.View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          opacity: dotOpacity,
                          transform: [{ scale: dotScale }],
                          backgroundColor: eggs[index].color,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!username || username.length < 3) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!username || username.length < 3}
            >
              <Text style={styles.submitButtonText}>
                Start Your Adventure! 🚀
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const eggSize = Math.min(width * 0.6, 250);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40, // Increased bottom padding
  },
  content: {
    padding: 20,
    flex: 1,
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'SpaceMono',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#4A5568',
    marginTop: 20,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#4A5568',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 55,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  eggSection: {
    marginBottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  eggTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 30,
    textAlign: 'center',
  },
  carouselContainer: {
    height: eggSize + 80,
    width: width,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatListContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eggWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    width: width,
  },
  eggContainer: {
    width: eggSize,
    height: eggSize,
    borderRadius: eggSize,
    borderWidth: 3,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  eggInner: {
    width: '100%',
    height: '100%',
    borderRadius: eggSize,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  eggEmoji: {
    fontSize: eggSize * 0.35,
    marginBottom: 15,
  },
  eggName: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    paddingVertical: 20,
    marginTop: 'auto',
    marginBottom: 20, // Added bottom margin
  },
  submitButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#4C1D95',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
}); 