import React, { useEffect, useRef } from 'react';
import {
    StyleSheet,
    Animated,
    View,
    PanResponder,
    Dimensions,
    Text,
    TouchableOpacity,
    Pressable,
    TouchableWithoutFeedback
} from 'react-native';
import PoppinsText from './poppins_text.jsx';
import Toggle from "./toggle.jsx";

    const MAX_SLIDE = -100; 

function AlarmBox({ schedule, onToggle, opacity, onDelete, onEdit, onGestureStart, onGestureEnd, index, setSlideStatus}) {
    const anim = useRef(new Animated.Value(schedule.enable ? 1 : 0)).current;
    const pan = useRef(new Animated.ValueXY()).current;
    const panOffsetRef = useRef({ x: 0, y: 0 });

    // PanResponder 정의
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10){
                return true
            }
        },
        onPanResponderGrant: () => {
            pan.setOffset(panOffsetRef.current); // 이전 위치 적용
            pan.setValue({ x: 0, y: 0 }); // 현재 제스처 시작값 초기화
            onGestureStart?.();
        },
        onPanResponderMove: Animated.event(
            [null, { dx: pan.x }],
            { useNativeDriver: false }
        ),
        onPanResponderRelease: (_, gestureState) => {
            const dx = gestureState.dx;
            const finalX = panOffsetRef.current.x + dx;
            const setPanOffset = (x) => {
                panOffsetRef.current = { x, y: 0 };
                pan.setOffset(panOffsetRef.current);
                pan.setValue({ x: 0, y: 0 });
            };

            if ( finalX == MAX_SLIDE ) {
                setPanOffset(MAX_SLIDE);
                pan.setValue({ x: 0, y: 0 }); 
            } else if (finalX < -50) {
                //슬라이드를 왼쪽으로 50이상 했을 때
                
                if (panOffsetRef.current.x <= MAX_SLIDE) {
                    //슬라이드 하기 전에 슬라이드 되어있었다면
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                    }).start(() => {
                        setPanOffset(MAX_SLIDE);
                        pan.setValue({ x: 0, y: 0 });
                        setSlideStatus(index, true)
                        onGestureEnd?.();
                        
                    });
                } else {
                    //슬라이드 하기 전에 평소상태였다면
                    Animated.spring(pan, {
                        toValue: { x: MAX_SLIDE, y: 0 },
                        useNativeDriver: false,
                    }).start(() => {
                        setPanOffset(MAX_SLIDE);
                        pan.setValue({ x: 0, y: 0 });
                        setSlideStatus(index, true)
                        onGestureEnd?.();
                        
                    });
                }
                
            } else {
                //슬라이드를 왼쪽으로 50이하 했을 때
                if (panOffsetRef.current.x <= MAX_SLIDE ){
                    //슬라이드 하기 전에 슬라이드 되어있었다면
                    Animated.spring(pan, {
                        toValue: { x: 100, y: 0 },
                        useNativeDriver: false,
                    }).start(() => {
                        setPanOffset(0);
                        pan.setValue({ x: 0, y: 0 });
                        setSlideStatus(index, false)
                        onGestureEnd?.();
                    });
                } else {
                    //슬라이드 하기 전에 평소상태였다면
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false,
                    }).start(() => {
                        setPanOffset(0);
                        pan.setValue({ x: 0, y: 0 });
                        setSlideStatus(index, false)
                        onGestureEnd?.();
                    });
                }
            }
        },
    });

    const deleteButtonWidth = Animated.add( Animated.multiply(pan.x, -1), -5);

    useEffect(() => {
        Animated.timing(anim, {
            toValue: schedule.enable ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [schedule.enable]);

    useEffect(() => {
        if ( schedule.slideStatus ) {
            panOffsetRef.current = { x: -100, y: 0 };
            pan.setOffset({ x: -100, y: 0 });
            pan.setValue({ x: -100, y: 0 });
        } else {
            panOffsetRef.current = { x: 0, y: 0 };
            pan.setOffset({ x: 0, y: 0 });
            pan.setValue({ x: 0, y: 0 });
        }

        console.log(schedule.slideStatus)
        
    }, [])

    const animatedStyles = {
        backgroundColor: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [opacity?"#1E1F23":"#28292D", schedule.backgroundColor],
        }),
        paddingVertical: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [25, 27],
        }),
    };

    const editButtonGap = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [8, 17],
    });

    const editButtonOpacity = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [opacity ? 0.4 : 1, 1],
    });

    const textColor = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#FFFFFF33', '#17181C'],
    });

    const labelFontSize = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [13, 14],
    });

    const fontSize = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [40, 54],
    });

    const meridiemFontSize = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 30],
    });

    const colonGap = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [12, 16],
    });

    const colonDotBackgroundColor = anim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#FFFFFF33", '#17181C'],
    });

    return (
        <View style={styles.alarmBoxDeleteContainer}>
        {/* 숨겨진 요소 */}
            <Animated.View style={[
                styles.deleteButton,
                { width: deleteButtonWidth }
            ]}>
                <TouchableOpacity
                    onPress={() => {
                        pan.stopAnimation(() => {
                            onDelete();
                        });
                    }}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                    activeOpacity={0.7}
                >
                    <PoppinsText style={styles.deleteButtonText}>Delete</PoppinsText>
                </TouchableOpacity>
            </Animated.View>
            
            <Animated.View
                style={[
                    styles.alarmBoxContainer,
                    animatedStyles,
                    pan.getLayout(),
                ]}
                {...panResponder.panHandlers}
            >
                <Pressable
                    onPress={onEdit}
                    delayPressIn={0}
                >
                    <Animated.View style={{gap: editButtonGap, opacity: editButtonOpacity}}>
                    <Animated.Text style={[styles.label, { color: textColor, fontSize: labelFontSize }]}>
                        <PoppinsText>
                            {schedule.label}
                        </PoppinsText>
                    </Animated.Text>

                    <View style={styles.timeToggleWrapper}>
                        <View style={styles.timeContainer}>
                            <View style={styles.timeWrapper}>
                            <Animated.Text style={[styles.time, { color: textColor, fontSize }]}>
                                <PoppinsText>{schedule.time.hour}</PoppinsText>
                            </Animated.Text>

                            <Animated.View style={{ gap: colonGap }}>
                                <Animated.View style={[styles.colonDot, { backgroundColor: colonDotBackgroundColor }]} />
                                <Animated.View style={[styles.colonDot, { backgroundColor: colonDotBackgroundColor }]} />
                            </Animated.View>

                            <Animated.Text style={[styles.time, { color: textColor, fontSize }]}>
                                <PoppinsText>{schedule.time.minute}</PoppinsText>
                            </Animated.Text>
                            </View>

                            <Animated.Text style={[styles.meridiem, { color: textColor, fontSize: meridiemFontSize }]}>
                            <PoppinsText>{schedule.time.meridiem}</PoppinsText>
                            </Animated.Text>
                        </View>
                    </View>

                    <View style={styles.labelWrapper}>
                    {schedule.day.every(item => item.enable) 
                    ? (
                        <Animated.Text style={[styles.label, { color: textColor }]}>
                            <PoppinsText>Every day</PoppinsText>
                        </Animated.Text>
                    )

                    : schedule.day.every(item => !item.enable)
                    ? (
                        <Animated.Text style={[styles.label, { color: textColor }]}>
                            <PoppinsText>Never</PoppinsText>
                        </Animated.Text>
                    ) : (
                        schedule.day.map((element, index) =>
                            element.enable && (
                                <Animated.Text
                                key={index}
                                style={[styles.label, { color: textColor, fontSize: labelFontSize }]}
                                >
                                <PoppinsText>{element.name}.</PoppinsText>
                                </Animated.Text>
                            )
                        )
                    )}
                    </View>
                </Animated.View>
                </Pressable>
                
                <Toggle onPress={onToggle} value={schedule.enable} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    alarmBoxDeleteContainer: {
        position: "relative",
        overflow: "hidden",
    },
    deleteButton: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#000000',
        right: 0,
        borderRadius: 36,
        height: "100%",
        overflow: "hidden"
    },
    deleteButtonText: {
        dispaly: "flex",
        minWidth: 95,
        maxHeight: 20,
        color: "#E01C20",
        fontSize: 14,
        fontWeight: 600,
        textAlign: "center",
        alignItems: "center",
        verticalAlign: "middle",
        justifyContent: "center",
    },
    alarmBoxContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 36,
        paddingLeft: 27,
        paddingRight: 15,
    },
    labelWrapper: {
        flexDirection: "row",
        gap: 10,
    },
    label: {
        fontWeight: "600",
        fontSize: 14,
    },
    timeToggleWrapper: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
    },
    timeWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },
    time: {
        fontWeight: "400",
        fontSize: 54,
    },
    colonDot: {
        width: 4,
        height: 4,
        borderRadius: 9999,
    },
    meridiem: {
        fontWeight: "400",
        fontSize: 30,
    },
});

    export default AlarmBox;
