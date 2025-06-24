// import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { getAllQuests } from '@/src/services/questService';
import { Quest } from '@/src/types/quest';
import { useUserProgress } from '@/src/context/UserProgressContext';

export default function QuestScreen() {
	const [quests, setQuests] = useState<Quest[]>([]);
	const { progress } = useUserProgress();

	useFocusEffect(
		useCallback(() => {
			const fetchQuests = async () => {
				const data = await getAllQuests();
				setQuests(data);
			};
			fetchQuests();
		}, [])
	);

	// Progress calculation - count quests with all correct answers as completed
	const completedCount = quests.filter(q => {
		const questProgress = progress[q.id];
		return questProgress && questProgress.correctCount === questProgress.total && questProgress.total > 0;
	}).length;
	const totalCount = quests.length;
	const progressBarValue = totalCount > 0 ? completedCount / totalCount : 0;

	return (
		<View style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
			{/* Header with Progress Bar */}
			<LinearGradient
				colors={['#A259FF', '#3B82F6']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 0 }}
				style={styles.header}
			>
				<View style={{ flex: 1 }}>
					<Text style={styles.headerTitle}>Quests</Text>
					<View style={styles.progressBarContainer}>
						<View style={[styles.progressBar, { width: `${progressBarValue * 100}%` }]} />
					</View>
					<Text style={styles.progressText}>
						{completedCount} of {totalCount} Quests Completed
					</Text>
				</View>
			</LinearGradient>

			{/* Quests List */}
			<ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
				{quests.map((quest, idx) => {
					const questProgress = progress[quest.id];
					const isAllCorrect = questProgress && questProgress.correctCount === questProgress.total && questProgress.total > 0;
					
					return (
						<LinearGradient
							key={quest.id}
							colors={idx % 2 === 0 ? ['#A259FF', '#3B82F6'] : ['#3B82F6', '#56CCF2']}
							style={styles.questCard}
						>
							{isAllCorrect ? (
								<View style={styles.checkmarkContainer}>
									<MaterialCommunityIcons name="check-circle" size={32} color="#FFD700" />
								</View>
							) : (
								<View style={styles.correctCountContainer}>
									<Text style={styles.correctCountText}>
										{(questProgress?.correctCount ?? 0)}/{questProgress?.total ?? quest.questionIds.length} Correct
									</Text>
								</View>
							)}
							<Text style={styles.questTitle}>{quest.title}</Text>
							<View style={styles.questStatsRow}>
								<View style={styles.questStat}>
									<MaterialCommunityIcons name="star" size={16} color="#FFD700" />
									<Text style={styles.questStatText}>{quest.xpReward}</Text>
								</View>
								<View style={styles.questStat}>
									<Ionicons name="time-outline" size={16} color="#fff" />
									<Text style={styles.questStatText}>{quest.duration}</Text>
								</View>
							</View>
							<View style={styles.objectives}>
								<Text style={styles.descriptionText}>{quest.description}</Text>
								<Text style={styles.topicText}>{quest.topic}</Text>
							</View>
							<TouchableOpacity
								style={styles.playButton}
								onPress={() => router.push(`/quests/${quest.id}`)}
							>
								<Ionicons name="play" size={24} color="#A259FF" />
								<Text style={styles.playButtonText}>Play</Text>
							</TouchableOpacity>
						</LinearGradient>
					);
				})}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		paddingTop: 48,
		paddingBottom: 24,
		paddingHorizontal: 24,
		borderBottomLeftRadius: 24,
		borderBottomRightRadius: 24,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	headerTitle: {
		color: '#fff',
		fontSize: 28,
		fontWeight: 'bold',
		letterSpacing: 1,
	},
	progressBarContainer: {
		height: 10,
		backgroundColor: 'rgba(255,255,255,0.25)',
		borderRadius: 8,
		marginTop: 16,
		marginBottom: 8,
		overflow: 'hidden',
	},
	progressBar: {
		height: '100%',
		backgroundColor: '#FFD700',
		borderRadius: 8,
	},
	progressText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 15,
		textAlign: 'center',
		marginTop: 2,
	},
	questCard: {
		borderRadius: 24,
		padding: 20,
		marginBottom: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 4,
	},
	questTitle: {
		color: '#fff',
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	questStatsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
		gap: 16,
	},
	questStat: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 16,
		backgroundColor: 'rgba(255,255,255,0.15)',
		borderRadius: 12,
		paddingHorizontal: 8,
		paddingVertical: 2,
	},
	questStatText: {
		color: '#fff',
		fontWeight: 'bold',
		marginLeft: 4,
		fontSize: 14,
	},
	objectives: {
		marginBottom: 16,
	},
	descriptionText: {
		color: '#fff',
		fontSize: 15,
		marginBottom: 4,
		opacity: 0.95,
	},
	topicText: {
		color: '#fff',
		fontSize: 17,
		fontStyle: 'italic',
		fontWeight: '500',
		marginTop: 8,
		opacity: 0.95,
	},
	playButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 24,
		alignSelf: 'flex-start',
		paddingHorizontal: 20,
		paddingVertical: 8,
		marginTop: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 2,
	},
	playButtonText: {
		color: '#A259FF',
		fontWeight: 'bold',
		fontSize: 16,
		marginLeft: 8,
	},
	correctCountContainer: {
		position: 'absolute',
		top: 12,
		right: 12,
		zIndex: 2,
		backgroundColor: 'rgba(255,255,255,0.15)',
		borderRadius: 16,
		padding: 2,
	},
	correctCountText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 14,
	},
	checkmarkContainer: {
		position: 'absolute',
		top: 12,
		right: 12,
		backgroundColor: 'rgba(255,255,255,0.15)',
		borderRadius: 16,
		padding: 2,
	},
});
