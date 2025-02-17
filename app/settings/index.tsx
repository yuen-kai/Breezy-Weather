// app/settings/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
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
import useSettingsStore from '../../store/settingsStore';
import { Link, router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {

  const theme = useTheme();
  const {
    scale,
    unit,
    darkMode,
    setUnit,
    toggleDarkMode,
    clothingItems,
    addClothingItem,
    removeClothingItem,
  } = useSettingsStore();

  const [newClothingName, setNewClothingName] = useState('');
  const [tempRangeLow, setTempRangeLow] = useState('');
  const [tempRangeHigh, setTempRangeHigh] = useState('');
  const [cutoffs, setCutoffs] = useState(
    {
      "Temp": [15, 30, 45, 60, 999],
      "Wind": [8, 16, 999],
      "Precip Prob": [20, 50, 999],
      "Precip Inches": [0.1, 0.3, 999],
      "Humidity": [50, 70, 999],
      "Uv": [2, 5, 999],
      "Visibility": [1, 3, 999],
      "Cloud Cover": [20, 50, 999]
    }
  )

  async function saveCutoffs() {
    try {
      await AsyncStorage.setItem('cutoffs', JSON.stringify(cutoffs));
    } catch (e) {
      console.error("Error saving settings", e);
    }
  };

  // AsyncStorage.setItem('theme', JSON.stringify(darkMode));
  // AsyncStorage.setItem('unit', JSON.stringify(unit));
  // AsyncStorage.setItem('clothing', JSON.stringify(clothingItems));


  const handleAddClothing = () => {
    if (!newClothingName || !tempRangeLow || !tempRangeHigh) return;
    addClothingItem({
      id: newClothingName.toLowerCase().replace(/\s/g, '-'),
      name: newClothingName,
      temperatureRange: [Number(tempRangeLow), Number(tempRangeHigh)],
    });
    setNewClothingName('');
    setTempRangeLow('');
    setTempRangeHigh('');
  };

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
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>

        <Divider style={styles.divider} />

        {/* Unit */}
        <Text variant="bodyLarge">Units</Text>
        <RadioButton.Group onValueChange={(value) => setUnit(value as any)} value={unit}>
          <View style={styles.row}>
            <RadioButton value="imperial" />
            <Text variant="bodyMedium">Imperial (F)</Text>
          </View>
          <View style={styles.row}>
            <RadioButton value="metric" />
            <Text variant="bodyMedium">Metric (C)</Text>
          </View>
        </RadioButton.Group>
        <Divider style={styles.divider} />

        {/* Edit Cutoffs */}
        <Text variant="bodyLarge">Upper Limit Cutoffs</Text>
        {Object.entries(cutoffs).map(([key, values]) => (
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
                  onEndEditing={saveCutoffs}
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
          <View key={item.id} style={styles.row}>
            <Text variant="bodyMedium">
              {item.name} ({item.temperatureRange[0]} - {item.temperatureRange[1]})
            </Text>
            <Button onPress={() => removeClothingItem(item.id)}>Remove</Button>
          </View>
        ))}

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
