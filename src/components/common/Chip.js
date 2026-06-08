import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/colors';

const VARIANT_STYLES = {
  pink: { bg: Colors.pinkTint, text: Colors.pink },
  green: { bg: Colors.greenTint, text: Colors.green },
  yellow: { bg: Colors.yellowTint, text: Colors.yellow },
  blue: { bg: Colors.blueTint, text: Colors.blue },
  gray: { bg: Colors.bgInput, text: Colors.ink3 },
  outline: { bg: 'transparent', text: Colors.ink3, border: Colors.line },
};

const Chip = ({ label, variant = 'pink', style }) => {
  const v = VARIANT_STYLES[variant] || VARIANT_STYLES.pink;

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: v.bg },
        v.border ? { borderWidth: 1, borderColor: v.border } : null,
        style,
      ]}
    >
      <Text style={[styles.label, { color: v.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 11,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default Chip;
