import { AntDesign } from '@expo/vector-icons'; // Add this import
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';

// Example quest schema
const quests = [
  {
    title: "The Lost Scroll",
    scroll: `
# The Lost Scroll

You find yourself in the ancient library of FiPet. **Dusty tomes** line the shelves, and a mysterious scroll glows on a pedestal.

## What will you do?

Will you **read** the scroll, or leave it untouched? Your choice will shape your adventure.
    `,
    questions: [
      { id: 1, text: "Do you read the scroll?" },
      { id: 2, text: "Do you search the room?" }
    ],
    outcomes: [
      { id: 1, result: "You gain ancient knowledge!" },
      { id: 2, result: "You find a hidden door!" }
    ]
  },
  {
    title: "The Forgotten Fountain",
    scroll: `
# The Forgotten Fountain

In the heart of the FiPet gardens, you discover a **crumbling fountain** covered in moss. Water trickles quietly, and something glimmers at the bottom.

## What will you do?

Will you **reach into the water**, or simply admire the fountain from afar?
    `,
    questions: [
      { id: 1, text: "Do you reach into the water?" },
      { id: 2, text: "Do you look around the fountain?" }
    ],
    outcomes: [
      { id: 1, result: "You find a mysterious coin!" },
      { id: 2, result: "You spot a hidden inscription!" }
    ]
  },
  {
    title: "The Enchanted Grove",
    scroll: `
# The Enchanted Grove

You step into a grove where the trees whisper secrets and the air shimmers with magic. A path splits in two directions: one bathed in sunlight, the other shadowed and mysterious.

## What will you do?

Will you **follow the sunlit path**, or venture into the shadows?
    `,
    questions: [
      { id: 1, text: "Do you follow the sunlit path?" },
      { id: 2, text: "Do you venture into the shadows?" }
    ],
    outcomes: [
      { id: 1, result: "You find a grove of singing birds!" },
      { id: 2, result: "You discover a hidden magical artifact!" }
    ]
  }
];

// Use the first quest for now
const quest = quests[0];

// Simple Markdown-like parser for headings and bold
function renderFormattedText(text: string) {
  const lines = text.split('\n').filter(Boolean);
  return lines.map((line, idx) => {
    if (line.startsWith('## ')) {
      return <ThemedText key={idx} type="subtitle" style={styles.subtitle}>{line.replace('## ', '')}</ThemedText>;
    }
    if (line.startsWith('# ')) {
      return <ThemedText key={idx} type="title" style={styles.heading}>{line.replace('# ', '')}</ThemedText>;
    }
    // Bold: **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<ThemedText key={key++}>{line.substring(lastIndex, match.index)}</ThemedText>);
      }
      parts.push(<ThemedText key={key++} style={styles.bold}>{match[1]}</ThemedText>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) {
      parts.push(<ThemedText key={key++}>{line.substring(lastIndex)}</ThemedText>);
    }
    return <View key={idx} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>{parts}</View>;
  });
}

export default function QuestScreen() {
  const [started, setStarted] = useState(Array(quests.length).fill(false));
  const router = useRouter();

  const handleBegin = (idx: number) => {
    // const updated = [...started];
    // updated[idx] = true;
    // setStarted(updated);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Back Arrow Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <AntDesign name="arrowleft" size={28} color="#4a90e2" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {quests.map((quest, idx) => (
          <View key={quest.title} style={styles.card}>
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              {renderFormattedText(quest.scroll)}
              {quest.questions.map(q => (
                <ThemedText
                  key={q.id}
                  style={styles.question}
                  lightColor="#000"
                  darkColor="#000"
                >
                  {q.text}
                </ThemedText>
              ))}
            </ScrollView>
            {!started[idx] && (
              <TouchableOpacity
                style={styles.beginButton}
                onPress={() => handleBegin(idx)}
              >
                <ThemedText type="default" style={styles.beginButtonText}>
                  Begin Quest
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    borderRadius: 20,
    padding: 4,
    color: '#fff',
    elevation: 2,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  cardsContainer: {
    paddingTop: 40,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#f9fff6',
    borderRadius: 20,
    borderWidth: 2,
    // borderColor: '#b2d8b2',
    marginBottom: 32,
    padding: 16,
    shadowColor: '#b2d8b2',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'stretch',
  },
  scrollArea: {
    maxHeight: 200,
    minHeight: 120,
    borderRadius: 14,
    color: '#b2d8b2',
    backgroundColor: 'rgba(10, 126, 164, 1.00)',
    padding: 12,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  heading: {
    fontSize: 22,
    marginBottom: 8,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 17,
    marginBottom: 6,
    fontWeight: '600',
    color: 'white',
  },
  bold: {
    fontWeight: 'bold',
    color: 'white',
  },
  beginButton: {
    backgroundColor: 'rgba(10, 126, 164, 1.00)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#588157',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginTop: 8,
  },
  beginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  question: {
  marginTop: 10,
  fontSize: 15,
  fontWeight: '600',
  color: 'white', // Force black color
},
});