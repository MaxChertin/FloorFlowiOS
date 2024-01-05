import { StatusBar } from 'expo-status-bar';
import { useFonts } from "expo-font";
import React from 'react';
import * as FileSystem from 'expo-file-system';
import { StyleSheet, Text, Button, View, Image, SafeAreaView } from 'react-native';

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
const deleteFile = async () => {
  try {
    await FileSystem.deleteAsync(fileUri);
    alert('[DEVTOOLS] Settings.json file deleted successfully!');
  } catch (error) {
    alert('[DEVTOOLS] Error deleting settings.json file: ' + error);
  }
};

export default function Main() {
  const [fontsLoaded] = useFonts({
    "Rubik-Medium": require("./assets/fonts/Rubik-Medium.ttf")
  });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style = {{flex: .69}}>
      <Text style={styles.text}>Ok lets test. press the button</Text>
      <Button title="Google Firebase Cloud Message test" onPress={() => this.socket.emit('clientMessage', 'Holy Shit! I can do that?!') }></Button>
      <Button title='Delete settings.json file' onPress={deleteFile}></Button>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Rubik-Medium',
    fontSize: 20,
    marginTop: 200
  }
});