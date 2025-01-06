import * as React from 'react';
import {
  Animated,
  GestureResponderHandlers,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  useComponentSize,
  useKeyboardDimensions,
  usePanResponder,
} from './hooks';

interface Props {
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  contentOffsetKeyboardClosed?: number;
  contentOffsetKeyboardOpened?: number;
  renderBackground?: () => React.ReactNode;
  renderScrollable: (panHandlers: GestureResponderHandlers) => React.ReactNode;
  scrollableContainerStyle?: StyleProp<ViewStyle>;
  spaceBetweenKeyboardAndAccessoryView?: number;
  style?: StyleProp<ViewStyle>;
  useListenersOnAndroid?: boolean;
}

export const KeyboardAccessoryView = React.memo(
  ({
    children,
    contentContainerStyle,
    contentOffsetKeyboardClosed,
    contentOffsetKeyboardOpened,
    renderBackground,
    renderScrollable,
    scrollableContainerStyle,
    spaceBetweenKeyboardAndAccessoryView,
    style,
    useListenersOnAndroid,
  }: Props) => {
    const {onLayout, size} = useComponentSize();
    const {keyboardHeight, keyboardVisible} = useKeyboardDimensions(
      useListenersOnAndroid,
    );
    const {panHandlers, positionY} = usePanResponder();
    const {bottom, left, right} = useSafeAreaInsets();

    // Calculate translateY for the accessory view, ensures that the accessory view is positioned right above the keyboard
      const translateY = React.useMemo(() => {
        if (!keyboardVisible) return 0;
          const offset = keyboardHeight + (spaceBetweenKeyboardAndAccessoryView ?? 0);
          return -offset;
       }, [keyboardHeight, keyboardVisible, spaceBetweenKeyboardAndAccessoryView])


    const offset =
      size.height +
      (keyboardHeight > 0
        ? (contentOffsetKeyboardOpened ?? 0) - bottom
        : contentOffsetKeyboardClosed ?? 0);

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : undefined}
      >
        <Animated.View
          style={[
            // eslint-disable-next-line react-native/no-inline-styles
            {
              flex: 1,
              paddingBottom: offset, // Remove delta Y
            },
            scrollableContainerStyle,
          ]}>
          {renderScrollable(panHandlers)}
        </Animated.View>
        <Animated.View
          style={[
            {
              transform: [{ translateY }],
            },
            styles.container,
            style,
          ]}
          testID="container">
          {renderBackground?.()}
          <View
            onLayout={onLayout}
            style={[
              styles.contentContainer,
              // eslint-disable-next-line react-native/no-inline-styles
              {
                marginBottom: keyboardHeight > 0 ? 0 : bottom,
                marginLeft: left,
                marginRight: right,
              },
              contentContainerStyle,
            ]}>
            {children}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  contentContainer: {
    flex: 1,
  },
});