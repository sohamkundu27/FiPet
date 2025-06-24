// import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import firebase from '@react-native-firebase/app';
import { collection, getDocs } from '@firebase/firestore';
import { db } from '../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon, Circle, Line, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

type Quest = {
    id: string;
    title: string;
    xpReward: number;
    duration?: string;
    objectives?: string[];
    [key: string]: any;
};

export default function QuestScreen() {
    const router = useRouter();
    const [quests, setQuests] = useState<Quest[]>([]);

    useEffect(() => {
        const fetchQuests = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'quests'));
                const questsData = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title ?? 'Untitled Quest',
                        xpReward: data.xpReward ?? 0,
                        duration: data.duration ?? '30 min',
                        description: data.description ?? 'No description available.',
                        ...data,
                    };
                });
                setQuests(questsData);
            } catch (error) {
                console.error('Error fetching quests:', error);
            }
        };
        fetchQuests();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: '#F9F7E0' }}>
            {/* Gradient Header */}
            <LinearGradient
                colors={['#A259FF', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Quests</Text>
                    <View style={styles.headerStatsRow}>
                        <View style={styles.statPill}>
                            <Text style={styles.xpText}>XP</Text>
                            <Text style={styles.statText}>32700</Text>
                        </View>
                        <View style={styles.statPill}>
                            <Text style={styles.statIcon}>🔥</Text>
                            <Text style={styles.statText}>3</Text>
                        </View>
                        <View style={styles.statPill}>
                            <GoldCoinIcon />
                            <Text style={styles.statText}>1400</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 0 }}>
                {quests.map((q, idx) => (
                    <LinearGradient
                        key={q.id}
                        colors={idx % 2 === 0 ? ['#A259FF', '#3B82F6'] : ['#3B82F6', '#38BDF8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }} // <-- horizontal
                        style={styles.questCard}
                    >
                        <Text style={styles.questCardTitle}>{q.title}</Text>
                        <View style={styles.questCardStatsRow}>
                            <View style={styles.questCardStat}>
                                <FontAwesome5 name="coins" size={18} color="#FFD700" />
                                <Text style={styles.questCardStatText}>{q.xpReward}</Text>
                            </View>
                            <View style={styles.questCardStat}>
                                {/* Custom Clock Icon */}
                                <CustomClockIcon />
                                <Text style={styles.questCardStatText}>{q.duration || '30 min'}</Text>
                            </View>
                        </View>
                        {/* Description as Objective */}
                        <View style={{ marginTop: 10 }}>
                            <View style={styles.objectiveRow}>
                                <Text style={styles.objectiveEmoji}>📊</Text>
                                <Text style={styles.objectiveText}>{q.description}</Text>
                            </View>
                        </View>
                        {/* Play Button */}
                        <TouchableOpacity
                            style={styles.playButton}
                            activeOpacity={0.85}
                            onPress={() => router.push(`/quests/${q.id}`)}
                        >
                            <GradientPlayIcon colors={idx % 2 === 0 ? ['#A259FF', '#3B82F6'] : ['#3B82F6', '#38BDF8']} />
                            <Text
                              style={[
                                styles.playButtonText,
                                { color: (idx % 2 === 0 ? '#3B82F6' : '#38BDF8') }
                              ]}
                            >
                              Play
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                ))}
            </ScrollView>
        </View>
    );
}

function getObjectiveEmoji(idx: number) {
    const emojis = ['📊', '💰', '⏰', '🎯', '📈'];
    return emojis[idx % emojis.length];
}

const GradientPlayIcon = ({ colors }: { colors: readonly [string, string, ...string[]] }) => {
    return (
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }} // <-- horizontal
            style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Svg width={20} height={20} viewBox="0 0 20 20">
                <Polygon points="4,3 17,10 4,17" fill="#fff" />
            </Svg>
        </LinearGradient>
    );
};

const CustomClockIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 22 22">
    <Circle cx="11" cy="11" r="10" stroke="#3B82F6" strokeWidth="2.5" fill="#fff" />
    <Line x1="11" y1="11" x2="11" y2="6.2" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" />
    <Line x1="11" y1="11" x2="15.2" y2="13.5" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

const GoldCoinIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Circle cx="10" cy="10" r="10" fill="#FFD600"/>
    <Circle cx="10" cy="10" r="8" fill="#FFEB3B"/>
    <SvgText
      x="10"
      y="14"
      fontSize="11"
      fontWeight="bold"
      fill="#FBC02D"
      textAnchor="middle"
      fontFamily="Arial"
    >
      $
    </SvgText>
  </Svg>
);

const XPIcon = () => (
  <Svg width={28} height={16} viewBox="0 0 28 16">
    <Defs>
      <SvgLinearGradient id="xp-gradient" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#4FC3F7" />
        <Stop offset="100%" stopColor="#1976D2" />
      </SvgLinearGradient>
    </Defs>
    <SvgText
      x="0"
      y="13"
      fontSize="16"
      fontWeight="bold"
      fontFamily="Arial"
      fill="url(#xp-gradient)"
    >
      XP
    </SvgText>
  </Svg>
);

const styles = StyleSheet.create({
    headerGradient: {
        width: '100%',
        height: 106,           // Fixed height as per Figma
        paddingHorizontal: 24, // Left = 24px
        paddingTop: 0,         // Remove top padding
        paddingBottom: 12,     // Content sits near the bottom
        marginBottom: 28,
        justifyContent: 'flex-end', // Ensure content is at the bottom
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        width: '100%',
        flexWrap: 'nowrap',
        minHeight: 36,
    },
    headerTitle: {
        fontSize: 24,            // slightly smaller if needed
        fontWeight: 'bold',        // reduced from 12
        color: '#fff',
        letterSpacing: 0.5,
        flexShrink: 1,
        minWidth: 90,            // ensures some space before stat pills
    },
    headerStatsRow: {
        flexDirection: 'row',
        gap: 8,                  // reduced gap
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F3F3',
        borderRadius: 999,
        paddingHorizontal: 10,   // reduced from 18
        paddingVertical: 3,      // reduced from 6
        marginRight: 6,          // reduced from 10
        marginBottom: 4,         // reduced from 6
    },
    xpText: {
        fontWeight: '900',
        fontSize: 16,            // reduced from 22
        color: '#3B82F6',
        marginRight: 4,          // reduced from 6
        letterSpacing: 0.5,      // reduced from 1
    },
    statIcon: {
        fontSize: 14,            // reduced from 18
        marginRight: 4,          // reduced from 6
    },
    statText: {
        fontWeight: 'bold',
        fontSize: 14,            // reduced from 16
        color: '#444',
    },
    questCard: {
        borderRadius: 22,
        padding: 22,
        marginBottom: 24,
        ...(Platform.OS === 'web'
            ? { boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }
            : {
                    shadowColor: '#000',
                    shadowOpacity: 0.12,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 3,
              }),
    },
    questCardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    questCardStatsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    questCardStat: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginRight: 10,
        ...(Platform.OS === 'web'
            ? { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
            : {
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
              }),
    },
    questCardStatText: {
        color: '#444',
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 6,
    },
    objectiveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    objectiveEmoji: {
        fontSize: 18,
        marginRight: 8,
    },
    objectiveText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 2,
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 32,
        paddingHorizontal: 24,
        paddingVertical: 10,
        alignSelf: 'flex-start',
        marginTop: 24,
        ...(Platform.OS === 'web'
            ? { boxShadow: '0 4px 16px rgba(124,58,237,0.10)' }
            : {
                shadowColor: '#7C3AED',
                shadowOpacity: 0.1,
            }),
    },
    playButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 12,
    },
});
