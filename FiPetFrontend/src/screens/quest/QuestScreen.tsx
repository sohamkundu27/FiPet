// import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, doc } from '@firebase/firestore';
import { db } from '../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon, Circle, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useAuth } from '@/src/hooks/useRequiresAuth';
import TabHeader from '@/src/components/TabHeader';
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
          <TabHeader
            xp={userProgress.currentXP}
            coins={userProgress.coins}
            streak={streakProgress.currentStreak}
            title="Quests"
            gradient={{
              startColor: "#A259FF",
              endColor: "#3B82F6",
            }}
          />
            <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 25 }}>
                {/* Test Button */}
                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => router.push('/testPreQuestImageLoading')}
                >
                    <Text style={styles.testButtonText}>🧪 Test PreQuest Images</Text>
                </TouchableOpacity>

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
  <Image style={{width: 20, height: 20, resizeMode: "contain"}} source={require("@/src/assets/images/coin.png")}/>
);

const styles = StyleSheet.create({
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
        lineHeight: 25*1.5,
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
        lineHeight: 15*1.5,
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
        lineHeight: 18*1.5,
        marginRight: 8,
        fontFamily: 'Poppins', 
    },
    objectiveText: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 15*1.5,
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
        lineHeight: 20*1.5,
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
        lineHeight: 12*1.5,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'Poppins',
    },
    testButton: {
        backgroundColor: '#FF6B6B',
        borderRadius: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignSelf: 'center',
        marginBottom: 20,
        ...(Platform.OS === 'web'
            ? { boxShadow: '0 4px 16px rgba(255, 107, 107, 0.2)' }
            : {
                shadowColor: '#FF6B6B',
                shadowOpacity: 0.2,
            }),
    },
    testButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Poppins',
    },
});
