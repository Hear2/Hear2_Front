import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function CharacterWidget({ icon, label, tint, color, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: tint || colors.pinkTint }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.label, color ? { color } : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.bgApp,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line2,
    paddingVertical: 14,
    paddingHorizontal: 10,
    minWidth: 80,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: { fontSize: 22 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink2,
    textAlign: 'center',
  },
});
