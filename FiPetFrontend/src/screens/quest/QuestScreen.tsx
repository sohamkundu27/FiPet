import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon, Circle, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useAuth } from '@/src/hooks/useRequiresAuth';
import TabHeader from '@/src/components/TabHeader';
import { useGamificationStats } from '@/src/hooks/useGamificationStats';
import { Quest } from '@/src/services/quest/Quest';
import { db } from '@/src/config/firebase';
import { collection } from '@firebase/firestore';
import { QUEST_COLLECTION } from '@/src/types/quest';

export default function QuestScreen() {
    const { width, height } = Dimensions.get('window');
    const isTablet = width >= 768;
    const isLargeTablet = width >= 1024;

    const {level, coins, streak} = useGamificationStats();
    const router = useRouter();
    const [quests, setQuests] = useState<Quest[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);
    const {user} = useAuth();

    const fetchQuests = React.useCallback(async (forceRefresh = false) => {
        
        // Check if we should skip fetching (cache for 30 seconds)
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTime;
        const shouldSkipFetch = !forceRefresh && timeSinceLastFetch < 30000 && quests;
        
        if (shouldSkipFetch) {
            setLoading(false); // Ensure loading is false when using cache
            return;
        }
        
        try {
            setLoading(true);
            const questQuery = collection(db, QUEST_COLLECTION);
            const quests = await Quest.fromFirebaseQuery(db, questQuery, false, false, user.uid);
            setQuests(quests.filter((quest) => !quest.isComplete));
            setLastFetchTime(now);
        } catch (error) {
            console.error('Error fetching quests:', error);
        } finally {
            setLoading(false);
        }
    }, [lastFetchTime, user.uid, quests]);

    // Only refresh on focus if we don't have any quest data yet
    useFocusEffect(
        React.useCallback(() => {
              fetchQuests(false);
        }, [fetchQuests])
    );

    // Component to show correct answers for a quest
    const CorrectAnswersCounter = ({ quest }: { quest: Quest }) => {
        const questions = quest.getQuestions();
        const answeredQuestions = questions.reduce(
          (value, question) => value+(question.hasAnswer() ? 1 : 0),
            0
        );
        if (questions.length === 0) return null;

        return (
            <View style={styles.correctAnswersBadge}>
                <Text style={styles.correctAnswersText}>{answeredQuestions}/{questions.length}</Text>
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
                contentContainerStyle={[
                    styles.scrollContent,
                    isTablet && styles.scrollContentTablet,
                    isLargeTablet && styles.scrollContentLargeTablet
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={() => fetchQuests(true)}
                        colors={['#A259FF', '#3B82F6']}
                        tintColor="#A259FF"
                    />
                }
            >
                {loading || !quests ? (
                    <View style={styles.loadingContainer}>
                        <Text style={[
                            styles.loadingText,
                            isTablet && styles.loadingTextTablet,
                            isLargeTablet && styles.loadingTextLargeTablet
                        ]}>Loading quest...</Text>
                    </View>
                ) : quests.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[
                            styles.emptyText,
                            isTablet && styles.emptyTextTablet,
                            isLargeTablet && styles.emptyTextLargeTablet
                        ]}>No quests available</Text>
                    </View>
                ) : (
                    <>
                    {quests.map((quest) => {
                    return (
                    <LinearGradient
                        key={quest.id}
                        colors={['#A259FF', '#3B82F6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }} 
                        style={[
                            styles.questCard,
                            isTablet && styles.questCardTablet,
                            isLargeTablet && styles.questCardLargeTablet
                        ]}
                     >

                                    
                        {/* Correct Answers Counter */}
                        <CorrectAnswersCounter quest={quest} />

                        <Text style={[
                            styles.questCardTitle,
                            isTablet && styles.questCardTitleTablet,
                            isLargeTablet && styles.questCardTitleLargeTablet
                        ]}>{quest.title}</Text>
                                    
                            
                            
                            {/* Objectives (descriptions) */}
                            <View style={styles.objectivesContainer}>
                                <View style={styles.objectiveRow}>
                                    <Text style={styles.objectiveText}>{quest.description}</Text>
                                </View>
                            </View>

                            {/* Bottom Row - Stats and Play Button */}
                            <View style={styles.bottomRow}>
                                <View style={styles.questCardStatsRow}>
                                    <View style={styles.questCardStat}>
                                        <GoldCoinIcon />
                                        <Text style={styles.questCardStatText}>{quest.reward.coins || 0}</Text>
                                    </View>
                                    <View style={styles.questCardStat}>
                                        <CustomClockIcon />
                                        <Text style={styles.questCardStatText}>{quest.duration} min</Text>
                                    </View>
                                </View>
                                
                                <TouchableOpacity
                                    style={styles.playButton}
                                    activeOpacity={0.85}
                                    onPress={() => {
                                        router.push(`/quests/${quest.id}`);
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
                      );
                    })}
                    </>
                )}
            </ScrollView>
        </View>
    );
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

const CustomClockIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 22 22">
    <Circle cx="11" cy="11" r="10" stroke="#3B82F6" strokeWidth="2.5" fill="#fff" />
    <Line x1="11" y1="11" x2="11" y2="6.2" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" />
    <Line x1="11" y1="11" x2="15.2" y2="13.5" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" />
  </Svg>
);

const GoldCoinIcon = ({ size = 20 }: { size?: number }) => (
  <Image style={{width: size, height: size, resizeMode: "contain"}} source={require("@/src/assets/images/coin.png")}/>
);

const styles = StyleSheet.create({
    scrollContent: {
        padding: 20,
        paddingTop: 20,
    },
    scrollContentTablet: {
        paddingHorizontal: 40,
        paddingTop: 30,
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
    },
    scrollContentLargeTablet: {
        paddingHorizontal: 60,
        paddingTop: 40,
        maxWidth: 1000,
    },
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
    questCardTablet: {
        borderRadius: 32,
        padding: 32,
        marginBottom: 24,
        marginHorizontal: 8,
    },
    questCardLargeTablet: {
        borderRadius: 40,
        padding: 40,
        marginBottom: 32,
        marginHorizontal: 16,
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
    questCardTitleTablet: {
        fontSize: 32,
        lineHeight: 32*1.2,
        marginBottom: 28,
        letterSpacing: -0.7,
    },
    questCardTitleLargeTablet: {
        fontSize: 38,
        lineHeight: 38*1.2,
        marginBottom: 36,
        letterSpacing: -0.9,
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
    questCardStatsRowTablet: {
        gap: 8,
    },
    questCardStatsRowLargeTablet: {
        gap: 12,
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
    questCardStatTablet: {
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 6,
        minWidth: 90,
    },
    questCardStatLargeTablet: {
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 8,
        minWidth: 110,
    },
    questCardStatText: {
        color: '#334155',
        fontSize: 12,
        lineHeight: 16*1.3,
        marginLeft: 8,
       
        fontFamily: 'Poppins', 
    },
    questCardStatTextTablet: {
        fontSize: 14,
        lineHeight: 14*1.3,
        marginLeft: 10,
    },
    questCardStatTextLargeTablet: {
        fontSize: 16,
        lineHeight: 16*1.3,
        marginLeft: 12,
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
    objectiveEmojiTablet: {
        fontSize: 22,
        lineHeight: 22*1.5,
        marginRight: 16,
        width: 28,
    },
    objectiveEmojiLargeTablet: {
        fontSize: 26,
        lineHeight: 26*1.5,
        marginRight: 20,
        width: 32,
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
    objectiveTextTablet: {
        fontSize: 18,
        lineHeight: 18*1.4,
    },
    objectiveTextLargeTablet: {
        fontSize: 20,
        lineHeight: 20*1.4,
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
    playButtonTablet: {
        borderRadius: 20,
        paddingHorizontal: 28,
        paddingVertical: 14,
    },
    playButtonLargeTablet: {
        borderRadius: 24,
        paddingHorizontal: 36,
        paddingVertical: 18,
    },
    playButtonText: {
        fontSize: 16,
        lineHeight: 16*1.3,
        fontWeight: '600',
        marginLeft: 6,
        fontFamily: 'Poppins', 
    },
    playButtonTextTablet: {
        fontSize: 18,
        lineHeight: 18*1.3,
        marginLeft: 8,
    },
    playButtonTextLargeTablet: {
        fontSize: 20,
        lineHeight: 20*1.3,
        marginLeft: 10,
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
    correctAnswersBadgeTablet: {
        top: 14,
        right: 14,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    correctAnswersBadgeLargeTablet: {
        top: 18,
        right: 18,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    correctAnswersText: {
        fontSize: 12,
        lineHeight: 12*1.5,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'Poppins',
    },
    correctAnswersTextTablet: {
        fontSize: 14,
        lineHeight: 14*1.5,
    },
    correctAnswersTextLargeTablet: {
        fontSize: 16,
        lineHeight: 16*1.5,
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
    loadingTextTablet: {
        fontSize: 18,
    },
    loadingTextLargeTablet: {
        fontSize: 20,
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
    emptyTextTablet: {
        fontSize: 18,
    },
    emptyTextLargeTablet: {
        fontSize: 20,
    },
});
