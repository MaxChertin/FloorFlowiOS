import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, I18nManager  } from 'react-native';

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

  const [loaded] = useFonts({
      rubikmedium: require('../assets/fonts/Rubik-Medium.ttf'),
  });
  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.alignStatus}>
        <Text style={styles.text}>SERVER STATUS: </Text>
        {returnSignalBased(SERVER_STATUS)}
      </View>
    </SafeAreaView>
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