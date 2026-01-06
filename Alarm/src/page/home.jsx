import React, { useState, useEffect, useRef } from 'react';
import {
    Pressable, StatusBar, StyleSheet, View, Platform, SafeAreaView,
    ScrollView, Text, TextInput, Image, TouchableOpacity, Dimensions, Modal, Alert, PanResponder, Animated
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { TriggerType, AndroidImportance, RepeatFrequency, AndroidVisibility } from '@notifee/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AlarmBox from '../component/alarm_box';
import AdBox from '../component/ad_box';
import PoppinsText from '../component/poppins_text.jsx';
import Toggle from '../component/toggle.jsx';

function AddScheduleModal({ visible, onRequestClose, onSave, defaultSchedule }) {
    const ALARM_BOX_COLOR_ARRAY = ["#DADADA", "#FEDE74", "#74FEBB", "#8274FE", "#FE7474"]

    const [time, setTime] = useState(new Date());
    const [alarmName, setAlarmName] = useState("")
    const [isSnooze, setIsSnooze] = useState(false);
    const [selectedAlarmBoxColor, setSelectedAlarmBoxColor] = useState(ALARM_BOX_COLOR_ARRAY[0])
    const [repeatDayArray, setRepeatDayArray] = useState([])

    const [modalContentWidth, setModalContentWidth] = useState(0);

    const dragY = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event(
                [null, { dy: dragY }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    onRequestClose(); // 일정 거리 이상 내리면 닫기
                } else {
                    Animated.spring(dragY, {
                        toValue: 0,
                        useNativeDriver: false,
                    }).start();
                }
            },
        })
    ).current;

    const handleAddSchedule = () => {
        onSave({
            type: "schedule",
            enable: true,
            label: alarmName || "Alarm",
            time: {
                hour: ((time.getHours() + 11) % 12 + 1).toString().padStart(2, '0'),
                minute: time.getMinutes().toString().padStart(2, '0'),
                meridiem: time.getHours() >= 12 ? "PM" : "AM"
            },
            day: repeatDayArray,
            snooze: isSnooze,
            backgroundColor: selectedAlarmBoxColor,
            slideStatus: false
        });
        onRequestClose();
    };

    useEffect(() => {
        if (visible) {
            dragY.setValue(0); // 모달이 다시 열릴 때 위치 초기화

            if (defaultSchedule) {
                // edit mode
                const { label, snooze, backgroundColor, day, time } = defaultSchedule;
                setAlarmName(label || "");
                setIsSnooze(snooze || false);
                setSelectedAlarmBoxColor(backgroundColor || ALARM_BOX_COLOR_ARRAY[0]);
                setRepeatDayArray(day || []);
                const date = new Date();
                let hour = parseInt(time.hour);
                if (time.meridiem === "PM" && hour < 12) hour += 12;
                if (time.meridiem === "AM" && hour === 12) hour = 0;
                date.setHours(hour);
                date.setMinutes(parseInt(time.minute));
                setTime(date);
            } else {
                // add mode 초기화
                setTime(new Date());
                setIsSnooze(false);
                setSelectedAlarmBoxColor(ALARM_BOX_COLOR_ARRAY[0]);
                setAlarmName("");
                setRepeatDayArray([
                    { name: "Mon", enable: true },
                    { name: "Tue", enable: true },
                    { name: "Wed", enable: true },
                    { name: "Thu", enable: true },
                    { name: "Fri", enable: true },
                    { name: "Sat", enable: true },
                    { name: "Sun", enable: true },
                ]);
            }
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            onRequestClose={onRequestClose}
            animationType="slide"
            transparent={true}
        >
            <SafeAreaView />
            <View style={styles.modalBackground}>
                
                <Animated.View
                    style={[styles.modalContent, { transform: [{ translateY: dragY }] }]}
                    {...panResponder.panHandlers}
                >
                    <ScrollView
                        style={{width:"100%"}}
                        onLayout={(event) => {
                            const layout = event.nativeEvent.layout;
                            setModalContentWidth(layout.width);
                        }}
                    >
                        <DatePicker
                            date={time}
                            onDateChange={setTime}
                            mode="time"
                            theme="dark"
                            androidVariant="nativeAndroid"
                            textColor="white"
                            style={{width:modalContentWidth, height:200}}
                        />
                        <View style={styles.inputSection}>
                            <View style={styles.repeatWrapper}>
                                <View style={styles.labelEverydayWrapper}>
                                    <PoppinsText style={styles.labelOfInput}>
                                        Repeat
                                    </PoppinsText>
                                    <View style={[styles.checkboxEverydayWrapper]}>
                                        <Pressable
                                            style={[
                                                styles.checkboxDay,
                                                repeatDayArray.every((dayObject)=>{ return dayObject.enable == false }) 
                                                    ? styles.checkboxDayActive
                                                    : null,
                                            ]}
                                            onPress={
                                                ()=>{
                                                    setRepeatDayArray(prev =>
                                                        prev.map(day => ({
                                                            ...day,
                                                            enable: false
                                                        }))
                                                    )
                                                }
                                            }
                                        >
                                            <PoppinsText
                                                style={
                                                    [
                                                        styles.checkboxDayText,
                                                        repeatDayArray.every((dayObject)=>{ return dayObject.enable == false})
                                                        ? styles.checkboxDayActiveText
                                                        : null,
                                                    ]
                                                }
                                            >
                                                Never
                                            </PoppinsText>
                                        </Pressable>
                                        <Pressable
                                            style={[
                                                styles.checkboxDay,
                                                repeatDayArray.every((dayObject)=>{ return dayObject.enable == true}) 
                                                ? styles.checkboxDayActive
                                                : null,
                                            ]}
                                            onPress={
                                                ()=>{
                                                    setRepeatDayArray(prev =>
                                                        prev.map(day => ({
                                                            ...day,
                                                            enable: true
                                                        }))
                                                    )
                                                }
                                            }
                                        >
                                            <PoppinsText
                                                style={
                                                    [
                                                        styles.checkboxDayText,
                                                        repeatDayArray.every((dayObject)=>{ return dayObject.enable == true})
                                                        ? styles.checkboxDayActiveText
                                                        : null,
                                                    ]
                                                }
                                            >
                                                Every day
                                            </PoppinsText>
                                        </Pressable>
                                    </View>
                                </View>
                                <View style={styles.checkboxDayWrapper}>
                                    {
                                        repeatDayArray
                                            ? repeatDayArray.map((dayObject, index) => {
                                                return (
                                                <Pressable
                                                    key={index}
                                                    style={[
                                                        styles.checkboxDay,
                                                        dayObject.enable ? styles.checkboxDayActive:null,
                                                        {width: 42, paddingHorizontal: 0}
                                                    ]}
                                                    onPress={() => {
                                                        setRepeatDayArray((prev) => {
                                                            const newArray = [...prev];
                                                            newArray[index] = {
                                                                ...newArray[index],
                                                                enable: !newArray[index].enable,
                                                            };
                                                            return newArray;
                                                        });
                                                    }}
                                                >
                                                    <PoppinsText 
                                                        style={
                                                            [
                                                                styles.checkboxDayText,
                                                                dayObject.enable ? styles.checkboxDayActiveText:null,
                                                            ]
                                                        }
                                                    >
                                                    {dayObject.name}
                                                    </PoppinsText>
                                                </Pressable>
                                                );
                                            })
                                            : null
                                    }
                                </View>
                            </View>
                            <View style={[styles.labelInputWrapper, styles.labelInputWrapperBorder]}>
                                <PoppinsText style={styles.labelOfInput}>
                                    Label
                                </PoppinsText>
                                <View style={styles.alarmBoxTextInputWrapper}>
                                    {
                                        alarmName
                                        ? null
                                        : <Image
                                                style={styles.alarmBoxTextInputIcon}
                                                source={require("../../asset/image/icon_edit.png")}
                                        />
                                    }
                                    <TextInput
                                        value={alarmName}
                                        onChangeText={setAlarmName}
                                        style={styles.alarmBoxTextInput}
                                        placeholderTextColor="#FFFFFF80"
                                        maxLength={20}
                                        placeholder="Name of the alarm"
                                    />
                                </View>
                            </View>
                            <View style={[styles.labelInputWrapper, styles.labelInputWrapperBorder]}>
                                <PoppinsText style={styles.labelOfInput}>
                                    Color
                                </PoppinsText>
                                <View style={styles.colorCheckBoxWrapper}>
                                    {
                                        ALARM_BOX_COLOR_ARRAY.map(
                                            (color, index)=>{
                                                return (
                                                    <Pressable 
                                                        style={
                                                            [
                                                                styles.colorCheckBox,
                                                                {
                                                                    backgroundColor: color,
                                                                    borderWidth: color === selectedAlarmBoxColor? 1:0,
                                                                }
                                                            ]
                                                        }
                                                        key={index}
                                                        onPress={
                                                            ()=>{
                                                                setSelectedAlarmBoxColor(color)
                                                            }
                                                        }
                                                    >
                                                        {
                                                            color === selectedAlarmBoxColor
                                                                ? <Image
                                                                    style={styles.colorCheckBoxImage}
                                                                    source={require("../../asset/image/icon_check_black.png")}
                                                                />
                                                                : null
                                                        }
                                                    </Pressable>
                                                )
                                            }
                                        )
                                    }
                                </View>
                            </View>
                            <View style={[styles.labelInputWrapper, styles.labelInputWrapperBorder]}>
                                <PoppinsText style={styles.labelOfInput}>
                                    Snooze
                                </PoppinsText>
                                <Toggle 
                                    value={isSnooze}
                                    onPress={
                                        ()=>{
                                            setIsSnooze(!isSnooze)
                                        }
                                    }
                                    style={
                                        styles.snoozeToggle
                                    }
                                    circleStyle={styles.snoozeToggleCircle}
                                />
                            </View>
                        </View>
                        {/* <AdBox 
                            url="https://www.microsoft.com/ko-kr/software-download/windows11"
                            backgroundColor="#28292D"
                            style={{marginTop:5}}
                        >
                            <Image
                                source={require("../../asset/image/ad_example.png")}
                                style={styles.adBoxImage}
                            />
                        </AdBox> */}
                    </ScrollView>

                    <TouchableOpacity style={styles.saveButton} onPress={handleAddSchedule}>
                        <Image
                            style={styles.saveButtonImage}
                            source={require("../../asset/image/button_save_alarm.png")}
                        />
                    </TouchableOpacity>
                    <SafeAreaView />
                </Animated.View>
            </View>
        </Modal>
    );
}

function Home({navigation}) {
    const [contentArray, setContentArray] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [isStorageLoading, setIsStorageLoading] = useState(true);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const insets = useSafeAreaInsets();

    useEffect(() => {
        const init = async () => {
            await notifee.requestPermission();

            await notifee.createChannel({
                id: 'alarm-channel',
                name: 'Alarm Channel',
                importance: AndroidImportance.MAX,
                sound: 'ringtone.wav',
                bypassDnd: true,
                vibration: true,
                visibility: AndroidVisibility.PUBLIC,
            });

            const json = await AsyncStorage.getItem('@alarm_data');
            const saved = json ? JSON.parse(json) : [];
            setContentArray(saved);
            scheduleAllAlarms(saved.filter(item => item.type === 'schedule'));
            setIsStorageLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        if (isStorageLoading) return;

        const save = async () => {
            try {
                await AsyncStorage.setItem('@alarm_data', JSON.stringify(contentArray));
            } catch (e) {
                console.error('AsyncStorage 저장 실패:', e);
            }
        };
        save();

        const schedules = contentArray.filter(item => item.type === 'schedule');
        scheduleAllAlarms(schedules);
    }, [contentArray]);

    const toggleContentEnable = (index) => {
        setContentArray(prev => {
            const newArray = [...prev];
            newArray[index] = { ...newArray[index], enable: !newArray[index].enable };
            return newArray;
        });
    };

    const handleAddSchedule = (scheduleObject) => {
        setContentArray(prev => {
            if (editingIndex !== null) {
                const newArray = [...prev];
                newArray[editingIndex] = { ...scheduleObject, type: 'schedule' };
                setEditingIndex(null);
                return newArray;
            }
            return [...prev, scheduleObject];
        });
    };

    const scheduleAllAlarms = async (schedules) => {
        await notifee.cancelAllNotifications();

        for (let index = 0; index < schedules.length; index++) {
            const schedule = schedules[index];
            if (!schedule.enable) continue;

            const hour = parseInt(schedule.time.hour);
            const minute = parseInt(schedule.time.minute);
            const meridiem = schedule.time.meridiem;
            let alarmHour = meridiem === 'PM' && hour !== 12 ? hour + 12 : hour;
            if (meridiem === 'AM' && hour === 12) alarmHour = 0;

            for (const dayObj of schedule.day) {
                if (!dayObj.enable) continue;
                const alarmDate = getNextDateForDay(dayObj.name, alarmHour, minute);

                const trigger = {
                    type: TriggerType.TIMESTAMP,
                    timestamp: alarmDate.getTime(),
                    repeatFrequency: RepeatFrequency.WEEKLY,
                };

                await notifee.createTriggerNotification({
                    id: `${index}-${dayObj.name}`,
                    title: 'Alarm',
                    body: schedule.label,
                    android: {
                        channelId: 'alarm-channel',
                        sound: 'ringtone.wav',
                        pressAction: { id: 'default' },
                        vibrate: true,
                        vibrationPattern: [300, 500],
                        importance: AndroidImportance.MAX,
                        visibility: AndroidVisibility.PUBLIC,
                        fullScreenAction: {
                            id: 'default',
                        },
                    },
                    ios: {
                        critical: true,
                        sound: 'ringtone.wav',
                    },
                }, trigger);
            }
        }
    };

    const getNextDateForDay = (dayName, hour, minute) => {
        const daysMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        const targetDay = daysMap[dayName];
        const now = new Date();
        const dayDiff = (targetDay + 7 - now.getDay()) % 7;
        const alarmDate = new Date(now);

        alarmDate.setDate(now.getDate() + dayDiff);
        alarmDate.setHours(hour);
        alarmDate.setMinutes(minute);
        alarmDate.setSeconds(0);
        alarmDate.setMilliseconds(0);

        if (dayDiff === 0 && alarmDate <= now) {
            alarmDate.setDate(alarmDate.getDate() + 7);
        }

        return alarmDate;
    };

    const setSlideStatus = (index, status) => {
        setContentArray(prev => {
            const newArray = [...prev];
            newArray[index] = {
                ...newArray[index],
                slideStatus: status,
            };
            return newArray;
        });
    };

    return (
        <View style={styles.homeContainer}>
            <StatusBar backgroundColor="transparent" barStyle="light-content" />
            <ScrollView style={[styles.scrollView, {paddingTop: insets.top}] } scrollEnabled={scrollEnabled}>
                <View style={styles.alarmBoxWrapper}>
                    {contentArray && contentArray.map((element, index) => {
                        if (element.type === "ad" && element.enable) {
                            return (
                                <AdBox url={element.url} key={index}>
                                    {element.children}
                                </AdBox>
                            );
                        } else if (element.type === "schedule") {
                            return (
                                <AlarmBox
                                    opacity={index >= 4}
                                    key={index}
                                    schedule={element}
                                    onToggle={() => toggleContentEnable(index)}
                                    onEdit={() => {
                                        setEditingIndex(index);
                                        setModalVisible(true);
                                    }}
                                    onDelete={() => {
                                        setContentArray(prev => prev.filter((_, i) => i !== index));
                                    }}
                                    onGestureStart={() => setScrollEnabled(false)}
                                    onGestureEnd={() => setScrollEnabled(true)}
                                    index={index}
                                    setSlideStatus={setSlideStatus}
                                />
                            );
                        }
                    })}
                </View>
            </ScrollView>
            <TouchableOpacity style={styles.buttonAdd} onPress={() => {
                if (contentArray.length > 50) {
                    Alert.alert("Announce", "No more alarms can be added");
                } else {
                    setEditingIndex(null);
                    setModalVisible(true);
                }
            }}>
                <Image style={styles.buttonAddImage} source={require("../../asset/image/button_add.png")} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.buttonSetting}
                onPress={() => navigation.navigate('Setting')}
            >
                <Image style={styles.buttonSettingImage} source={require("../../asset/image/button_setting.png")} />
            </TouchableOpacity>
            <AddScheduleModal
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                onSave={handleAddSchedule}
                defaultSchedule={editingIndex !== null ? contentArray?.[editingIndex] : null}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    homeContainer: {
        maxHeight: "100%",
        minHeight: "100%",
        backgroundColor: "#17181C",
    },
    scrollView: {
        minHeight: "100%",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    alarmBoxWrapper: {
        paddingTop: 13,
        paddingHorizontal: 8,
        gap: 5,
        paddingBottom: Platform.select({
            ios: 99,
            android: 128,
        }),
    },
    adBoxImage: {
        width: "100%",
        resizeMode: "contain",
    },
    buttonAdd: {
        position: "absolute",
        bottom: 3,
        left: Dimensions.get("window").width / 2 - 70,
        zIndex: 100,
    },
    buttonAddImage: {
        width: 140,
        height: 110,
    },
    buttonSetting: {
        position: "absolute",
        right: 24,
        bottom: 12,
        zIndex: 100,
    },
    buttonSettingImage: {
        width: 102,
        height: 92,
    },
    modalBackground: {
        flex: 1,
        paddingHorizontal: 8
    },
    modalContent: {
        backgroundColor: "#1E1F23",
        borderRadius: 36,
        alignItems: "center",
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: "auto",
        padding: 8,
        paddingTop: 30,
    },
    inputSection: {
        paddingHorizontal: 18,
        borderRadius: 36,
        backgroundColor: "#28292D"
    },
    repeatWrapper: {
        gap: 20,
        paddingVertical: 18
    },
    labelEverydayWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    checkboxEverydayWrapper : {
        flexDirection: "row",
        gap: 5
    },
    checkboxDayWrapper: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    checkboxDay: {
        alignContent: "center",
        justifyContent: "center",
        borderRadius: 13,
        backgroundColor: "#17181C",
        paddingHorizontal: 15,
        height: 32,
    },
    checkboxDayActive: {
        backgroundColor: "#B3B3B3",
    },
    checkboxDayText: {
        textAlign: "center",
        color: "#FFFFFF80"
    },
    checkboxDayActiveText: {
        color: "#000000"
    },
    labelInputWrapper: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 20
    },
    labelInputWrapperBorder: {
        borderColor: "#FFFFFF0D", 
        borderTopWidth: 1
    },
    labelOfInput: {
        color: "#FFFFFF",
        fontSize: 14,
        lineHeight: 22,
        fontWeight: 400
    },

    alarmBoxTextInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },
    alarmBoxTextInput: {
        color: "#FFFFFF",
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        height: 24,
        width: 132,
        textAlign: "right",
    },
    alarmBoxTextInputIcon: {
        width: 24,
        height: 24
    },
    colorCheckBox: {
        width: 45,
        height: 31,
        borderRadius: 13,
        borderColor: "#FFFFFF",
        boxSizing:"border-box",
        alignItems: "center",
        justifyContent: "center"
    },
    colorCheckBoxWrapper: {
        flexDirection: "row",
        gap: 5
    },
    colorCheckBoxImage: {
        width: 31,
        height: 31
    },
    snoozeToggle: {
        width: 60,
        height: 31,
    },
    snoozeToggleCircle: {
        width: 27
    },
    saveButton: {
        marginTop: "auto",
    },
    saveButtonImage: {
        width: 310,
        height: 70,
    },
})

export default Home;