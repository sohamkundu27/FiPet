import { View, Text, StyleSheet } from 'react-native';
import { useGamificationStats } from '@/src/hooks/useGamificationStats';
import TabHeader from '@/src/components/TabHeader';

export default function Store() {
  const {level, coins, streak} = useGamificationStats();

  return (
    <View style={styles.container}>
      <TabHeader
        xp={level.xp}
        coins={coins.coins}
        streak={streak.current}
        title="Store"
        gradient={{
          startColor: "#0AC617",
          endColor: "#E9DE00",
        }}
      />
      <View style={styles.content}>
        <Text>Store Page (Dummy Page)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
    paddingTop: 100,
  },
});
