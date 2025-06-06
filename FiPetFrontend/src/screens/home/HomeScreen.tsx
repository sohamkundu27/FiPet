import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Easing, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { ThemedView } from '@/src/components/ThemedView';
import { ThemedText } from '@/src/components/ThemedText';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function HomeScreen() {
  const router = useRouter();
  const petData = {
    eggType: 'type',
    currentXP: 20,
    requiredXP: 100,
    level: 1,
  };

  const xpPercentage = (petData.currentXP / petData.requiredXP) * 100;
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, [scaleAnim]);

  const handleLogout = () => {
    setDropdownVisible(false);
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>

      <View style={styles.topRow}>
        <ThemedText type="subtitle" style={styles.welcomeText}>Welcome, User!</ThemedText>
        <View>
          <TouchableOpacity
            style={styles.inlineSettingsButton}
            onPress={() => setDropdownVisible(!dropdownVisible)}
          >
            <IconSymbol name="gearshape.fill" size={28} color="white" />
          </TouchableOpacity>
          {dropdownVisible && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
                <ThemedText type="link" numberOfLines={1} style={styles.dropdownText}>Log Out</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.petPlaceholder}>
        <ThemedText type="default">Pet Avatar Name</ThemedText>
      </View>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Link href="/quests" style={styles.questButton}>
          <ThemedText type="link">Start Quest</ThemedText>
        </Link>
      </Animated.View>

      <View style={styles.xpContainer}>
        <View style={[styles.xpFill, { width: `${xpPercentage}%` }]} />
        <ThemedText type="defaultSemiBold" style={styles.xpText}>{petData.currentXP} / {petData.requiredXP} XP</ThemedText>
      </View>

      <ThemedText type="subtitle" style={styles.levelText}>Level {petData.level}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 35,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    zIndex: 10,
    minWidth: 100
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  dropdownText: {
    textAlign: 'left',
    fontSize: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  inlineSettingsButton: {
    marginLeft: 10,
  },
  title: {
    marginBottom: 10,
    fontSize: 24,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
  },
  petPlaceholder: {
    width: windowWidth * .9,
    height: windowWidth * .9,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 10,
  },
  xpContainer: {
    width: '90%',
    height: 25,
    backgroundColor: '#ddd',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 20,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  xpFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  xpText: {
    textAlign: 'center',
    fontWeight: 'bold',
    zIndex: 1,
  },
  levelText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  questButton: {
    backgroundColor: '#ff9800',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 20,
    alignSelf: 'center',
  },
});
