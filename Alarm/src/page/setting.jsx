import React, { useState, useEffect, useRef } from "react";
import {
    Pressable, StatusBar, StyleSheet, View, Platform,
    ScrollView, Text, TextInput, Image, TouchableOpacity, Dimensions, Modal, Alert, PanResponder, Animated, Linking
} from "react-native";

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PoppinsText from "../component/poppins_text";
import NotoSansKRText from "../component/notosanskr_text";

function Setting({navigation}) {

    const insets = useSafeAreaInsets();

    const SETTING_MENU_ARRAY = [
        {
            label: "블링킷 알람 구매하기",
            menuIconSrc: require("../../asset/image/icon_blinkkit_white.png"),
            onPress: ()=>{}
        },
        {
            label: "권한 설정",
            menuIconSrc: require("../../asset/image/icon_check_white.png"),
            onPress: ()=>{Linking.openSettings()}
        },
        {
            label: "평점 남기기",
            menuIconSrc: require("../../asset/image/icon_smile_white.png"),
            onPress: ()=>{}
        },
        {
            label: "블링킷 알람 공유하기",
            menuIconSrc: require("../../asset/image/icon_plane_white.png"),
            onPress: ()=>{}
        },
        {
            label: "문의하기",
            menuIconSrc: require("../../asset/image/icon_chat_baloon_white.png"),
            onPress: ()=>{}
        },
        {
            label: "블링킷 소개",
            menuIconSrc: require("../../asset/image/icon_box_white.png"),
            onPress: ()=>{}
        },
    ]

    const TERM_MENU_ARRAY = [
        {
            label: "이용약관",
            menuIconSrc: require("../../asset/image/icon_document_white.png"),
            onPress: ()=>{}
        },
        {
            label: "개인정보 처리방침",
            menuIconSrc: require("../../asset/image/icon_privacy_white.png"),
            onPress: ()=>{}
        }
    ]

    const getMenuList = (menuArray)=>{
        return menuArray.map(
            (element, index)=>{
                return(
                    <TouchableOpacity 
                        style={styles.menu}
                        onPress={element.onPress}
                        key={index}
                    >
                        <Image 
                            style={styles.menuIcon}
                            source={element.menuIconSrc}
                        />
                        <NotoSansKRText style={styles.menuLabel}>
                            {element.label}
                        </NotoSansKRText>
                        <Image 
                            style={styles.menuIcon}
                            source={require("../../asset/image/icon_arrow_right_white.png")}
                        />
                    </TouchableOpacity>
                )
            }
        )
    }

    return (
        <View style={styles.settingContainer}>
            <ScrollView style={[styles.scrollView, { paddingTop: insets.top }]}>
                <Image style={styles.headlineImage} source={require("../../asset/image/text_blinkkit_alarm.png")} />
                <View style={styles.linkMenuWrapper}>
                    {
                        getMenuList(SETTING_MENU_ARRAY)
                    }
                </View>
                <View style={styles.termMenuWrapper}>
                    {
                        getMenuList(TERM_MENU_ARRAY)
                    }
                </View>
            </ScrollView>
            <TouchableOpacity 
                style={styles.buttonGoBack}
                onPress={() => navigation.navigate("Home")}
            >
                <Image style={styles.buttonGoBackImage} source={require("../../asset/image/button_go_back.png")} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    settingContainer: {
        position: "relative",
        maxHeight: "100%",
        minHeight: "100%",
        backgroundColor: "#17181C",
    },
    headlineImage: {
        width: 165,
        height: 19,
        marginLeft: 32,
        marginTop: 32
    },
    scrollView: {
        minHeight: "100%",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    linkMenuWrapper: {
        marginTop: 72,
        marginHorizontal: 30,
        borderBottomWidth: 1,
        borderColor: "#FFFFFF1A",
        paddingBottom: 16
    },
    termMenuWrapper: {
        paddingTop:16,
        marginHorizontal: 30,
    },
    menu: {
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 15
    },
    menuIcon: {
        width: 24,
        height: 24
    },
    menuLabel: {
        color: "#FFFFFF",
        fontSize: 15,
        flex: 1
    },
    buttonGoBack: {
        position: "absolute",
        left: 36,
        bottom: 26
    },
    buttonGoBackImage: {
        width: 102,
        height: 92,
    }
});

export default Setting;
