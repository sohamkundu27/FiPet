// import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import { collection, getDocs } from '@firebase/firestore';
import { db } from '../../config/firebase'; // adjust path if needed

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

export default function QuestScreen() {
	const navigation = useNavigation();
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

	return (
		<View style={{ flex: 1, backgroundColor: '#F9F7E0' }}>
			<View style={styles.container}>
				{/* Header */}
				<View style={styles.headerRow}>
					<Text style={styles.headerTitle}>Daily Quests</Text>
					<View style={styles.headerTimer}>
						<Feather name="clock" size={18} color="#7D7D7D" />
						<Text style={styles.headerTimerText}>5 hrs 56 min</Text>
					</View>
				</View>

				<ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
					<View style={styles.questListRow}>
						{/* Timeline */}
						<View style={styles.dottedLineContainer}>
							{quests.map((_, idx) => (
								<React.Fragment key={idx}>
									{idx !== 0 && <View style={styles.dottedLine} />}
									<View style={styles.nodeCircle} />
								</React.Fragment>
							))}
						</View>
						{/* Quest cards */}
						<View style={{ flex: 1 }}>
							{quests.map((q) => {
								// Calculate progress as a percentage of 100 XP
								const progressPercent = Math.round((q.xpReward / 100) * 100);
								return (
									<TouchableOpacity
										key={q.id}
										style={styles.questCard}
										activeOpacity={0.85}
										onPress={() => navigation.navigate('QuestScreen')}
									>
										<View style={[styles.questIconBox, { backgroundColor: '#FFB347' }]}>
											<MaterialCommunityIcons name="book-open-variant" size={28} color="#fff" />
										</View>
										<View style={{ flex: 1 }}>
											<Text style={styles.questDesc}>{q.title}</Text>
											<Text style={styles.questSub}>{q.description}</Text>
											<ProgressBar progressText={`${progressPercent}%`} />
											<Text style={{ color: '#7D7D7D', fontSize: 14, marginTop: 2 }}>
												XP: {q.xpReward} / 100 | Topic: {q.topic}
											</Text>
										</View>
										<View style={styles.arrowButton}>
											<AntDesign name="arrowright" size={28} color="#7D7D7D" />
										</View>
									</TouchableOpacity>
								);
							})}
						</View>
					</View>

					{/* Special Quests */}
					<Text style={styles.specialTitle}>Special Quests</Text>
					{/* <View>
						{specialQuests.map((q) => (
							<TouchableOpacity
								key={q.id}
								style={styles.questCard}
								activeOpacity={0.85}
								onPress={() => navigation.navigate('QuestScreen')}
							>
								<View style={[styles.questIconBox, { backgroundColor: q.iconBg }]}>{q.icon}</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.questDesc}>{q.desc}</Text>
									{q.sub && <Text style={styles.questSub}>{q.sub}</Text>}
									<ProgressBar progressText={q.progress} />
								</View>
								{q.hint && (
									<View style={styles.hintButton}>
										<Text style={styles.hintButtonText}>Hint</Text>
									</View>
								)}
							</TouchableOpacity>
						))}
					</View> */}
				</ScrollView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 36,
		paddingHorizontal: 12,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 18,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#444',
		letterSpacing: 0.5,
	},
	headerTimer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	headerTimerText: {
		color: '#7D7D7D',
		fontWeight: '600',
		fontSize: 16,
		marginLeft: 6,
	},
	questListRow: {
		flexDirection: 'row',
		alignItems: 'stretch',
		marginBottom: 30,
	},
	dottedLineContainer: {
		width: 40,
		alignItems: 'center',
		height: '100%',
		paddingTop: 8,
		paddingBottom: 8,
	},
	dottedLine: {
		width: 2,
		flex: 1,
		backgroundColor: 'transparent',
		borderStyle: 'dashed',
		borderLeftWidth: 2,
		borderColor: '#E0E0C0',
	},
	nodeCircle: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: '#fff',
		borderWidth: 3,
		borderColor: '#E0E0C0',
		marginVertical: 8,
	},
	questCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 24,
		padding: 18,
		marginBottom: 22,
		marginLeft: 2,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
		gap: 16,
	},
	questIconBox: {
		width: 56,
		height: 56,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 14,
	},
	questDesc: {
		fontSize: 17,
		color: '#222',
		fontWeight: '700',
		marginBottom: 4,
	},
	questSub: {
		fontSize: 14,
		color: '#7D7D7D',
		marginBottom: 4,
		fontWeight: '600',
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
	arrowButton: {
		backgroundColor: '#E0E0E0',
		borderRadius: 20,
		width: 48,
		height: 48,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 10,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	specialTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#444',
		marginBottom: 12,
		marginTop: 10,
		letterSpacing: 0.5,
	},
	hintButton: {
		backgroundColor: '#E0E0E0',
		borderRadius: 16,
		paddingHorizontal: 18,
		paddingVertical: 8,
		marginLeft: 10,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
		justifyContent: 'center',
		alignItems: 'center',
	},
	hintButtonText: {
		color: '#7D7D7D',
		fontWeight: 'bold',
		fontSize: 16,
		letterSpacing: 0.5,
	},
});
