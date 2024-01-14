import { StyleSheet, Text, View, Image, SafeAreaView } from 'react-native';

export default function ElectraHeader() {
    return (
      <SafeAreaView style={styles.container}>
        <Image style={styles.electraImageFit} source={require('../assets/electra.png')}></Image>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
        flex: .25,
        alignItems: 'center'
      },
    electraImageFit: {
      resizeMode: 'contain',
      width: 160,
      height: 60,
      marginTop: '13%',
    },
  });