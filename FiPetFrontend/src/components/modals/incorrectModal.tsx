import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';

export type IncorrectModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  text: string;
};

export default function IncorrectModal({
  isVisible,
  onClose,
  onConfirm,
  onCancel,
  title,
  text,
}: IncorrectModalProps) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessible
      accessibilityViewIsModal
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title || 'Not Quite'}</Text>
          <View style={styles.foxContainer}>
            <Image
              source={require('@/src/assets/images/sad-fox.png')}
              style={styles.foxImage}
              resizeMode="contain"
            />
            <Image
              source={require('@/src/assets/images/red-Vector.png')}
              style={styles.foxShadow}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity style={styles.explanationButton} onPress={onConfirm}>
            <Text style={styles.explanationButtonText}>SEE EXPLANATION</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'rgba(255, 99, 132, 0.95)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
    position: 'absolute',
    top: 137,
  },
  foxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    width: 267.01,
    height: 250,
    position: 'absolute',
    top: 260,

  },
  foxImage: {
    width: 267.01,
    height: 250,
    marginBottom: 30,
    position: 'relative',
    zIndex: 2,
  },
  foxShadow: {
    width: 219,
    height: 25,
    position: 'absolute',
    bottom: -100,
    left: '50%',
    marginLeft: -109.5,
    zIndex: 1,
    opacity: 1,
  },
  explanationButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 40,
    alignSelf: 'center',
    position: 'absolute',
    top: 600,
  },
  explanationButtonText: {
    color: '#FF6384',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
}); 