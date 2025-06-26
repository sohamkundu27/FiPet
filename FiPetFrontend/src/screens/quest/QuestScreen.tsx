// import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import firebase from '@react-native-firebase/app';
import { collection, getDocs, doc } from '@firebase/firestore';
import { db } from '../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon, Circle, Line, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useAuth } from '@/src/hooks/useRequiresAuth';
import { useGamificationStats } from '@/src/hooks/useGamificationStats';

type Quest = {
    id: string;
    title: string;
    xpReward: number;
    duration?: string;
    level?: number;
    order?: number;
    preQuest?: string;
    topic?: string;
    descriptions?: string[];
    questionIds?: string[];
    [key: string]: any;
};

export default function QuestScreen() {
    const {userProgress, streakProgress} = useGamificationStats();
    const router = useRouter();
    const [quests, setQuests] = useState<Quest[]>([]);
    const {user} = useAuth();

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
                        level: data.level ?? 1,
                        order: data.order ?? 1,
                        preQuest: data.preQuest ?? '',
                        topic: data.topic ?? '',
                        descriptions: data.descriptions ?? [],
                        questionIds: data.questionIds ?? [],
                        ...data,
                    };
                });
                setQuests(questsData);
                console.log('Fetched quests:', questsData);
            } catch (error) {
                console.error('Error fetching quests:', error);
            }
        };
        fetchQuests();
    }, []);

    // Component to show correct answers for a quest
    const CorrectAnswersCounter = ({ questId }: { questId: string }) => {
        const [correctCount, setCorrectCount] = useState(0);
        const [totalQuestions, setTotalQuestions] = useState(0);

        useEffect(() => {
            const getCorrectAnswers = async () => {
                if (!user) return;
                
                try {
                    // Get the quest data to find question IDs
                    const questDoc = await getDocs(collection(db, 'quests'));
                    const questData = questDoc.docs.find(doc => doc.id === questId);
                    
                    if (questData) {
                        const questionIds = questData.data().questionIds || [];
                        setTotalQuestions(questionIds.length);
                        
                        // Get user's progress for this quest
                        const userProgressRef = doc(db, 'users', user.uid, 'questProgress', questId);
                        const progressDoc = await getDocs(collection(userProgressRef, 'answers'));
                        
                        let correct = 0;
                        progressDoc.forEach(doc => {
                            const answerData = doc.data();
                            if (answerData && answerData.outcome && answerData.outcome.isCorrectAnswer) {
                                correct++;
                            }
                        });
                        
                        setCorrectCount(correct);
                    }
                } catch (error) {
                    console.error('Error getting correct answers:', error);
                }
            };

            getCorrectAnswers();
        }, [questId]);

        if (totalQuestions === 0) return null;

        return (
            <View style={styles.correctAnswersBadge}>
                <Text style={styles.correctAnswersText}>{correctCount}/{totalQuestions}</Text>
            </View>
        );
    };

    return (
        <View style={{ flex: 1}}>
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
                            <Text style={styles.statText}>{userProgress.currentXP}</Text>
                        </View>
                        <View style={styles.statPill}>
                            <Text style={styles.statIcon}>🔥</Text>
                            <Text style={styles.statText}>{streakProgress.currentStreak}</Text>
                        </View>
                        <View style={styles.statPill}>
                            <GoldCoinIcon />
                            <Text style={styles.statText}>{userProgress.coins}</Text>
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
                        end={{ x: 1, y: 0 }} 
                        style={styles.questCard}
                    >
                        {/* Correct Answers Counter */}
                        <CorrectAnswersCounter questId={q.id} />
                        
                        <Text style={styles.questCardTitle}>{q.title}</Text>
                        <View style={styles.questCardStatsRow}>
                            <View style={styles.questCardStat}>
                                <GoldCoinIcon />
                                <Text style={styles.questCardStatText}>{q.xpReward}</Text>
                            </View>
                            <View style={styles.questCardStat}>
                                <CustomClockIcon />
                                <Text style={styles.questCardStatText}>{q.duration || '30 min'}</Text>
                            </View>
                        </View>
                        {/* Objectives (descriptions) */}
                        <View style={{ marginTop: 10, marginRight: 18 }}>
                            {q.descriptions && q.descriptions.length > 0 ? (
                                q.descriptions.map((desc: string, i: number) => (
                                    <View style={styles.objectiveRow} key={i}>
                                        <Text style={styles.objectiveEmoji}>{getObjectiveEmoji(i)}</Text>
                                        <Text style={styles.objectiveText}>{desc}</Text>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.objectiveRow}>
                                    <Text style={styles.objectiveEmoji}>📊</Text>
                                    <Text style={styles.objectiveText}>No objectives listed.</Text>
                                </View>
                            )}
                        </View>
                        {/* Play Button */}
                        <TouchableOpacity
                            style={styles.playButton}
                            activeOpacity={0.85}
                            onPress={() => {
                                if (q.preQuest) {
                                    router.push(`/quests/${q.id}/preQuestReading`);
                                } else {
                                    router.push(`/quests/${q.id}`);
                                }
                            }}
                        >
                            <GradientPlayIcon colors={idx % 2 === 0 ? ['#A259FF', '#3B82F6'] : ['#3B82F6', '#38BDF8']} />
                            <Text
                              style={[
                                styles.playButtonText,
                                { color: (idx % 2 === 0 ? '#A259FF' : '#3B82F6') }
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

const GradientPlayIcon = ({ colors }: { colors: readonly [string, string, ...string[]] }) => (
    <Svg width={32} height={32} viewBox="0 0 32 32">
        <Defs>
            <SvgLinearGradient id="play-gradient" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={colors[0]} />
                <Stop offset="100%" stopColor={colors[1]} />
            </SvgLinearGradient>
        </Defs>
        <Polygon points="8,6 26,16 8,26" fill="url(#play-gradient)" />
    </Svg>
);

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
        height: 106,          
        paddingHorizontal: 24,
        paddingTop: 0,         
        paddingBottom: 12,     
        marginBottom: 28,
        justifyContent: 'flex-end', 
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
        fontSize: 24,            
        fontWeight: 'bold',        
        color: '#fff',
        letterSpacing: 0.5,
        flexShrink: 1,
        minWidth: 90,            
        fontFamily: 'Poppins', 
    },
    headerStatsRow: {
        flexDirection: 'row',
        gap: 8,                  
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F3F3',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginRight: 6,
        marginBottom: 4,
    },
    xpText: {
        fontWeight: '900',
        fontSize: 16,            
        color: '#3B82F6',
        marginRight: 4,         
        letterSpacing: 0.5,      
        fontFamily: 'Poppins', 
    },
    statIcon: {
        fontSize: 14,            
        marginRight: 4,          
        fontFamily: 'Poppins', 
    },
    statText: {
        fontWeight: '400',
        fontSize: 14,            
        color: '#444',
        fontFamily: 'Poppins', 
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
        fontFamily: 'Poppins', 
    },
    questCardStatsRow: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 8,

    },
    questCardStat: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 5,
        paddingVertical: 5,
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
        fontSize: 15,
        marginLeft: 6,
        fontFamily: 'Poppins', 
    },
    objectiveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    objectiveEmoji: {
        fontSize: 18,
        marginRight: 8,
        fontFamily: 'Poppins', 
    },
    objectiveText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 2,
        fontFamily: 'Poppins', 
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 32,
        paddingHorizontal: 18,
        paddingVertical: 4,
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
        fontFamily: 'Poppins', 
    },
    correctAnswersBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    correctAnswersText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'Poppins',
    },
});
