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
              source={require('@/src/assets/images/Evo1-sad-fox.png')}
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
    backgroundColor: '#FF6384',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FF6384',
    borderRadius: 0,
    paddingHorizontal: 32,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
  },
  foxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: 267.01,
    height: 250,
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
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  explanationButtonText: {
    color: '#FF6384',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
}); 