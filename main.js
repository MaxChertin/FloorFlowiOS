import { StatusBar } from 'expo-status-bar';
import { useFonts } from "expo-font";
import React, { useEffect, useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import FloorCallPopup from './components/floorCall';
import { FontAwesome } from '@expo/vector-icons';
import messaging from '@react-native-firebase/messaging';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, Text, Button, ActivityIndicator, View, SafeAreaView, ScrollView, Pressable, Alert, I18nManager, Switch } from 'react-native';

SplashScreen.preventAutoHideAsync();

const Floors = {
    Zero: 0,
    One: 1,
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5,
    Six: 6
}

const fileUri = `${FileSystem.documentDirectory}settings.json`;
let date = new Date();


const deleteFile = async () => {
  try {
    await FileSystem.deleteAsync(fileUri);
    alert('[DEVTOOLS] Settings.json file deleted successfully!');
  } catch (error) {
    alert('[DEVTOOLS] Error deleting settings.json file: ' + error);
  }
}

const changeSettingsFile = async () => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    const settings = JSON.parse(fileContent);
    
    const wantToChangeTo = false;
    
    settings.malitan = wantToChangeTo;
    
    const updatedJson = JSON.stringify(settings);
    await FileSystem.writeAsStringAsync(fileUri, updatedJson);
    alert('[DEVTOOLS] Modified settings.json file.');
  } catch (error) {
    Alert.alert('שגיאה', `שגיאה בקריאה/כתיבה של הגדרות json. טעות: ${error}\nאנא, דווח על כך למנהל אזור פרוייקט.`)
  }
}

const saveAvailablityToSettings = async (available) => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    const settings = JSON.parse(fileContent);
  
    settings.available = available;
    
    const updatedJson = JSON.stringify(settings);
    await FileSystem.writeAsStringAsync(fileUri, updatedJson);
    //const fileContentt = await FileSystem.readAsStringAsync(fileUri);
    //alert(`[DEVTOOLS] settings.json now is: ${fileContentt}`);
  } catch (error) {
    Alert.alert('שגיאה', `שגיאה בקריאה/כתיבה של הגדרות json. טעות: ${error}\nאנא, דווח על כך למנהל אזור פרוייקט.`)
  }
}

const getNameFromSettings = async () => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    const settings = JSON.parse(fileContent);
    
    return (settings.name);
  } catch (error) {
    return 'Electra User';
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

export default function Main({ requests, removeRequest }) {
  const [isMalitan, setMalitan] = useState(null);
  const [floorRequests, setFloorRequests] = useState([]);
  const [time, setTime] = useState(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [floorInUse, setFloorInUse] = useState(null);
  const [successRequest, setSuccessRequest] = useState(null);
  const [isEnabled, setIsEnabled] = useState(true);

  const toggleSwitch = (value) => {
    setIsEnabled(value);
    value ? subscribeToTopic() : unsubscribeFromTopic();
    saveAvailablityToSettings(value);
  }

  useEffect(() => {
    const getIsMalitan = async () => {
      try {
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const settings = JSON.parse(fileContent);
        setMalitan(settings.malitan);
      } catch (error) {
        Alert.alert('שגיאה', `שגיאה בקריאה/כתיבה של הגדרות json. טעות: ${error}\nאנא, דווח על כך למנהל אזור פרוייקט.`)
      }
    };

    getIsMalitan();
  }, [isMalitan]);

  useEffect(() => {
    const intervalID = setInterval(() => {
      date = new Date();
      setTime(date.toLocaleTimeString('he-IL'));
    }, 1000);

    return () => clearInterval(intervalID);
  }, []);

  useEffect(() => {
    const fetchInitialCalls = async () => {
      try {
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const settings = JSON.parse(fileContent);
        setIsEnabled(settings.available);
      } catch (error) {
        Alert.alert('שגיאה', `שגיאה בקריאה/כתיבה של הגדרות json. טעות: ${error}\nאנא, דווח על כך למנהל אזור פרוייקט.`)
      }
    }

    fetchInitialCalls();
  }, []);

  useEffect(() => {
    setFloorRequests(requests);
  }, [requests]);

  const removeFloorRequest = (index) => {
    const updatedRequests = floorRequests.filter(
      (request) => request.keyi !== index
    );

    setFloorRequests(updatedRequests);
    removeRequest(index);
  }

  const renderFloorRequests = () => {
    const floorRequestComponents = [];
    
    Object.keys(floorRequests).forEach((index) => {
      const name = floorRequests[index].name;
      const floorNum = floorRequests[index].floorNum;
      const requestTime = floorRequests[index].requestTime;
      floorRequests[index].keyi = index;
  
      // create a popup component and push it
      floorRequestComponents.push(
        <FloorCallPopup key={index} name={name} floorNum={floorNum} requestTime={requestTime} onPressClose={() => removeFloorRequest(index)}></FloorCallPopup>
      );
    });
    return floorRequestComponents;
  }

  const renderFloorsButtons = () => {
    const floorButtonComponents = [];
    
    Object.keys(Floors).forEach((floorKey) => {
      const floorNumber = Floors[floorKey]
      
      // create a button and push it
      floorButtonComponents.push(
        <Pressable key={floorKey} style={[styles.floorButton, buttonsDisabled && { backgroundColor: 'gray' } ]} onPress={() => onFloorRequest(floorNumber)} android_ripple={ {color: '#8dc5f2'} } android_disableSound={false} disabled={buttonsDisabled}>
          {floorInUse !== null && floorInUse === floorNumber ? <ActivityIndicator size="large" color="white"/> : successRequest === floorNumber ? <FontAwesome name="check" size={34} color="#42e340" /> : <Text style={styles.buttonText}>{`${floorNumber}`}</Text>}
        </Pressable>
      );
    });
    return floorButtonComponents;
  }

  const releaseButtons = (floorNumber, s, d = 0) => {
    setTimeout(() => {
      setButtonsDisabled(false);
      setFloorInUse(null)
      s ? showSucceed(floorNumber) : null;
    }, d);
  }

  const showSucceed = (floorNum) => {
    setSuccessRequest(floorNum);
    setTimeout(() => {
      setSuccessRequest(null);
    }, 1000);
  }

  // my goodness me that is disgusting fucking code holy fucking shit sorry lord
  const onFloorRequest = async (floorNumber) => {
    setButtonsDisabled(true);
    setFloorInUse(floorNumber);
    date = new Date();
    this.socket.timeout(5000).emit('floor-request', `${await getNameFromSettings()}:${floorNumber}:${date.toLocaleTimeString('he-IL')}`, (err, response) => {
      if (err) { 
        Alert.alert('שגיאה', 'הבקשה לא הגיעה ליעד, אנא וודא שהנך מחובר לשרת.\nניתן לבדוק חיבור לשרת בתחתית האפליקציה.');
        releaseButtons(floorNumber, s = false);
      }
      else { releaseButtons(floorNumber, s = true, 500); }
    });
  }

  const isNoRequests = () => {
    return Object.keys(floorRequests).length === 0;
  }

  useEffect(() => {
    const intervalID = setInterval(() => {
      date = new Date();
      setTime(date.toLocaleTimeString('he-IL'));
    }, 1000);

    return () => clearInterval(intervalID);
  }, []);

  const [fontsLoaded] = useFonts({
    "Rubik-Medium": require("./assets/fonts/Rubik-Medium.ttf")
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  /* [DEVTOOLS] buttons
      <Button title='Delete settings.json file' onPress={deleteFile}></Button>
      <Button title='unsub' onPress={unsubscribeFromTopic}></Button>
      <Button title='Change settings.json file' onPress={changeSettingsFile}></Button>
  */

  if (isMalitan)
  return (
    <SafeAreaView style = {{flex: .69}} onLayout={onLayoutRootView}>
      <View style={styles.switchContainer}>
        {isEnabled !== null ? <Switch style={styles.switch} value={isEnabled !== 'null' ? isEnabled : true} trackColor={{false: '#767577', true: '#81b0ff'}} thumbColor={isEnabled ? '#4b78f5' : '#f4f3f4'} ios_backgroundColor="#3e3e3e" onValueChange={(value) => toggleSwitch(value)}></Switch> : <Text>טוען...</Text>}
        <Text style={styles.switchDetailsText}>הפעל / כבה קריאות:</Text>
      </View>
      <Text style={styles.timeText}>{time}</Text>
        {isNoRequests() ? <Text style={styles.noRequestsText}>אין לך קריאות חדשות כרגע.</Text> : null}
          {renderFloorRequests()}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
  else if (!isMalitan)
  return (
    <SafeAreaView style = {{flex: .69}} onLayout={onLayoutRootView}>
      <Text style={styles.welcomeText}>הזמן מעליתן לפי הקומה הדרושה לך:</Text>
      <View style={styles.wrapper}>
        <ScrollView style={styles.scroll_view}>
          {renderFloorsButtons()}
        </ScrollView>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Rubik-Medium',
    color: 'black',
    fontSize: 12,
  },
  welcomeText: {
    fontFamily: 'Rubik-Medium',
    color: 'black',
    fontSize: 18,
  },
  wrapper: {
    borderWidth: 3,
    borderRadius: 10,
    flex: .95,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '10%'
  },
  scroll_view: {
    //backgroundColor: 'black',
    padding: '2.5%',
    paddingHorizontal: '18%',
  },
  floorButton: {
    height: 100,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    elevation: 5,
    backgroundColor: '#2196F3',
    marginBottom: '8%',
  },
  buttonText: {
    fontFamily: 'Rubik-Medium',
    color: 'white',
    fontSize: 25,
  },
  noRequestsText: {
    fontFamily: 'Rubik-Medium',
    color: 'gray',
    fontSize: 16,
    marginVertical: '12%',
    right: I18nManager.isRTL ? '8%' : '-8%'
  },
  timeText: {
    fontFamily: 'Rubik-Medium',
    color: 'white',
    backgroundColor: '#1f1f1f',
    fontSize: 42,
    textAlign: 'center',
    borderRadius: 15,
    marginHorizontal: '-2%',
    marginVertical: '-2%'
  },
  switch: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }]
  },
  switchDetailsText: {
    fontFamily: 'Rubik-Medium',
    color: 'black',
    fontSize: 18,
    marginHorizontal: '5%'
  },
  switchContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: '6%',
  }
});