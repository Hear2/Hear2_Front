import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/home/HomeScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import AlbumScreen from '../screens/memory/AlbumScreen';
import SharedCalendar from '../screens/share/SharedCalendar';
import MoreScreen from '../screens/home/MoreScreen';

const PINK = '#FF6B9D';
const PINK_TINT = '#FDF0F5';
const INK_MUTE = '#AAAAAA';

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={styles.iconEmoji}>{emoji}</Text>
    </View>
  );
}

function HeartIcon({ focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={[styles.heartIcon, focused && styles.heartIconActive]}>
        ♥
      </Text>
    </View>
  );
}

const TAB_CONTENT_HEIGHT = 64;
const MIN_BOTTOM_PADDING = Platform.OS === 'ios' ? 8 : 10;

export default function BottomTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, MIN_BOTTOM_PADDING);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: TAB_CONTENT_HEIGHT + bottomPad,
            paddingBottom: bottomPad,
          },
        ],
        tabBarItemStyle: styles.tabItem,
        tabBarActiveTintColor: PINK,
        tabBarInactiveTintColor: INK_MUTE,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="홈"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="채팅"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="💬" focused={focused} />,
          // 키보드가 뜨면 탭바를 자동으로 숨겨서, 입력 바가 키보드 바로 위에 붙도록 한다.
          tabBarHideOnKeyboard: true,
        }}
      />
      <Tab.Screen
        name="앨범"
        component={AlbumScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📷" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="캘린더"
        component={SharedCalendar}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="하트"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ focused }) => <HeartIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopColor: '#E0E0E0',
    borderTopWidth: 1,
    paddingTop: 6,
    backgroundColor: '#FFFFFF',
  },
  tabItem: {
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrap: {
    width: 56,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: PINK_TINT,
  },
  iconEmoji: {
    fontSize: 20,
  },
  heartIcon: {
    fontSize: 20,
    color: INK_MUTE,
  },
  heartIconActive: {
    color: PINK,
  },
});
