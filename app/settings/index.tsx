// app/settings/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Text,
  Switch,
  RadioButton,
  TextInput,
  Button,
  Divider,
  useTheme,
  Appbar,
} from 'react-native-paper';
import useSettingsStore, { UnitType } from '../../store/settingsStore';
import { Link, router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cutoffs, defaultCutoffs } from '@/types/cutoffs';
import { ClothingItem, defaultClothingItems } from '@/types/clothing';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { TimeOfDaySetting } from '@/types/timeOfDay';


const SettingsScreen = () => {

  const theme = useTheme();
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
        <Appbar.Action icon="home" onPress={() => router.push("/")} />
      </Appbar.Header>

      <Divider style={styles.divider} />
      <ScrollView style={{ flex: 1, margin: 16 }} showsVerticalScrollIndicator={false}>
        {/* Toggle dark mode */}
        <View style={styles.row}>
          <Text variant="bodyLarge">Dark Mode</Text>
          <Switch value={darkMode} onValueChange={(value) => { setDarkMode(value); saveSettings('darkMode', value) }} />
        </View>

        <Divider style={styles.divider} />

        {/* Unit */}
        <Text variant="bodyLarge">Units</Text>
        <RadioButton.Group onValueChange={(value) => { setUnit(value as UnitType); saveSettings('unit', value as UnitType) }} value={unit}>
          <RadioButton.Item label="Imperial (F)" value="imperial" />
          <RadioButton.Item label="Metric (C)" value="metric" />
        </RadioButton.Group>
        <Divider style={styles.divider} />

        {/* Time of Day Settings */}
        <Text variant="bodyLarge">Time of Day Settings</Text>
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
        <Divider style={styles.divider} />

        {/* Edit Cutoffs */}
        <Text variant="bodyLarge">Upper Limit Cutoffs (Imperial)</Text>
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

        <Divider style={styles.divider} />

        {/* Clothing Items */}
        <Text variant="bodyLarge" style={styles.sectionTitle}>
          Clothing Items (Temp in °F)
        </Text>
        {clothingItems.map((item) => (
          <View key={item.name} style={styles.row}>
            <Text variant="bodyMedium">
              {item.name} ({item.temperatureRange[0]} - {item.temperatureRange[1]})
            </Text>
            <Button onPress={() => removeClothingItem(item.name)}>Remove</Button>
          </View>
        ))}
        <View style={styles.row}>
          <View>
            <TouchableOpacity onPress={pickImage}>
              <Image source={{ uri: image }} style={{ height: 120, aspectRatio: 1, marginHorizontal: 16, marginTop: 16, backgroundColor: theme.colors.elevation.level2, tintColor: tint ? theme.colors.onBackground : undefined }} />
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
            <View style={[styles.row, { justifyContent: 'space-between' }]}>
              <TextInput
                label="Low Temp"
                value={tempRangeLow}
                onChangeText={setTempRangeLow}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, { flex: 1, marginRight: 4 }]}
              />
              <TextInput
                label="High Temp"
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cutoffsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  divider: {
    marginVertical: 8,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    marginVertical: 4,
  },
});

export default SettingsScreen;
