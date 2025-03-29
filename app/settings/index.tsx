// app/settings/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Text,
  Switch,
  RadioButton,
  TextInput,
  Button,
  Appbar,
  Card,
  IconButton,
  Snackbar,
  Portal
} from 'react-native-paper';
import { useAppTheme } from "@/theme";
import useSettingsStore, { UnitType } from '../../store/settingsStore';
import { Link, router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cutoffs, defaultCutoffs } from '@/types/cutoffs';
import { ClothingItem, defaultClothingItems } from '@/types/clothing';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { TimeOfDaySetting } from '@/types/timeOfDay';
import * as Linking from 'expo-linking';


const SettingsScreen = () => {

  const theme = useAppTheme();
  const {
    timeOfDaySettings,
    unit,
    darkMode,
    cutoffs,
    clothingItems,
    setTimeOfDaySettings,
    setUnit,
    setDarkMode,
    setCutoffs,
    setClothingItems
  } = useSettingsStore();

  const [newClothingName, setNewClothingName] = useState('');
  const [tempRangeLow, setTempRangeLow] = useState('');
  const [tempRangeHigh, setTempRangeHigh] = useState('');

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [undoIndex, setUndoIndex] = useState(-1);

  const [image, setImage] = useState<string>('');
  const [tint, setTint] = useState(false);

  async function saveSettings(settingType: 'unit' | 'darkMode' | 'cutoffs' | 'timeOfDaySettings' | 'clothing', value?: any) {
    try {
      const stateMap = {
        'unit': unit,
        'darkMode': darkMode,
        'cutoffs': cutoffs,
        'timeOfDaySettings': timeOfDaySettings,
        'clothing': clothingItems
      };

      await AsyncStorage.setItem(settingType, JSON.stringify(value ?? stateMap[settingType]));
    } catch (e) {
      console.error(`Error saving ${settingType}`, e);
    }
  }


  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      selectionLimit: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  async function editImage(index: number) {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      selectionLimit: 1,
    });

    if (!result.canceled) {
      const newClothingItems = [...clothingItems];
      newClothingItems[index].image = result.assets[0].uri;
      setClothingItems(newClothingItems);
      saveSettings('clothing', newClothingItems);
    }
  }

  function toggleTint(index: number) {
    const newClothingItems = [...clothingItems];
    newClothingItems[index].tint = !newClothingItems[index].tint;
    setClothingItems(newClothingItems);
    setUndoIndex(index);
    setSnackbarVisible(true);
    saveSettings('clothing', newClothingItems);
  }

  function handleAddClothing() {
    if (!newClothingName || !tempRangeLow || !tempRangeHigh) return;
    let newClothingItems: ClothingItem[] = [...clothingItems, {
      name: newClothingName,
      temperatureRange: [Number(tempRangeLow), Number(tempRangeHigh)],
      image: image,
      tint: tint
    }]
    newClothingItems.sort((a, b) => a.temperatureRange[1] - b.temperatureRange[1]);
    setClothingItems(newClothingItems);
    saveSettings('clothing', newClothingItems);

    setImage('');
    setNewClothingName('');
    setTempRangeLow('');
    setTempRangeHigh('');
    setTint(false);
  };

  function removeClothingItem(name: string) {
    let newClothingItems = clothingItems.filter((item) => item.name !== name)
    setClothingItems(newClothingItems);
    saveSettings('clothing', newClothingItems);
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    card: {
      marginBottom: 16,
      padding: 16,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 16,
    },
    divider: {
      marginVertical: 16,
    },
    clothingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginBottom: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.elevation.level2,
      elevation: 2,
    },

    clothingImage: {
      width: 64,
      height: 64,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: theme.colors.elevation.level1,
    },
    clothingText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    temperatureInput: {
      width: 60,
      marginHorizontal: 4,
    },
    removeButton: {
      marginLeft: 8,
    },
    input: {
      marginVertical: 8,
    },
    cutoffsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
        <Appbar.Action icon="home" onPress={() => router.push("/")} />
      </Appbar.Header>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.row}>
            <Text variant="bodyLarge">Dark Mode</Text>
            <Switch value={darkMode} onValueChange={(value) => { setDarkMode(value); saveSettings('darkMode', value) }} />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text variant="bodyLarge" style={styles.sectionTitle}>Units</Text>
          <RadioButton.Group onValueChange={(value) => { setUnit(value as UnitType); saveSettings('unit', value as UnitType) }} value={unit}>
            <RadioButton.Item label="Imperial (F)" value="imperial" />
            <RadioButton.Item label="Metric (C)" value="metric" />
          </RadioButton.Group>
        </Card>

        <Card style={styles.card}>
          <Text variant="bodyLarge" style={styles.sectionTitle}>Time of Day Settings</Text>
          {timeOfDaySettings.map((setting, index) => (
            <View key={index} style={styles.row}>
              <Text variant="bodyMedium" style={{ flex: 1 }}>{setting.displayName}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text variant="bodyLarge" style={{ marginRight: 8 }}>
                  {index === 0 ? '0' : isNaN(setting.start) ? '' : setting.start.toString()}
                </Text>
                <Text variant="bodyLarge" style={{ marginHorizontal: 4 }}>to </Text>
                {index === timeOfDaySettings.length - 1 ? (
                  <Text variant="bodyLarge" style={{ marginLeft: 8 }}>24</Text>
                ) : (
                  <TextInput
                    style={{ textAlign: 'center' }}
                    value={isNaN(setting.end) ? '' : setting.end.toString()}
                    onChangeText={(text) => {
                      const newEnd = parseInt(text);
                      const newSettings = [...timeOfDaySettings];
                      newSettings[index] = { ...setting, end: newEnd };
                      if (index < newSettings.length - 1) {
                        newSettings[index + 1] = { ...newSettings[index + 1], start: newEnd };
                      }
                      setTimeOfDaySettings(newSettings);
                    }}
                    onEndEditing={() => saveSettings('timeOfDaySettings')}
                    keyboardType="numeric"
                  />
                )}
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text variant="bodyLarge" style={styles.sectionTitle}>Upper Limit Cutoffs (Imperial)</Text>
          {Object.entries(cutoffs).map(([key, values]: [string, number[]]) => (
            <View key={key} style={styles.cutoffsRow}>
              <Text variant="bodyMedium" style={{ flex: 1 }}>
                {key}
              </Text>
              <View style={{ flexDirection: 'row', flex: 3 }}>
                {values.map((value, i) => (
                  <TextInput
                    key={i}
                    value={isNaN(value) ? "" : value.toString()}
                    onChangeText={(text) => {
                      const newValues = [...values];
                      newValues[i] = parseInt(text);
                      setCutoffs({ ...cutoffs, [key]: newValues });
                    }}
                    onEndEditing={() => saveSettings('cutoffs')}
                    mode="outlined"
                    keyboardType="numeric"
                    style={{ flex: 1, marginHorizontal: 4 }}
                  />))}
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.card}>
          <Text variant="bodyLarge" style={styles.sectionTitle}>Clothing Items (Temp in °F)</Text>
          {clothingItems.map((item, index) => (
            <View key={item.name} style={styles.clothingItem}>
              {item.image && (
                <TouchableOpacity onPress={() => editImage(index)} onLongPress={() => toggleTint(index)}>
                  <Image
                    source={item.image}
                    style={[styles.clothingImage, item.tint && { tintColor: theme.colors.onBackground }]}
                  />
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.clothingText}>{item.name}</Text>
                <View style={{ flexDirection: 'row', marginTop: 4 }}>
                  <TextInput
                    value={isNaN(item.temperatureRange[0]) ? "" : item.temperatureRange[0].toString()}
                    onChangeText={(text) => {
                      const newItems = [...clothingItems];
                      newItems[index].temperatureRange[0] = parseInt(text);
                      setClothingItems(newItems);
                    }}
                    keyboardType="numeric"
                    style={styles.temperatureInput}
                    mode="outlined"
                    label="Low"
                  />
                  <Text style={{ marginHorizontal: 4, alignSelf: 'center' }}>-</Text>
                  <TextInput
                    value={isNaN(item.temperatureRange[1]) ? "" : item.temperatureRange[1].toString()}
                    onChangeText={(text) => {
                      const newItems = [...clothingItems];
                      newItems[index].temperatureRange[1] = parseInt(text);
                      setClothingItems(newItems);
                    }}
                    keyboardType="numeric"
                    style={styles.temperatureInput}
                    mode="outlined"
                    label="High"
                  />
                </View>
              </View>
              <IconButton
                icon="delete"
                onPress={() => removeClothingItem(item.name)}
                style={styles.removeButton}
                iconColor={theme.colors.error}
              />
            </View>
          ))}
          <Portal>
            <Snackbar
              visible={snackbarVisible}
              onDismiss={() => setSnackbarVisible(false)}
              action={{
                label: 'Undo',
                onPress: () => toggleTint(undoIndex),
              }}
              duration={3000}
            >
              Clothing item tint changed
            </Snackbar>
          </Portal>

          {/* New Clothing */}
          <View style={styles.row}>
            <View>
              <TouchableOpacity
                onPress={pickImage}
                style={{ alignItems: 'center' }}
              >
                {image ? (
                  <Image
                    source={image}
                    style={{
                      height: 120,
                      aspectRatio: 1,
                      marginHorizontal: 16,
                      marginTop: 16,
                      backgroundColor: theme.colors.elevation.level2,
                      tintColor: tint ? theme.colors.onBackground : undefined
                    }}
                  />
                ) : (
                  <View style={{
                    height: 120,
                    aspectRatio: 1,
                    marginHorizontal: 16,
                    marginTop: 16,
                    backgroundColor: theme.colors.elevation.level2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderStyle: 'dashed',
                    borderWidth: 1,
                    borderColor: theme.colors.outline
                  }}>
                    <IconButton
                      icon="plus"
                      size={40}
                      iconColor={theme.colors.outline}
                    />
                  </View>
                )}
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: "center" }}>
                <Text variant="bodyLarge">Tint</Text>
                <Switch value={tint} onValueChange={setTint} />
              </View>
            </View>
            <View style={{ flex: 4 }}>
              <TextInput
                label="Clothing Name"
                value={newClothingName}
                onChangeText={setNewClothingName}
                mode="outlined"
                style={styles.input}
              />
              <View style={[styles.row, { paddingVertical: 0 }]}>
                <TextInput
                  label="Low"
                  value={tempRangeLow}
                  onChangeText={setTempRangeLow}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, { flex: 1, marginRight: 4 }]}
                />
                <TextInput
                  label="High"
                  value={tempRangeHigh}
                  onChangeText={setTempRangeHigh}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, { flex: 1, marginLeft: 4 }]}
                />
              </View>
            </View>
          </View>
          <Button mode="contained" onPress={handleAddClothing}>
            Add Clothing
          </Button>
        </Card>

        <Card style={styles.card}>
          <Text variant="bodyLarge" style={styles.sectionTitle}>Credits</Text>
          <Card.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
              Weather data provided by WeatherAPI.com
            </Text>

            <Text variant="bodyMedium" style={{ marginBottom: 8, fontWeight: 'bold' }}>
              Clothing icons:
            </Text>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://www.flaticon.com/free-icons/coat')}
              style={{ marginVertical: 6 }}
            >
              <Text variant="bodySmall" style={{ color: theme.colors.primary, textDecorationLine: 'underline' }}>
                Coat icons created by Freepik - Flaticon
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://www.flaticon.com/free-icons/hoodie')}
              style={{ marginVertical: 6 }}
            >
              <Text variant="bodySmall" style={{ color: theme.colors.primary, textDecorationLine: 'underline' }}>
                Hoodie icons created by iconixar - Flaticon
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://www.flaticon.com/free-icons/tshirt')}
              style={{ marginVertical: 6 }}
            >
              <Text variant="bodySmall" style={{ color: theme.colors.primary, textDecorationLine: 'underline' }}>
                Tshirt icons created by Good Ware - Flaticon
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
