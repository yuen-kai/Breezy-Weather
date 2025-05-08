import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  View,
  Platform,
  UIManager,
} from "react-native";
import { IconButton } from "react-native-paper";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  interpolate,
  withSpring,
  measure,
  runOnUI,
  useAnimatedRef,
} from "react-native-reanimated";

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ExpandableContentProps {
  children: React.ReactNode;
  initialExpanded?: boolean;
  animationDuration?: number;
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

const AnimatedIconButton = Animated.createAnimatedComponent(IconButton);

export const ExpandableContent: React.FC<ExpandableContentProps> = ({
  children,
  initialExpanded = false,
  animationDuration = 300,
  springConfig = {
    damping: 12,
    stiffness: 100,
    mass: 1,
  },
}) => {
  const [expanded, setExpanded] = useState<boolean>(initialExpanded);
  const expandAnimation = useSharedValue(initialExpanded ? 1 : 0);
  const heightValue = useSharedValue(0);
  const opacityValue = useSharedValue(0);
  const animatedContentRef = useAnimatedRef<Animated.View>();
  const expandAnimationConfig = {
    damping: springConfig.damping,
    stiffness: springConfig.stiffness,
    mass: springConfig.mass,
    overshootClamping: false,
  };
  // Measure content height when component mounts or children change
  useEffect(() => {
    if (expanded) {
      runOnUI(() => {
        "worklet";
        try {
          const measured = measure(animatedContentRef);
          if (measured) {
            heightValue.value = withSpring(measured.height, expandAnimationConfig);
          }
        } catch (e) {
          console.log("Measurement failed", e);
        }
      })();
    }
  }, [expanded, children]);

  const toggleExpand = () => {
    // Measure content before toggling if we're expanding
    if (!expanded) {
      try {
        const measured = measure(animatedContentRef);
        if (measured) {
          heightValue.value = withSpring(measured.height, expandAnimationConfig);
        }
      } catch (e) {
        console.log("Measurement failed", e);
      }
    } else {
      heightValue.value = withSpring(0, expandAnimationConfig);
    }

    opacityValue.value = withTiming(!expanded ? 1 : 0, {
      duration: animationDuration,
      easing: Easing.inOut(Easing.ease),
    });
    // Animate rotation
    expandAnimation.value = withSpring(!expanded ? 0 : 1, expandAnimationConfig);
    // Toggle expanded state
    setExpanded(!expanded);
  };

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
    opacity: opacityValue.value,
    overflow: "hidden",
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(expandAnimation.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  return (
    <View>
      <Animated.View style={[styles.expandableContent, contentAnimatedStyle]}>
        <Animated.View ref={animatedContentRef} style={styles.measuredContent}>
          {children}
        </Animated.View>
      </Animated.View>

      <TouchableOpacity onPress={toggleExpand} style={styles.expandButton} activeOpacity={0.7}>
        <Animated.View style={iconAnimatedStyle}>
          <IconButton icon="chevron-down" size={24} mode="contained-tonal" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  expandableContent: {
    marginTop: 8,
  },
  measuredContent: {
    position: "absolute",
    width: "100%",
  },
  expandButton: {
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 8,
  },
});

export default ExpandableContent;
