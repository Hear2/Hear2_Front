import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import colors from '../../constants/colors';

const RECENT_SEARCHES = [
  '서울숲 데이트',
  '8개월 기념일',
  '엄마 생일',
  '요가 클래스',
  '회식',
  '해운대 여행',
  '브런치 카페',
  '결혼식',
];

const Icon = ({ name, size = 20, color = colors.ink }) => {
  const props = { stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  if (name === 'back') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path {...props} d="M15 18L9 12L15 6" />
      </Svg>
    );
  }
  if (name === 'search') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path {...props} d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3" />
      </Svg>
    );
  }
  if (name === 'close') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path {...props} d="M18 6L6 18M6 6l12 12" />
      </Svg>
    );
  }
  if (name === 'clock') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path {...props} d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2" />
      </Svg>
    );
  }
  return null;
};

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState(RECENT_SEARCHES);

  const removeRecent = (term) => {
    setRecents((prev) => prev.filter((t) => t !== term));
  };

  const clearAll = () => setRecents([]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          hitSlop={10}
          style={styles.backBtn}
        >
          <Icon name="back" size={24} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Icon name="search" size={18} color={colors.inkMute} />
          <TextInput
            style={styles.input}
            placeholder="검색"
            placeholderTextColor={colors.inkMute}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Icon name="close" size={16} color={colors.inkMute} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 검색</Text>
          {recents.length > 0 && (
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.clearAll}>전체 삭제</Text>
            </TouchableOpacity>
          )}
        </View>

        {recents.length === 0 ? (
          <Text style={styles.emptyText}>최근 검색 기록이 없어요</Text>
        ) : (
          recents.map((term) => (
            <TouchableOpacity
              key={term}
              style={styles.recentRow}
              onPress={() => setQuery(term)}
              activeOpacity={0.6}
            >
              <Icon name="clock" size={16} color={colors.inkMute} />
              <Text style={styles.recentText}>{term}</Text>
              <TouchableOpacity onPress={() => removeRecent(term)} hitSlop={10}>
                <Icon name="close" size={14} color={colors.inkMute} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 4,
    marginRight: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  clearAll: {
    fontSize: 12,
    color: colors.inkMute,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recentText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colors.ink2,
  },
  emptyText: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 13,
    color: colors.inkMute,
  },
});
