import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/colors';

const Button = ({ title, onPress, variant = 'primary', style }) => {
  if (variant === 'primary') {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={style}>
        <LinearGradient
          colors={[Colors.pink, Colors.rose]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.secondary, style]}
      >
        <Text style={styles.secondaryText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  // outline
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.outline, style]}
    >
      <Text style={styles.outlineText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primary: {
    height: 52,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondary: {
    height: 52,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.pink,
  },
  secondaryText: {
    color: Colors.pink,
    fontSize: 16,
    fontWeight: '700',
  },
  outline: {
    height: 52,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.pink,
  },
  outlineText: {
    color: Colors.pink,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default Button;
