import { View, Text, StyleSheet, TouchableOpacity, } from 'react-native';
import BaseModal from './BaseModal';
import { Colors } from '@/src/constants/Colors';
import { ThemedText } from '../ThemedText';

type TextInputModalProps = {
  isVisible: boolean,
  title?: string,
  text: string,
  onClose: () => void; // should set isVisible
  onConfirm: () => void,
  onCancel: () => void,
};

export default function ConfirmModal({
  isVisible,
  onClose,
  onConfirm,
  onCancel,
  title="Are you sure?",
  text,
}: TextInputModalProps) {

  function handleConfirm() {
    onConfirm();
    onClose();
  }

  function handleCancel() {
    onCancel();
    onClose();
  }

  const styles = StyleSheet.create({
    text: {
      fontSize: 20,
      marginBottom: 20,
    },
    button: {
      backgroundColor: Colors.primary.default,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8,
      borderRadius: 20,
      flexGrow: 1,
    },
    confirmButton: {
      backgroundColor: Colors.green,
    },
    cancelButton: {
      backgroundColor: Colors.red,
    },
    buttonText: {
      color: "#FFF",
      fontSize: 18,
      fontWeight: 'bold',
    },
    buttonDisabled: {
      backgroundColor: Colors.paleGreen,
    },
    validationError: {
      width: "100%",
      textAlign: "center",
      fontSize: 16,
      color: Colors.red,
    },
    innerContent: {
      padding: 20,
      paddingBottom: 50,
      display: "flex",
      gap: 5,
      justifyContent: "center",
      flexDirection: "column",
      height: "100%",
    },
    buttonContainer: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      gap: 30,
    },
  });

  return (
    <BaseModal isVisible={isVisible} title={title} onClose={onClose}>
      <View style={styles.innerContent}>
        <ThemedText lightColor="#000" darkColor="#FFF" style={styles.text}>{text}</ThemedText>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            activeOpacity={0.5}
            onPress={handleConfirm}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            activeOpacity={0.5}
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseModal>
  );
}

