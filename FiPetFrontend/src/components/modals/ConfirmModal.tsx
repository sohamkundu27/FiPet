import { View, Text, StyleSheet, TouchableOpacity, } from 'react-native';
import BaseModal from './BaseModal';

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

  return (
    <BaseModal isVisible={isVisible} title={title} onClose={onClose}>
      <View style={styles.innerContent}>
        <Text style={styles.text}>{text}</Text>
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

const colors = {
  dark: "#ddb98b",
  light: "#fff9cb",
  primary: "#EDD287",
  primaryText: "#CEA022",
  green: "#3a3",
  paleGreen: "#595",
  white: "#fff",
  red: "#d33",
  black: "#000",
}

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primaryText,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 20,
    flexGrow: 1,
  },
  confirmButton: {
    backgroundColor: colors.green,
  },
  cancelButton: {
    backgroundColor: colors.red,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: colors.paleGreen,
  },
  validationError: {
    width: "100%",
    textAlign: "center",
    fontSize: 16,
    color: colors.red,
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
