import { View, Text, StyleSheet, TextInput, TouchableOpacity, } from 'react-native';
import { useState } from 'react';
import BaseModal from './BaseModal';

type TextInputModalProps = {
  isVisible: boolean,
  title: string,
  onClose: () => void; // should set isVisible
  onConfirm: (textInput: string) => void,
  defaultValue?: string,
  placeholder?: string,
  maxLength?: number,
  validation?: (textInput: string) => string, // function outputs empty string if valid, error string if not.
};

export default function TextInputModal({
  isVisible,
  onClose,
  onConfirm,
  title,
  defaultValue,
  placeholder,
  maxLength,
  validation
}: TextInputModalProps) {

  const [value, setValue] = useState<string>(defaultValue || "");
  let _validationError = validation ? validation(defaultValue || "") : "";
  const [buttonDisabled, setDisable] = useState<boolean>( _validationError !== "" );
  const [validationError, setValidationError] = useState<string>( _validationError )

  function onChange( textInput: string ) {
    let _validationError = validation ? validation(value || "") : "";
    setValidationError( _validationError );
    setDisable( _validationError !== "" );
    setValue(textInput);
  }

  function handleConfirm() {
    onConfirm( value );
    onClose();
  }

  return (
    <BaseModal isVisible={isVisible} title={title} onClose={onClose}>
      <View style={styles.innerContent}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          maxLength={maxLength}
        />
        {validationError &&
          <Text style={styles.validationError}>{validationError}</Text>
        }
        <TouchableOpacity
          style={[
            styles.button,
            (buttonDisabled) && styles.buttonDisabled
          ]}
          activeOpacity={0.5}
          onPress={handleConfirm}
          disabled={buttonDisabled}
        >
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
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
  button: {
    backgroundColor: colors.primaryText,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 20,
    width: '100%',
    marginTop: 10,
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
  input: {
    width: '100%',
    height: 50,
    borderWidth: 3,
    borderColor: colors.dark,
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    fontSize: 16,
  },
});
