import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import React, {useState} from 'react';
import { MaterialIcons } from '@expo/vector-icons'; 
import { StyleSheet, Text, View, Image, SafeAreaView, TextInput, TouchableOpacity, Button, Alert } from 'react-native';

const checkPinCode = (pinGiven) => {
  switch (pinGiven) {
    case '9999':
      return true;
    case '':
      Alert.alert('קוד אימות מעליתן','הנך מחוייב להזין קוד אימות למעליתן!');
      return false;
    default:
      Alert.alert('קוד אימות מעליתן','קוד האימות שהזנת אינו תקין!');
  }
}

export default function Register({ navigateToMain }) {
  const [isElevatorMan, setIsElevatorMan] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [pin, setPin] = useState('');

  const canProceed = isElevatorMan != null && textInput.trim(' ') != ''

  const proceed = () => {
    if (isElevatorMan === true && !checkPinCode(pin)) return;
    console.log('proceeding!');
    navigateToMain(textInput, isElevatorMan);
  }

  const chooseElvMan = (proptype) => {
    setIsElevatorMan(proptype);
  };
  const [loaded] = useFonts({
    rubikmedium: require('./assets/fonts/Rubik-Medium.ttf'),
  });
  if (!loaded) return null;

  return (
    <SafeAreaView style = {{flex: .69}}>
        <Text style={styles.text1}>שלום! כדי להתחיל, הזן את הנתונים הבאים:</Text>
        <TextInput style={styles.input} placeholder='הזן את שמך המלא' value={textInput} onChangeText={(text) => setTextInput(text)}></TextInput>
        {textInput.trim(' ') != '' ? null : <Text style={styles.mustText}>שדה זה הינו חובה</Text>}
        <Text style={styles.text2}>האם הינך מעליתן?</Text>
        <View style={styles.buttonAlignment}>
          <TouchableOpacity style={[styles.chooseButton, isElevatorMan === true ? styles.selectedButton : null]} onPress={() => chooseElvMan(true)}>
            <Text style={styles.buttontext}>כן</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.chooseButton, isElevatorMan === false ? styles.selectedButton : null]} onPress={() => chooseElvMan(false)}>
            <Text style={styles.buttontext}>לא</Text>
          </TouchableOpacity>
        </View>
        {isElevatorMan === true ? <View style={styles.shrink}><TextInput style={styles.codeInput} value={pin} onChangeText={setPin} keyboardType='numeric' maxLength={4} placeholder='הזן קוד אימות'></TextInput></View> : null}
        <TouchableOpacity style={[styles.goButton, canProceed ? null : styles.goButtonCanceled]} activeOpacity={canProceed ? 0.2 : 1} onPress={canProceed ? proceed : null}>
          <Text style={styles.buttontext}>
          <MaterialIcons name="navigate-before" size={20} color="white"/> יאללה, הבא</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: '#f5f5f5',
        marginTop: 20,
        height: 45,
        borderWidth: 2,
        padding: 10,
        borderRadius: 10
    },
    codeInput: {
        borderWidth: 2,
        borderRadius: 20,
        textAlign: 'center',
        fontSize: 22,
        marginTop: '10%',
        padding: 10,
    },
    shrink: {
        paddingHorizontal: '18%',
    },
    text1: {
        fontFamily: 'rubikmedium',
        fontSize: 18,
        //marginBottom: '38%',
    },
    mustText: {
        fontFamily: 'rubikmedium',
        fontSize: 12,
        color: 'red',
        padding: 5
    },
    text2: {
        fontFamily: 'rubikmedium',
        fontSize: 22,
        marginTop: '12%',
        textAlign: 'center'
    },
    buttonAlignment: {
        flexDirection: 'row', // Arrange children components horizontally
        justifyContent: 'space-around', // Adjust this as needed for spacing
        alignItems: 'center', // Align items vertically in the center
    },
    chooseButton: {
      flex: 1,
      backgroundColor: '#5969f7',
      padding: 10,
      borderWidth: 1,
      marginTop: 10,
      margin: 5,
      borderRadius: 5
    },
    selectedButton: {
      backgroundColor: '#67f04f'
    },  
    buttontext: {
      fontFamily: 'rubikmedium',
      textAlign: 'center',
      color: 'white',
      fontSize: 20,
    },
    goButton: {
      backgroundColor: '#5969f7',
      padding: 10,
      borderWidth: 1,
      marginTop: '15%',
      margin: 60,
      borderRadius: 20
    },
    goButtonCanceled: {
      backgroundColor: '#ababab' 
    }
});