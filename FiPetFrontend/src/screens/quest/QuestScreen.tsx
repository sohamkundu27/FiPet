import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon, Circle, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useAuth } from '@/src/hooks/useRequiresAuth';
import TabHeader from '@/src/components/TabHeader';
import { useGamificationStats } from '@/src/hooks/useGamificationStats';
import { getCurrentQuest, getNextAvailableQuest, QuestWithProgress } from '@/src/services/questsIndexService';

export default function QuestScreen() {

    const {level, coins, streak} = useGamificationStats();
    const router = useRouter();
    const [currentQuest, setCurrentQuest] = useState<QuestWithProgress | null>(null);
    const [nextQuest, setNextQuest] = useState<QuestWithProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);
    const {user} = useAuth();



        const fetchQuests = async (forceRefresh = false) => {
        if (!user) return;
        
        // Check if we should skip fetching (cache for 30 seconds)
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTime;
        const shouldSkipFetch = !forceRefresh && timeSinceLastFetch < 30000 && (currentQuest || nextQuest);
        
        if (shouldSkipFetch) {
            setLoading(false); // Ensure loading is false when using cache
            return;
        }
        
        try {
            setLoading(true);
            const current = await getCurrentQuest(user.uid);
            const next = await getNextAvailableQuest(user.uid);
            
            setCurrentQuest(current);
            setNextQuest(next);
            setLastFetchTime(now);
        } catch (error) {
            console.error('Error fetching quests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchQuests(true); // Force refresh on initial load
        } else {
            setLoading(false);
        }
    }, [user]);

    // Only refresh on focus if we don't have any quest data yet
    useFocusEffect(
        React.useCallback(() => {
            if (!currentQuest && !nextQuest) {
                fetchQuests(false);
            }
        }, [user, currentQuest, nextQuest])
    );

    // Component to show correct answers for a quest
    const CorrectAnswersCounter = ({ quest }: { quest: QuestWithProgress }) => {
        if (quest.totalQuestions === 0) return null;

        return (
            <View style={styles.correctAnswersBadge}>
                <Text style={styles.correctAnswersText}>{quest.correctAnswers}/{quest.totalQuestions}</Text>
            </View>
        );
    };


    return (
        <View style={{ flex: 1}}>
          <TabHeader
            xp={level.xp}
            coins={coins.coins}
            streak={streak.current}
            title="Quests"
            gradient={{
              startColor: "#A259FF",
              endColor: "#3B82F6",
            }}
          />
            <ScrollView 
                contentContainerStyle={{ padding: 20, paddingTop: 20 }}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={() => fetchQuests(true)}
                        colors={['#A259FF', '#3B82F6']}
                        tintColor="#A259FF"
                    />
                }
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading quest...</Text>
                    </View>
                ) : !currentQuest && !nextQuest ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No quests available</Text>
                    </View>
                ) : (
                    <>
                        {/* Current Quest (if in progress) */}
                        {currentQuest && (
                    <LinearGradient
                                colors={['#A259FF', '#3B82F6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }} 
                        style={styles.questCard}
                    >

                                
                        {/* Correct Answers Counter */}
                                <CorrectAnswersCounter quest={currentQuest} />
                                
                                <Text style={styles.questCardTitle}>{currentQuest.quest.title}</Text>
                                
                        
                        
                        {/* Objectives (descriptions) */}
                        <View style={styles.objectivesContainer}>
                                    {currentQuest.quest.descriptions && currentQuest.quest.descriptions.length > 0 ? (
                                        currentQuest.quest.descriptions.map((desc: string, i: number) => (
                                    <View style={styles.objectiveRow} key={i}>
                                        <Text style={styles.objectiveEmoji}>{getObjectiveEmoji(i)}</Text>
                                        <Text style={styles.objectiveText}>{desc}</Text>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.objectiveRow}>
                                    <Text style={styles.objectiveEmoji}>📊</Text>
                                            <Text style={styles.objectiveText}>{currentQuest.quest.description}</Text>
                                </View>
                            )}
                        </View>

                        {/* Bottom Row - Stats and Play Button */}
                        <View style={styles.bottomRow}>
                            <View style={styles.questCardStatsRow}>
                                <View style={styles.questCardStat}>
                                    <GoldCoinIcon />
                                            <Text style={styles.questCardStatText}>{currentQuest.quest.coinReward || 0}</Text>
                                </View>
                                <View style={styles.questCardStat}>
                                    <CustomClockIcon />
                                            <Text style={styles.questCardStatText}>{currentQuest.quest.duration || '30 min'}</Text>
                                </View>
                            </View>
                            
                            <TouchableOpacity
                                style={styles.playButton}
                                activeOpacity={0.85}
                                onPress={() => {
                                            if (currentQuest.quest.preQuest) {
                                                router.push(`/quests/${currentQuest.quest.id}/preQuestReading`);
                                    } else {
                                                router.push(`/quests/${currentQuest.quest.id}`);
                                    }
                                }}
                            >
                                <GradientPlayIcon colors={['#A259FF', '#3B82F6']} />
                                <Text
                                  style={[
                                    styles.playButtonText,
                                    { color: '#A259FF' }
                                  ]}
                                >
                                          Continue
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        )}

                        {/* Next Available Quest */}
                        {nextQuest && !currentQuest && (
                            <LinearGradient
                                colors={['#3B82F6', '#38BDF8']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }} 
                                style={styles.questCard}
                            >

                                
                                <Text style={styles.questCardTitle}>{nextQuest.quest.title}</Text>
                                

                                
                                {/* Objectives (descriptions) */}
                                <View style={styles.objectivesContainer}>
                                    {nextQuest.quest.descriptions && nextQuest.quest.descriptions.length > 0 ? (
                                        nextQuest.quest.descriptions.map((desc: string, i: number) => (
                                            <View style={styles.objectiveRow} key={i}>
                                                <Text style={styles.objectiveEmoji}>{getObjectiveEmoji(i)}</Text>
                                                <Text style={styles.objectiveText}>{desc}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <View style={styles.objectiveRow}>
                                            <Text style={styles.objectiveEmoji}>📊</Text>
                                            <Text style={styles.objectiveText}>{nextQuest.quest.description}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Bottom Row - Stats and Play Button */}
                                <View style={styles.bottomRow}>
                                    <View style={styles.questCardStatsRow}>
                                        <View style={styles.questCardStat}>
                                            <GoldCoinIcon />
                                            <Text style={styles.questCardStatText}>{nextQuest.quest.coinReward || 0}</Text>
                                        </View>
                                        <View style={styles.questCardStat}>
                                            <CustomClockIcon />
                                            <Text style={styles.questCardStatText}>{nextQuest.quest.duration || '30 min'}</Text>
                                        </View>
                                    </View>
                                    
                                    <TouchableOpacity
                                        style={styles.playButton}
                                        activeOpacity={0.85}
                                        onPress={() => {
                                            
                                            if (nextQuest.quest.preQuest) {
                                                router.push(`/quests/${nextQuest.quest.id}/preQuestReading`);
                                            } else {
                                                router.push(`/quests/${nextQuest.quest.id}`);
                                            }
                                        }}
                                    >
                                        <GradientPlayIcon colors={['#3B82F6', '#38BDF8']} />
                                        <Text
                                          style={[
                                            styles.playButtonText,
                                            { color: '#3B82F6' }
                                          ]}
                                        >
                                          Start
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

function getObjectiveEmoji(idx: number) {
    const emojis = ['📊', '💰', '⏰'];
    return emojis[idx % emojis.length];
}



const GradientPlayIcon = ({ colors }: { colors: readonly [string, string, ...string[]] }) => (
    <Svg width={24} height={24} viewBox="0 0 30 30">
        <Defs>
            <SvgLinearGradient id="play-gradient" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={colors[0]} />
                <Stop offset="100%" stopColor={colors[1]} />
            </SvgLinearGradient>
        </Defs>
        <Polygon points="6,1 24,12 6,24" fill="url(#play-gradient)" />
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
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        marginHorizontal: 2,
        ...(Platform.OS === 'web'
            ? { boxShadow: '0 8px 32px rgba(162, 89, 255, 0.15)' }
            : {
                    shadowColor: '#A259FF',
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 8,
              }),
    },
    questCardTitle: {
        fontSize: 26,
        lineHeight: 28*1.2,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 20,
        letterSpacing: -0.5,
        fontFamily: 'Poppins', 
    },
    objectivesContainer: {
        flex: 1,
        marginBottom: 20,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    questCardStatsRow: {
        flexDirection: 'row',
        gap: 5,
    },
    questCardStat: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E9E9E9',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 70,
        ...(Platform.OS === 'web'
            ? { boxShadow: '0 4px 16px rgba(255,255,255,0.1)' }
            : {
                    shadowColor: '#fff',
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
              }),
    },
    questCardStatText: {
        color: '#334155',
        fontSize: 12,
        lineHeight: 16*1.3,
        marginLeft: 8,
       
        fontFamily: 'Poppins', 
    },
    objectiveRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    objectiveEmoji: {
        fontSize: 18,
        lineHeight: 18*1.5,
        marginRight: 12,
        fontFamily: 'Poppins', 
        width: 24,
    },
    objectiveText: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 16*1.4,
        fontWeight: '400',
        flex: 1,
        fontFamily: 'Poppins', 
        opacity: 0.95,
    },
    playButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E9E9E9',
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 10,
        left: 5,
        ...(Platform.OS === 'web'
            ? { boxShadow: '0 6px 20px rgba(255,255,255,0.15)' }
            : {
                shadowColor: '#fff',
                shadowOpacity: 0.15,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
            }),
    },
    playButtonText: {
        fontSize: 16,
        lineHeight: 16*1.3,
        fontWeight: '600',
        marginLeft: 6,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Poppins',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Poppins',
    },
});
