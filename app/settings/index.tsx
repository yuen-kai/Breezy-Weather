// app/settings/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Switch,
  RadioButton,
  TextInput,
  Button,
  Divider,
} from 'react-native-paper';
import useSettingsStore from '../store/settingsStore';

const SettingsScreen = () => {
  const {
    scale,
    unit,
    darkMode,
    setScale,
    setUnit,
    toggleDarkMode,
    clothingItems,
    addClothingItem,
    removeClothingItem,
  } = useSettingsStore();

  const [newClothingName, setNewClothingName] = useState('');
  const [tempRangeLow, setTempRangeLow] = useState('');
  const [tempRangeHigh, setTempRangeHigh] = useState('');

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
    <View style={styles.container}>
      <Text variant="titleLarge">Settings</Text>

      <Divider style={styles.divider} />

      {/* Toggle dark mode */}
      <View style={styles.row}>
        <Text variant="bodyLarge">Dark Mode</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      <Divider style={styles.divider} />

      {/* Scale */}
      <Text variant="bodyLarge">Weather Scale</Text>
      <RadioButton.Group onValueChange={(value) => setScale(value as any)} value={scale}>
        <View style={styles.row}>
          <RadioButton value="1-3" />
          <Text variant="bodyMedium">1-3 Scale</Text>
        </View>
        <View style={styles.row}>
          <RadioButton value="1-5" />
          <Text variant="bodyMedium">1-5 Scale</Text>
        </View>
      </RadioButton.Group>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
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
