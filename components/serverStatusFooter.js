import { useFonts } from 'expo-font';
import React, { useEffect, useState, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, Text, View, Image, SafeAreaView, I18nManager } from 'react-native';

SplashScreen.preventAutoHideAsync();

const Status = {
    Disconnected: 0,
    Pending: 1,
    Connecting: 2,
    Connected: 3
}

const returnSignalBased = (recievedStatus) => {
  switch (recievedStatus) {
    case Status.Disconnected:
      return (<Text style={[styles.textServer, styles.textServerDisconnected]}> 🔴 Disconnected</Text>);
    case Status.Pending:
      return (<Text style={[styles.textServer, styles.textServerPending]}> 🔵 Pending</Text>);
    case Status.Connecting:
      return (<Text style={[styles.textServer, styles.textServerConnecting]}> 🟠 Connecting...</Text>);
    case Status.Connected:
      return (<Text style={[styles.textServer, styles.textServerConnected]}> 🟢 Connected</Text>);
    default:
      return <Text style={{color:'red', fontSize: 20, marginBottom: 4, fontWeight: 'bold'}}> ERROR</Text>;
  }
}

const isRTL = I18nManager.isRTL;
const rowDirection = isRTL ? 'row-reverse' : 'row';

export default function ServerStatusFooter({ serverStatus }) {
  const [SERVER_STATUS, set_SERVER_STATUS] = useState(Status.Pending);
  useEffect(() => {
     set_SERVER_STATUS(serverStatus);
  }, [serverStatus]);

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
      <View style={styles.alignStatus}>
        <Text style={styles.text}>SERVER STATUS: </Text>
        {returnSignalBased(SERVER_STATUS)}
      </View>
    </View>
  );
}
  
  const styles = StyleSheet.create({
    container: {
        flex: .06,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        borderRadius: 5,
        justifyContent: 'center',
        alignSelf: 'stretch',
      },
    text: {
        fontSize: 20,
        padding: 0,
        fontFamily: 'rubikmedium',
    },
    alignStatus: {
        flexDirection: rowDirection,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    textServer: {
        fontSize: 20,
        padding: 0,
        fontFamily: 'rubikmedium',
    },
    textServerDisconnected: {
        color: '#fa3246',
    },
    textServerPending: {
        color: '#3464eb'
    },
    textServerConnecting: {
        color: '#fab732'
    },
    textServerConnected: {
        color: '#36d155'
    }
});