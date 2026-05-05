import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Colors from '../../constants/colors';

const Loading = ({ color = Colors.pink }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Loading;
