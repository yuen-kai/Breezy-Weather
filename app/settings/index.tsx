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


const SettingsScreen = () => {

  const theme = useTheme();
  const {
    unit,
    darkMode,
    cutoffs, 
    clothingItems,
    setUnit,
    setDarkMode,
    setCutoffs, 
    setClothingItems
  } = useSettingsStore();

  const [newClothingName, setNewClothingName] = useState('');
  const [tempRangeLow, setTempRangeLow] = useState('');
  const [tempRangeHigh, setTempRangeHigh] = useState('');
  const [image, setImage] = useState<string>('');

  async function saveUnit(value: UnitType) {
    try {
      await AsyncStorage.setItem('unit', JSON.stringify(value));
    } catch (e) {
      console.error("Error saving unit", e);
    }
  }
  
  async function saveTheme(value: boolean) {
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(value));
    } catch (e) {
      console.error("Error saving theme", e);
    }
  }

  async function saveCutoffs() {
    try {
      await AsyncStorage.setItem('cutoffs', JSON.stringify(cutoffs));
    } catch (e) {
      console.error("Error saving cutoffs", e);
    }
  };

  async function saveClothingItems(value: ClothingItem[]) {
    try {
      await AsyncStorage.setItem('clothing', JSON.stringify(value));
    } catch (e) {
      console.error("Error saving clothing items", e);
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
    }]
    setClothingItems(newClothingItems);
    saveClothingItems(newClothingItems);
    setNewClothingName('');
    setTempRangeLow('');
    setTempRangeHigh('');
  };

  function removeClothingItem(name: string) {
    setClothingItems(clothingItems.filter((item) => item.name !== name));
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
          <Switch value={darkMode} onValueChange={(value) => {setDarkMode(value); saveTheme(value)}} />
        </View>

        <Divider style={styles.divider} />

        {/* Unit */}
        <Text variant="bodyLarge">Units</Text>
        <RadioButton.Group onValueChange={(value) => {setUnit(value as UnitType);saveUnit(value as UnitType)}} value={unit}>
          <RadioButton.Item label="Imperial (F)" value="imperial" />
          <RadioButton.Item label="Metric (C)" value="metric" />
        </RadioButton.Group>
        <Divider style={styles.divider} />

        {/* Edit Cutoffs */}
        <Text variant="bodyLarge">Upper Limit Cutoffs</Text>
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
                  onEndEditing={()=>saveCutoffs}
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
          Clothing Items
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
          <TouchableOpacity onPress={pickImage}>
            <Image source={{ uri: image }} style={{ height: 120, aspectRatio: 1, margin: 16, backgroundColor: theme.colors.elevation.level2 }} />
          </TouchableOpacity>
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
