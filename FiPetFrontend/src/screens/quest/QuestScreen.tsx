// import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import firebase from '@react-native-firebase/app';
import { collection, getDocs } from '@firebase/firestore';
import { db } from '../../config/firebase'; // adjust path if needed
import { LinearGradient } from 'expo-linear-gradient';

const ProgressBar = ({ progressText }: { progressText: string }) => {
	// Convert progressText to a number (e.g., "70%" -> 70)
	const progress =
		typeof progressText === 'string'
			? parseInt(progressText.replace('%', ''), 10)
			: Number(progressText);

	return (
		<View style={styles.progressBarBg}>
			<View
				style={[
					styles.progressBarFill,
					{ width: `${Math.min(Math.max(progress, 0), 100)}%` },
				]}
			/>
			<View style={styles.progressBarTextWrapper}>
				<Text style={styles.progressTextInBar}>{progressText}</Text>
			</View>
		</View>
	);
};

type Quest = {
	id: string;
	[key: string]: any; // You can replace 'any' with more specific types if you know the structure
};

// Dummy stats for header
const stats = [
	{ icon: <FontAwesome5 name="star" size={16} color="#FFD700" />, value: 6 },
	{ icon: <MaterialCommunityIcons name="fire" size={18} color="#FF7A00" />, value: 3 },
	{ icon: <FontAwesome5 name="coins" size={16} color="#FFD700" />, value: 1400 },
];

export default function QuestScreen() {
	const [quests, setQuests] = useState<Quest[]>([]);

	useEffect(() => {
		const fetchQuests = async () => {
			try {
				const querySnapshot = await getDocs(collection(db, 'quests'));
				const questsData = querySnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setQuests(questsData);
				console.log('Fetched quests:', questsData);
			} catch (error) {
				console.error('Error fetching quests:', error);
			}
		};

		fetchQuests();
	}, []);

	// Dummy quests for illustration
	const dummyQuests = [
		{
			id: '1',
			title: 'Spend It or Save It',
			xp: 150,
			time: '30 min',
			objectives: [
				'Understand the difference between spending and saving',
				'Recognize opportunity cost',
				'Learn to delay gratification for larger financial goals',
			],
			gradient: ['#A259FF', '#3B82F6'],
		},
		{
			id: '2',
			title: 'Example Quest II',
			xp: 260,
			time: '45 min',
			objectives: [
				'Understand the difference between spending and saving',
				'Recognize opportunity cost',
				'Learn to delay gratification for larger financial goals',
			],
			gradient: ['#43E97B', '#38F9D7'],
		},
	];

	const questsToShow = quests.length > 0 ? quests : dummyQuests;

	return (
		<View style={{ flex: 1, backgroundColor: '#F6F8FF' }}>
			{/* Gradient Header */}
			<LinearGradient
				colors={['#A259FF', '#3B82F6']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={styles.header}
			>
				<Text style={styles.headerTitle}>Quests</Text>
				<View style={styles.statsRow}>
					{stats.map((stat, idx) => (
						<View key={idx} style={styles.statBox}>
							{stat.icon}
							<Text style={styles.statValue}>{stat.value}</Text>
						</View>
					))}
				</View>
			</LinearGradient>

			{/* Quests List */}
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{questsToShow.map((quest, idx) => (
					<LinearGradient
						key={quest.id}
						colors={quest.gradient}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.questCard}
					>
						<View style={styles.questCardHeader}>
							<View style={styles.questStatRow}>
								<View style={styles.questStatItem}>
									<FontAwesome5 name="star" size={14} color="#FFD700" />
									<Text style={styles.questStatText}>{quest.xp}</Text>
								</View>
								<View style={styles.questStatItem}>
									<Feather name="clock" size={14} color="#fff" />
									<Text style={styles.questStatText}>{quest.time}</Text>
								</View>
							</View>
						</View>
						<Text style={styles.questTitle}>{quest.title}</Text>
						<View style={styles.objectivesList}>
							{(quest.objectives ?? []).map((obj: string, i: number) => (
								<View key={i} style={styles.objectiveRow}>
									<MaterialCommunityIcons name="check-decagram" size={18} color="#fff" style={{ marginRight: 8 }} />
									<Text style={styles.objectiveText}>{obj}</Text>
								</View>
							))}
						</View>
						<TouchableOpacity style={styles.playButton} onPress={() => router.push(`/quests/${quest.id}`)}>
							<Text style={styles.playButtonText}>Play</Text>
						</TouchableOpacity>
					</LinearGradient>
				))}
			</ScrollView>

			{/* Bottom Tab Bar (dummy, for illustration) */}
			<View style={styles.tabBar}>
				<TouchableOpacity style={styles.tabIcon}><FontAwesome5 name="home" size={22} color="#bbb" /></TouchableOpacity>
				<TouchableOpacity style={styles.tabIcon}><MaterialCommunityIcons name="clipboard-list-outline" size={28} color="#6C63FF" /></TouchableOpacity>
				<TouchableOpacity style={styles.tabIcon}><FontAwesome5 name="user-friends" size={22} color="#bbb" /></TouchableOpacity>
				<TouchableOpacity style={styles.tabIcon}><MaterialCommunityIcons name="trophy-outline" size={28} color="#bbb" /></TouchableOpacity>
			</View>
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
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	statsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 4,
	},
	statBox: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.15)',
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 4,
		marginRight: 12,
	},
	statValue: {
		color: '#fff',
		fontWeight: 'bold',
		marginLeft: 6,
		fontSize: 16,
	},
	scrollContent: {
		padding: 20,
		paddingBottom: 100,
	},
	questCard: {
		borderRadius: 24,
		padding: 20,
		marginBottom: 28,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.12,
		shadowRadius: 12,
		elevation: 4,
	},
	questCardHeader: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginBottom: 8,
	},
	questStatRow: {
		flexDirection: 'row',
	},
	questStatItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 12,
	},
	questStatText: {
		color: '#fff',
		marginLeft: 4,
		fontWeight: 'bold',
		fontSize: 14,
	},
	questTitle: {
		color: '#fff',
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 12,
		marginTop: 4,
	},
	objectivesList: {
		marginBottom: 18,
	},
	objectiveRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
	},
	objectiveText: {
		color: '#fff',
		fontSize: 15,
		flex: 1,
		flexWrap: 'wrap',
	},
	playButton: {
		backgroundColor: '#fff',
		borderRadius: 20,
		alignSelf: 'flex-start',
		paddingHorizontal: 28,
		paddingVertical: 8,
		marginTop: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
	},
	playButtonText: {
		color: '#6C63FF',
		fontWeight: 'bold',
		fontSize: 16,
	},
	tabBar: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		height: 64,
		backgroundColor: '#fff',
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 8,
	},
	tabIcon: {
		flex: 1,
		alignItems: 'center',
	},
	progressBarBg: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 32,
		borderRadius: 16,
		backgroundColor: '#E0E0E0',
		paddingLeft: 8,
		paddingRight: 16,
		marginTop: 6,
		marginBottom: 2,
		minWidth: 120,
	},
	progressBarFill: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		backgroundColor: '#FFB347',
		borderRadius: 16,
	},
	progressTextInBar: {
		color: '#7D7D7D',
		fontSize: 20,
		fontWeight: '600',
		textAlignVertical: 'center',
	},
	progressBarTextWrapper: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1,
	},
});
