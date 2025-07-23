/*
<View style={styles.optionsContainer}>
  {options.map((option) => {
    const isSelected = Array.isArray(selectedOption)
      ? selectedOption.some((o) => 'id' in o && o.id === option.id)
      : false;

    return (
      <TouchableOpacity
        key={option.id}
        disabled={disabled}
        onPress={() => onSelect(option)}
        style={[
          styles.optionButton,
          isSelected && styles.selectedOption,
          disabled && !isSelected && styles.disabledOption,
        ]}
      >
        <Text style={styles.optionText}>{option.text}</Text>
      </TouchableOpacity>
    );
  })}
</View>
*/
/*const styles = StyleSheet.create({
  optionsContainer: {
    marginTop: 10,
    marginBottom: 24,
    alignItems: "center",
  },
  optionButton: {
    width: "90%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: "#ccc",
    elevation: 2,
    alignItems: "center",
  },
  imageButton: {
    width: "90%",
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: "#ccc",
    elevation: 2,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  optionText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
  selectedOption: {
    backgroundColor: "#c8f7c5",
    borderColor: "#2fae19",
  },
  disabledOption: {
    opacity: 0.6,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  matchButton: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    maxHeight: "60%",
  },

});
*/
