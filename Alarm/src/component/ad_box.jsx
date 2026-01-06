import React from 'react';
import { View, TouchableOpacity, StyleSheet, Linking, Alert, Image } from 'react-native';

const AdBox = ({ url, children, backgroundColor, style}) => {
    const linkUrl = async () => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert(`링크를 열 수 없습니다: ${url}`);
        }
    };

    return (
        <View style={[styles.adBoxContainer, style]}>
            <TouchableOpacity style={[styles.linkButton, {backgroundColor: backgroundColor?backgroundColor:"#1E1F23"}]} onPress={() => linkUrl()}>
                {children}
                <Image
                    source={require("../../asset/image/icon_ad.png")} 
                    style={styles.adIcon}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    adBoxContainer: {
        width: "100%",
        aspectRatio: 374/110,
        overflow: "hidden",
        borderRadius: 36,
    },
    linkButton : {
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#1E1F23",
    },
    adIcon : {
        position: "absolute",
        width: 34,
        height: 22,
        resizeMode: "contain",
        top: 14,
        left: 16
    }
});

export default AdBox;