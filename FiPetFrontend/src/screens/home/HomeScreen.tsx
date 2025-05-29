import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import { ThemedView } from '@/src/components/ThemedView';
import { ThemedText } from '@/src/components/ThemedText';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Home Screen</ThemedText>
      
      <Link href="/welcome" style={styles.link}>
        <ThemedText type="link">Back to Welcome</ThemedText>
      </Link>

      <Link href="/quest" style={styles.link}>
        <ThemedText type="link">Go to Quest</ThemedText>
      </Link>

      <Link href="/login" style={styles.link}>
        <ThemedText type="link">Go to Login</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 30,
  },
  link: {
    marginVertical: 10,
    paddingVertical: 10,
  },
}); 