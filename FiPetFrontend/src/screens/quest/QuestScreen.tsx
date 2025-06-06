import { AntDesign } from '@expo/vector-icons'; // Add this import
import { LinearGradient } from 'expo-linear-gradient'; // Add this at the top if using expo
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';

import { exampleQuest, Quest } from '@/src/types/quest';
import { useQuest } from '@/src/hooks/useQuest';

// Use the first quest for now
const quests = [ exampleQuest ];

// Simple Markdown-like parser for headings and bold
function renderFormattedText(text: string) {
	const lines = text.split('\n').filter(Boolean);
	return lines.map((line, idx) => {
		if (line.startsWith('## ')) {
			return (
				<ThemedText key={idx} type="subtitle" style={styles.subtitle}>
					{line.replace('## ', '')}
				</ThemedText>
			);
		}
		if (line.startsWith('# ')) {
			return (
				<ThemedText key={idx} type="title" style={styles.heading}>
					{line.replace('# ', '')}
				</ThemedText>
			);
		}
		// Bold: **text**
		const boldRegex = /\*\*(.*?)\*\*/g;
		const parts = [];
		let lastIndex = 0;
		let match;
		let key = 0;
		while ((match = boldRegex.exec(line)) !== null) {
			if (match.index > lastIndex) {
				parts.push(
					<ThemedText key={key++}>{line.substring(lastIndex, match.index)}</ThemedText>
				);
			}
			parts.push(
				<ThemedText key={key++} style={styles.bold}>
					{match[1]}
				</ThemedText>
			);
			lastIndex = match.index + match[0].length;
		}
		if (lastIndex < line.length) {
			parts.push(<ThemedText key={key++}>{line.substring(lastIndex)}</ThemedText>);
		}
		return (
			<View key={idx} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
				{parts}
			</View>
		);
	});
}

export default function QuestScreen() {
	const [started, setStarted] = useState(Array(quests.length).fill(false));
	const router = useRouter();

	const handleBegin = (idx: number, quest: Quest) => {
		const updated = [...started];
		updated[idx] = true;
		router.push( `/quests/${quest.id}` );
	};

	return (
		<View style={{ flex: 1 }}>
			{/* Gradient background */}
			<LinearGradient
				colors={['#38405a', '#2d3142', '#5f6caf']}
				style={StyleSheet.absoluteFill}
				start={{ x: 0.2, y: 0 }}
				end={{ x: 1, y: 1 }}
			/>
			<ThemedView style={styles.container}>
				{/* Back Arrow Button */}
				<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
					<AntDesign name="arrowleft" size={28} color="#38405a" />
				</TouchableOpacity>

				<ScrollView contentContainerStyle={styles.cardsContainer}>
					{quests.map((quest, idx) => (
						<View key={quest.title} style={styles.card}>
							<ScrollView
								style={styles.scrollArea}
								contentContainerStyle={styles.scrollContent}
								showsVerticalScrollIndicator={true}
							>
								{/* Add a cute emoji to the heading */}
								<ThemedText style={styles.heading}>
									{'📜 '}
									{quest.title}
								</ThemedText>
								{renderFormattedText(quest.scroll)}
								{/* {quest.questions.map(q => (
									<ThemedText
										key={q.id}
										lightColor="#222"
										darkColor="#222"
									>
										{'💡 '}
										{q.text}
									</ThemedText>
								))} */}
							</ScrollView>
							{!started[idx] && (
								<TouchableOpacity
									style={styles.beginButton}
									activeOpacity={0.85}
									onPress={() => handleBegin(idx, quest)}
								>
									<ThemedText type="default" style={styles.beginButtonText}>
										{'🦊 Begin Quest'}
									</ThemedText>
								</TouchableOpacity>
							)}
						</View>
					))}
				</ScrollView>
			</ThemedView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 60,
		alignItems: 'center',
		backgroundColor: 'black', // changed to black
	},
	backButton: {
		position: 'absolute',
		top: 36,
		left: 18,
		zIndex: 10,
		borderRadius: 24,
		padding: 8,
		backgroundColor: '#ffe066',
		elevation: 4,
		shadowOpacity: 0.22,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 2 },
	},
	cardsContainer: {
		paddingTop: 30,
		paddingBottom: 40,
		paddingHorizontal: 8,
		alignItems: 'center',
	},
	card: {
		width: '95%',
		maxWidth: 400,
		backgroundColor: '#2d3142',
		borderRadius: 32,
		borderWidth: 2.5,
		borderColor: '#b5ead7',
		marginBottom: 32,
		padding: 20,
		shadowColor: '#b5ead7',
		shadowOpacity: 0.25,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 8 },
		elevation: 7,
		alignItems: 'stretch',
		// Glow effect
		// shadowStyle: {
		// 	shadowColor: '#ffe066',
		// 	shadowOpacity: 0.3,
		// 	shadowRadius: 20,
		// 	shadowOffset: { width: 0, height: 0 },
		// },
	},
	scrollArea: {
		maxHeight: 220,
		minHeight: 120,
		borderRadius: 20,
		backgroundColor: '#38405a',
		padding: 16,
		marginBottom: 16,
		borderWidth: 1.5,
		borderColor: '#b5ead7',
		shadowColor: '#000',
		shadowOpacity: 0.15,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	scrollContent: {
		paddingBottom: 10,
	},
	heading: {
		fontSize: 26,
		marginBottom: 12,
		fontWeight: 'bold',
		color: '#ffe066',
		textAlign: 'center',
		letterSpacing: 1,
	},
	subtitle: {
		fontSize: 18,
		marginBottom: 8,
		fontWeight: '600',
		color: '#b5ead7',
		textAlign: 'center',
	},
	bold: {
		fontWeight: 'bold',
		color: '#ff7f50',
	},
	beginButton: {
		backgroundColor: '#ffe066',
		paddingVertical: 16,
		borderRadius: 24,
		alignItems: 'center',
		shadowColor: '#b5ead7',
		shadowOpacity: 0.22,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 2 },
		elevation: 3,
		marginTop: 14,
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 10,
	},
	beginButtonText: {
		color: '#38405a',
		fontWeight: 'bold',
		fontSize: 20,
		letterSpacing: 1,
	},
	question: {
		marginTop: 14,
		fontSize: 17,
		fontWeight: '700',
		color: '#222',
		backgroundColor: '#ffe066',
		borderRadius: 16,
		paddingVertical: 10,
		paddingHorizontal: 16,
		marginBottom: 10,
		overflow: 'hidden',
		borderWidth: 1.5,
		borderColor: '#b5ead7',
		shadowColor: '#ffe066',
		shadowOpacity: 0.13,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
});
