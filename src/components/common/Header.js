import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Colors from '../../constants/colors';

const BackArrow = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={Colors.ink}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Header = ({ title, showBack = false, onBack, right, style }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }, style]}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={8}>
            <BackArrow />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.right}>
        {right || <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.bgApp,
  },
  left: {
    width: 72,
    alignItems: 'flex-start',
  },
  right: {
    width: 72,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 24,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: Colors.ink,
  },
});

export default Header;
