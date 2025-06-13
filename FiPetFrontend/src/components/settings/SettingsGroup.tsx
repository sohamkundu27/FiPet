import { FlatList, ListRenderItem, View, StyleSheet, GestureResponderEvent, TouchableHighlight } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { ThemeWrapper } from "../ui/ThemedWrapper";
import { Divider } from '@rneui/themed';
import { OpaqueColorValue } from "react-native/Libraries/StyleSheet/StyleSheet";
import { IconSymbol } from "../ui/IconSymbol";

export type SettingsGroupProps = {
  groupName: string
  settings: SettingsGroupItem[]
};

export type SettingsGroupItem = {
  title: string,
  subtitle?: string,
  icon?: (size: number) => React.ReactElement,
  action: (evt: GestureResponderEvent) => void,
  color?: string | OpaqueColorValue | undefined,
};

export default function SettingsGroup({ groupName, settings }: SettingsGroupProps) {

  const ICON_SIZE = 24;
  const TITLE_WIDTH = "70%";

  const renderSettingsItem: ListRenderItem<SettingsGroupItem> = ({item}) => {
    return (
      <TouchableHighlight style={{borderRadius: styles.itemContainer.borderRadius}} underlayColor="#FFF1CC" onPress={item.action}>
        <View style={styles.itemContainer}>
          {item.icon && (
            <View>
              {item.icon(ICON_SIZE)}
            </View>
          )}
          <View style={{width: TITLE_WIDTH, display: "flex", flexDirection: "column"}}>
            {item.color ? (
              <ThemedText lightColor={item.color} darkColor={item.color}>{item.title}</ThemedText>
            ) : (
              <ThemedText style={item.subtitle && {marginBottom: 0, lineHeight: 18}} lightColor="#000" darkColor="#FFF">{item.title}</ThemedText>
            )}
            {item.subtitle && (
              <ThemedText style={{fontSize: 14, lineHeight: 14}} lightColor="#888" darkColor="#AAA">{item.subtitle}</ThemedText>
            )}
          </View>
          <ThemeWrapper
            lightColor="#CEA022"
            darkColor="#CEA022"
            colorName="icon"
          >
          {(color) => <IconSymbol color={color} name="chevron.right"/>}
          </ThemeWrapper>
        </View>
      </TouchableHighlight>
    );
  };

  function separator() {
    return (
      <Divider color="#EDD287" width={2}/>
    );
  }

  return (
    <View style={styles.containerSpacing}>
      <ThemedText style={{paddingLeft: 10}}>{groupName}</ThemedText>
      <ThemedView style={styles.container}>
        <FlatList 
          data={settings}
          scrollEnabled={false}
          renderItem={renderSettingsItem}
          ItemSeparatorComponent={separator}
        />
      </ThemedView>
    </View>
  );
}

const CONTAINER_BORDER_RADIUS = 10;
const styles = StyleSheet.create({
  containerSpacing: {
    padding: 5,
    width: "100%",
  },
  container: {
    width: "100%",
    backgroundColor: "#ffe9ab",
    borderRadius: CONTAINER_BORDER_RADIUS,
  },
  itemContainer: {
    padding: 10,
    borderRadius: CONTAINER_BORDER_RADIUS,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "space-between",
    gap: 3,
  }
});
