import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';

export type CorrectModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onContinue: () => void;
  title?: string;
  text?: string;
};

export default function CorrectModal({
  isVisible,
  onClose,
  onContinue,
  title = '🎉 Correct',
  text = '',
}: CorrectModalProps) {
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
          <Text style={styles.title}>{title}</Text>
          <View style={styles.foxContainer}>
            <Image
              source={require('@/src/assets/images/Evo1-happy-fox.png')}
              style={styles.foxImage}
              resizeMode="contain"
            />
            <Image
              source={require('@/src/assets/images/green-Vector.png')}
              style={styles.foxShadow}
              resizeMode="contain"
            />
          </View>
          {text ? <Text style={styles.text}>{text}</Text> : null}
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#7CF97C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#7CF97C',
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
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  continueButton: {
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
  continueButtonText: {
    color: '#6C63FF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
}); 