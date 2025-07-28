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
              source={require('@/src/assets/images/happy-fox.png')}
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
    backgroundColor: '#7CF97C', // Solid green background instead of transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#7CF97C', // Solid green background instead of semi-transparent
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
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 40,
    alignSelf: 'center',
    position: 'absolute',
    top: 600,
  },
  continueButtonText: {
    color: '#6C63FF',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
}); 