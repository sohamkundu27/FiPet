import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Easing, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ThemedText } from '@/src/components/ThemedText';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

const windowWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [xp, setXp] = useState(650);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Get out of bed', energy: 5, completed: false },
    { id: 2, title: 'Brush teeth', energy: 5, completed: false },
    { id: 3, title: 'Drink water', energy: 5, completed: false },
  ]);

  const petData = {
    level: 3,
    currentXP: xp,
    requiredXP: 1000,
    stats: {
      coins: 1250,
      trophies: 12,
      streak: 7,
    },
  };

  const xpPercentage = (petData.currentXP / petData.requiredXP) * 100;

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
  }, []);

  const handleLogout = () => {
    setDropdownVisible(false);
    router.replace('/login');
  };

  const toggleTask = (id: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id && !task.completed) {
          setXp((prevXp) => prevXp + task.energy);
          return { ...task, completed: true };
        }
        return task;
      })
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.logoRow}>
          <Image source={require('@/src/assets/images/react-logo.png')} style={styles.logo} />
          <ThemedText style={styles.brandText}>FiPet</ThemedText>
        </View>
        <TouchableOpacity
          style={styles.inlineSettingsButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <IconSymbol name="gearshape.fill" size={28} color="black" />
        </TouchableOpacity>
        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
              <ThemedText type="link" numberOfLines={1} style={styles.dropdownText}>Log Out</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* <ThemedText style={styles.welcome}>Welcome, Alex!</ThemedText>
      <ThemedText style={styles.subtext}>Ready for today's adventure?</ThemedText> */}

      <View style={styles.petImage} />

      <View style={styles.levelRow}>
        <ThemedText style={styles.levelText}>Level {petData.level}</ThemedText>
        <ThemedText style={styles.xpLabel}>{petData.currentXP} / {petData.requiredXP} XP</ThemedText>
      </View>
      <View style={styles.xpBarBg}>
        <View style={[styles.xpBarFill, { width: `${xpPercentage}%` }]} />
      </View>

      {/* <Animated.View style={[styles.questButton, { transform: [{ scale: scaleAnim }] }]}>
        <Link href="/quest">
          <ThemedText style={styles.questButtonText}>Start Quest →</ThemedText>
        </Link>
      </Animated.View> */}

      <ThemedText style={styles.todayTitle}>Today's Quests</ThemedText>

      {tasks.map((task) => (
        <TouchableOpacity
          key={task.id}
          style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
          onPress={() => toggleTask(task.id)}
        >
          <View style={styles.taskContent}>
            <IconSymbol name="checkmark.seal" size={24} color={task.completed ? 'green' : 'gray'} />
            <ThemedText style={styles.taskText}>{task.title}</ThemedText>
          </View>
          <View style={styles.taskRight}>
            <ThemedText style={styles.energyText}>⚡ {task.energy}</ThemedText>
            {task.completed && (
              <IconSymbol name="checkmark.circle.fill" size={24} color="green" />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffe9ab',
    paddingHorizontal: 20,
    paddingTop: 40,
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
    minWidth: 100,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  inlineSettingsButton: {
    marginLeft: 10,
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 5,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
    color: 'black',
  },
  subtext: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  petImage: {
    width: windowWidth * 0.8,
    height: windowWidth * 0.8,
    alignSelf: 'center',
    backgroundColor: 'orange',
    borderRadius: 10,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 30,
  },
  levelText: {
    fontWeight: '600',
    fontSize: 14,
    color: 'black',
  },
  xpLabel: {
    fontWeight: '500',
    fontSize: 14,
    color: '#555',
  },
  xpBarBg: {
    height: 15,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 16,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#FF7A00',
  },
  questButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 25,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 30,
  },
  questButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff3d1',
    borderRadius: 12,
    marginBottom: 10,
  },
  taskCardCompleted: {
    backgroundColor: '#d1ffd6',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
    color: 'black',
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  energyText: {
    fontSize: 14,
    color: 'black',
  },
});
