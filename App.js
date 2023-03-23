import ToastManager, { Toast } from 'toastify-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { StyleSheet, Text, View } from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import *  as Location from 'expo-location';
import { useFonts } from 'expo-font';
import api from './tools/api';
import React from 'react';

export default function App() {

  // VARIABLES
  const [location, setLocation] = React.useState(null);
  const [weather, setWeather] = React.useState(null);

  const [loaded] = useFonts({
    'Nunito-Regular': require('./assets/fonts/Nunito/static/Nunito-Regular.ttf'),
    'Nunito-Bold': require('./assets/fonts/Nunito/static/Nunito-Bold.ttf'),
  });

  // GET WEATHER
  const getWeather = async () => {
    api.get(`current.json?key=fd49c88d2894495684f122240232303&q=${location.coords.latitude},${location.coords.longitude}&aqi=no&lang=pt`)
      .then((response) => {
        setWeather(response.data);
      })
      .catch((error) => {
        Toast.error(error.response.data.message);
      })
  }

  // FUNCTIONS
  function getLocation() {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.error('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }

  // USE EFFECT
  React.useEffect(() => {
    if (location) getWeather();
    getLocation();
  }, [location]);

  if (!loaded) {
    return null;
  }
  return (
    <View style={styles.container}>
      <ToastManager />
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={[styles.titleHeader, { fontFamily: 'Nunito-Regular' }]}>{weather?.location.name}, {weather?.location.region}</Text>
        <Text style={[styles.subtitleHeader, { fontFamily: 'Nunito-Regular' }]}>{weather?.location.country}</Text>
      </View>
      <View style={styles.main}>
        <Text style={[styles.titleMain, { fontFamily: 'Nunito-Bold' }]}>{weather?.current.temp_c}°C</Text>
        {/* <Text style={[styles.subtitleMain, { fontFamily: 'Nunito-Regular' }]}>{weather?.current.condition.text}</Text> */}
        <View style={styles.wind}>
          <Fontisto name="wind" size={25} color="#588157" />
          <Text style={[styles.textWind, { fontFamily: 'Nunito-Regular' }]}>{weather?.current.wind_kph}m/s</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.titleFooter, { fontFamily: 'Nunito-Regular' }]}>Footer</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dad7cd',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleHeader: {
    color: '#588157',
    fontSize: RFValue(14),
  },
  subtitleHeader: {
    color: '#588157',
    fontSize: RFValue(12),
  },
  main: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleMain: {
    color: '#344e41',
    fontSize: RFValue(70),
  },
  subtitleMain: {
    color: '#588157',
    fontSize: RFValue(12),
  },
  wind: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  textWind: {
    color: '#588157',
    fontSize: RFValue(12),
    marginLeft: 5,
  }
});
