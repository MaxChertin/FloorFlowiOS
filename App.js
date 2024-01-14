import React, { useState, useEffect, useRef } from 'react';
import { useFonts } from "expo-font";
import Main from './main';
import Register from './register';
import ElectraHeader from './components/electraHeader';
import ServerStatusFooter from './components/serverStatusFooter';
import { StyleSheet, Text, View, Image, SafeAreaView, Alert } from 'react-native';
import io from 'socket.io-client';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

import messaging from '@react-native-firebase/messaging';

const Status = {
  Disconnected: 0,
  Pending: 1,
  Connecting: 2,
  Connected: 3
}

let registered = false;
const fileUri = `${FileSystem.documentDirectory}settings.json`;
const defaultUser = "Electra User";

const isLoggingFirstTime = async () => {
  try {
    // check if file exist
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      createDefaultSettingsFile();
      return true;
    }
    else {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const settings = JSON.parse(fileContent);
      return settings.name === defaultUser;
    }
  } catch (error) {
    Alert.alert('שגיאה', `שגיאה בקריאה/כתיבה של אחד מהקבצים של json. טעות: ${error}\nאנא, דווח על כך למנהל אזור פרוייקט.`)
    return true;
  }
}

const createDefaultSettingsFile = async () => {
  try {
    const initialSettingsJson = require('./settings.json');
    const initialSettingsString = JSON.stringify(initialSettingsJson);
  
    await FileSystem.writeAsStringAsync(fileUri, initialSettingsString);
    console.log('Created default settings.json file');
  } catch (error) {
    Alert.alert('שגיאה', `שגיאה בקריאה/כתיבה של הגדרות json. טעות: ${error}\nאנא, דווח על כך למנהל אזור פרוייקט.`)
  }
}

const writeToSettingsFile = async (name, malitan) => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    const settings = JSON.parse(fileContent);
  
    settings.name = name;
    settings.malitan = malitan;
    
    if (malitan) {
      settings.available = true;
    }
  
    const updatedJson = JSON.stringify(settings);
    await FileSystem.writeAsStringAsync(fileUri, updatedJson);
    console.log('Wrote to settings.json file');
  } catch (error) {
    Alert.alert('שגיאה', `שגיאה בקריאה/כתיבה של הגדרות json. טעות: ${error}\nאנא, דווח על כך למנהל אזור פרוייקט.`)
  }
}

const subscribeToTopic = () => {
  messaging()
  .subscribeToTopic('malitan')
  .then(() => console.log('[DEVTOOLS] Subscribed to Firebase malitan topic'));
}

const unsubscribeFromTopic = () => {
  messaging()
  .unsubscribeFromTopic('malitan')
  .then(() => console.log('[DEVTOOLS] Unsubscribed to Firebase malitan topic'));
}

const sendAcknowledgment = async () => {
  console.log('HEY IM SENDING THE HTTP REQUEST');
  try {
    const r = await fetch('http://192.168.1.157:3000/message/msg_id/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId: 'msg_id',
        status: 'received',
      }),
    });
  } catch (error) {
    console.log('fuck');
  }
}

export default App = () => {
  const requestUserPremission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  const [currentScreen, setCurrentScreen] = useState(null);
  const [serverStatus, setServerStatus] = useState(Status.Pending);
  const [requests, setRequests] = useState([]);
  const [sound, setSound] = useState();

  const addNewFloorRequest = (name, floorNumber, requestTime) => {
    const newRequest = {
      name: name,
      floorNum: floorNumber,
      requestTime: requestTime,
      keyi: null
    }

    playRequestSound();
    setRequests(requests => [...requests, newRequest]);
  }

  const removeFloorRequest = (index) => {
    const updatedRequests = requests.filter(
      (request) => request.keyi !== index
    );

    setRequests(updatedRequests);
  }

  async function playRequestSound() {
    const { sound } = await Audio.Sound.createAsync( require('./assets/floor-click.mp3') );
    setSound(sound);
    await sound.playAsync();
  }

  useEffect (() => {
    // Store local data
    const fetchData = async () => {
      const loginFirstTime = await isLoggingFirstTime();
      if (!loginFirstTime) registered = true;
      setCurrentScreen(loginFirstTime ? 'Register' : 'Main');
    };
    fetchData();

    // Google Firebase Cloud Messaging Setup
    // Premissions + fcm token
    if (requestUserPremission()) {
      // return fcm token for the device
      messaging().getToken().then(token => {
        console.log('FCM token:', token);
      });
    }
    else {
      console.log('failed to fetch token:', authStatus)
    }

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
    });

    // Assume a message-notification contains a "type" property in the data payload of the screen to open

    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
    });

    // Register background handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      //sendAcknowledgment();
    });

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      //Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
      //alert(remoteMessage.data.requestTime);
      //handleNewFloorRequest(remoteMessage.data.name, remoteMessage.data.floorNum);
      addNewFloorRequest(remoteMessage.data.name, remoteMessage.data.floorNum, remoteMessage.data.requestTime);
      //sendAcknowledgment();
    });


    return () => {
      // Unsubscribe background event handler when component unmounts
      return unsubscribe;
    };
  }, []);
  
  useEffect(() => {
    const handleSocketConnection = () => {
      // connect to webserver
      setServerStatus(Status.Connecting);
      console.log ('Connecting to webserver...');
      this.socket = io("https://floor-flow-server.onrender.com");

      // add event liseners for socket.io events
      this.socket.on('connect', () => {
        console.log ('Connected to webserver');
        setServerStatus(Status.Connected);
      });
      
      this.socket.on('connect_error', (error) => {
        alert ('Failed to connect to webserver: '+ error);
        setServerStatus(Status.Disconnected);
        return;
      });
      
      this.socket.on('disconnect', () => {
        alert ('Disconnected from websocket.');
        setServerStatus(Status.Disconnected);
      });
      
      
      this.socket.on('message', (data) => {
        console.log('Recieved message:', data);
      });
      
      // sending message to server 
      // this.socket.emit('clientMessage', 'Hello Server!');
      
      // clean up
      return () => {
        this.socket.disconnect();
      };
    };
    
    if (registered && currentScreen === 'Main') {
      handleSocketConnection();
    }
  }, [registered, currentScreen]);

  const navigateToMain = (name, malitan) => {
    setCurrentScreen('Main');
    console.log('EXITED with name: ' + name + ' and is malitan: ' + malitan);

    writeToSettingsFile(name, malitan);
    if (malitan) subscribeToTopic();

    registered = true;
  }
  
  if (currentScreen == 'Register')
  return (
      <SafeAreaView style={styles.container}>
        <ElectraHeader></ElectraHeader>
        <Register navigateToMain={navigateToMain}></Register>
        <ServerStatusFooter serverStatus={serverStatus}></ServerStatusFooter>
      </SafeAreaView>
    );
  else if (currentScreen == 'Main') 
    return (
      <SafeAreaView style={styles.container}>
        <ElectraHeader></ElectraHeader>
        <Main requests={requests} removeRequest={removeFloorRequest}></Main>
        <ServerStatusFooter serverStatus={serverStatus}></ServerStatusFooter>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  }
});