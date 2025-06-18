import { Modal, View, Text, Pressable, StyleSheet, SafeAreaView, TouchableWithoutFeedback, DimensionValue, Dimensions } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  isVisible: boolean,
  title: string,
  onClose: () => void,
  modalHeight?: number | `${number}%`,
}>;

export default function BaseModal({ isVisible, onClose, title, children, modalHeight='25%' }: Props) {

  const headerHeight = '18%';
  const windowHeight = Dimensions.get('window').height;

  let relativeModalHeight;
  if (typeof modalHeight === 'number' ) {
    relativeModalHeight = (modalHeight / windowHeight) * 100;
    modalHeight = `${relativeModalHeight}%`;
  } else {
    relativeModalHeight = parseFloat(modalHeight.replace('%', ''));
  }

  let relativeCenterOffset = 50 - (relativeModalHeight / 2);
  let centerOffset: DimensionValue = `${relativeCenterOffset}%`;

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
    modalContent: {
      height: modalHeight,
      width: '100%',
      backgroundColor: colors.light,
      borderRadius: 18,
      position: 'absolute',
      top: centerOffset,
    },
    titleContainer: {
      backgroundColor: colors.primary,
      height: headerHeight,
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontWeight: "bold",
      color: colors.black,
      fontSize: 20,
      flexGrow: 2,
      textAlign: "center",
    },
  });

  return (
    <SafeAreaView>
      <Modal onRequestClose={onClose} animationType="slide" transparent={false} backdropColor="#0001" visible={isVisible}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{width: "100%", height: "100%"}}>
            <TouchableWithoutFeedback onPress={()=>{}}>
              <View style={styles.modalContent}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{title}</Text>
                  <Pressable onPress={onClose}>
                    <IconSymbol name="xmark" color="#CEA022" size={22}/>
                  </Pressable>
                </View>
                {children}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

