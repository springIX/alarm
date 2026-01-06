import React, { useEffect, useRef } from 'react';
import {StyleSheet, Animated, Pressable } from 'react-native';

const Toggle = ({ style, onPress, value, circleStyle }) => {
    const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: value ? 1 : 0,
            duration: 300,
            useNativeDriver: false, 
        }).start();
    }, [value]);

    const toggleLeft = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 35],
    });

    const toggleBg = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#17181C', '#0000001A'],
    });

    const toggleCircleBg = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#FFFFFF1A', '#FFFFFF66'],
    });

    return  <Pressable 
                onPress={onPress}
                style={[styles.toggleButton]}
            >
            <Animated.View style={[styles.activeToggle, { backgroundColor: toggleBg }, style]}>
                <Animated.View
                    style={[
                        styles.toggleCircle,
                        {
                            left: toggleLeft,
                            backgroundColor: toggleCircleBg,
                        },
                        circleStyle
                    ]}
                />
            </Animated.View>
        </Pressable>
};

const styles = StyleSheet.create({
    activeToggle: {
        position: "relative",
        width: 73,
        height: 40,
        padding: 2,
        borderRadius: 9999,
    },
    toggleCircle : {
        position: "absolute",
        top: 2,
        width: 36,
        borderRadius: 9999,
        aspectRatio: 1/1,
    }
});

export default Toggle;