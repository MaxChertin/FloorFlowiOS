import React, { useState, useEffect, useRef } from 'react';
import { useFonts } from "expo-font";
import Main from './main';
import Register from './register';
import ElectraHeader from './components/electraHeader';
import ServerStatusFooter from './components/serverStatusFooter';
import { StyleSheet, Text, View, Image, SafeAreaView } from 'react-native';
import io from 'socket.io-client';
import * as FileSystem from 'expo-file-system';
import messaging from '@react-native-firebase/messaging';
import { Asset } from 'expo-asset';

const Status = {
  Disconnected: 0,
  Pending: 1,
  Connecting: 2,
  Connected: 3
}

let registered = false;
const defaultUser = "Electra User";

const storeData = async (data) => {
  const fileUri = `${FileSystem.documentDirectory}data.txt`;

  try {
    await FileSystem.writeAsStringAsync(fileUri, data);
    console.log('Data saved successfully! fileUri:', fileUri);
  } catch (error) {
    console.log('Error saving data:', error);
  }
};

const retrieveData = async () => {
  const fileUri = `${FileSystem.documentDirectory}data.txt`;

  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    console.log('Retrieved data:', fileContent);
    return fileContent;
  } catch (error) {
    console.log('Error retrieving data:', error);
    return null;
  }
};

const deleteFile = async () => {
  const fileUri = `${FileSystem.documentDirectory}data.txt`;

  try {
    await FileSystem.deleteAsync(fileUri);
    console.log('File deleted successfully!');
  } catch (error) {
    console.log('Error deleting file:', error);
  }
};


/*const downloadJsonFileToDevice = async () => {
  const fileUri = FileSystem.documentDirectory + 'settings.txt';
  try {
    const asset = Asset.fromModule(require('./assets/settings.json'));
    await asset.downloadAsync();
    await FileSystem.copyAsync({
      from: asset.localUri,
      to: fileUri,
    });
    console.log('File copied to: ', fileUri);
    return fileUri;
  } catch (error) {
    console.log ('Error reading json file:', error);
    return null;
  }
};

const readJsonFile = async () => {
  const fileUri = FileSystem.documentDirectory + 'settings.json';
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const settings = JSON.parse(fileContent);
      console.log('settings read from json file:', settings);
      return settings;
    }
    else {
      console.log('tried to read json file, but didnt found it.');
      return null;
    }
  } catch (error) {
      console.log ('Error reading json file:', error);
      return null;
  }
}; */

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
  const [currentScreen, setCurrentScreen] = useState('Register'); // loginFirstTime ? 'Register' : 'Main'
  const [serverStatus, setServerStatus] = useState(Status.Pending);

  useEffect (() => {
    //storeData('Sample data to be stored');
    //retrieveData();
    //deleteFile();

    // premissions
    if (requestUserPremission()) {
      // return fcm token for the device
      messaging().getToken().then(token => {
        console.log('token:', token);
      });
    }
    else {
      console.log('failed to fetch token', authStatus)
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
    });

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;

  }, []);

  // IMPORTANT: Check if already registered, if didn't registered then
  //            the hook default should stay at default, otherwise the
  //            it needs to be changed to 'Main'.

  const navigateToMain = (name, malitan) => {
    // process the input -> i.e name + malitan;
    setCurrentScreen('Main');
    console.log('EXITED with name: ' + name + ' and is malitan: ' + malitan);
    registered = true;
  }

  useEffect(() => {
    const handleSocketConnection = () => {
      // connect to webserver
      setServerStatus(Status.Connecting);
      console.log ('Connecting to webserver...');
      this.socket = io("http://192.168.1.157:3000");
      
      // add event liseners for socket.io events
      this.socket.on('connect', () => {
        console.log ('Connected to webserver');
        setServerStatus(Status.Connected);
      });

      this.socket.on('connect_error', (error) => {
        console.log ('Failed to connect to webserver:', error);
        setServerStatus(Status.Disconnected);
        console.log ('Server Status:', Status.Disconnected);
        return;
      });

      this.socket.on('disconnect', () => {
        console.log ('Disconnected from websocket.');
        setServerStatus(Status.Disconnected);
      });

      
      this.socket.on('message', (data) => {
        console.log('Recieved message:', data);
      });
      
      // sending message to server 
      this.socket.emit('clientMessage', 'Hello Server!');
      
      // clean up
      return () => {
        this.socket.disconnect();
      };
    };

    if (registered && currentScreen === 'Main') {
      handleSocketConnection();
    }
  }, [registered, currentScreen]);

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
        <Main></Main>
        <ServerStatusFooter serverStatus={serverStatus}></ServerStatusFooter>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  }
});