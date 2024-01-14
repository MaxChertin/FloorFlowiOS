import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, TouchableOpacity, I18nManager } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons'; 

SplashScreen.preventAutoHideAsync();

export default function floorCall( {name, floorNum, requestTime, onPressClose} ) {
    const [fontsLoaded] = useFonts({
        rubikmedium: require('../assets/fonts/Rubik-Medium.ttf'),
    });

    const onLayoutRootView = useCallback(async () => {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
      <View style={styles.container} onLayout={onLayoutRootView}>
          <TouchableOpacity style={styles.closeButton} onPress={onPressClose}>
              <Ionicons name="close-circle" size={40} color="#ff4040" />
          </TouchableOpacity>
          <View style={styles.messageBox}>
              <Text style={[styles.messageText, styles.messageTextFloor]}>{floorNum}</Text>
              <Text style={styles.messageText}>{name}</Text>
              <Text style={styles.messageTimer}>נשלח ב- {requestTime}</Text>
          </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2196F3',
        height: '20%',
        width: 220,
        borderRadius: 10,
        marginTop: '5%',
        elevation: 5
      },
      closeButton: {
        //backgroundColor: 'black',
        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
        justifyContent: 'flex-end',
        top: '-5%',
        //marginLeft: '70%',
        width: '20%',
        right: I18nManager.isRTL ? '10%' : '-175%',
        zIndex: 1,
      },
      messageBox: {
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        margin: '-18%',
      },
      messageTextFloor: {
        fontSize: 32
      },
      messageText: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'rubikmedium',
      },
      messageRequester: {
        fontSize: 20,
        color: 'white',
        fontFamily: 'rubikmedium',
      },
      messageTimer: {
        fontSize: 14,
        color: 'black',
        fontFamily: 'rubikmedium',
        marginBottom: '2%'
      }
  });