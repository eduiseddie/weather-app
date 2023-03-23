import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ToastManager, { Toast } from 'toastify-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { StyleSheet, Text, View } from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import *  as Location from 'expo-location';
import { useFonts } from 'expo-font';
import moment from 'moment/moment';
import api from './tools/api';
import 'moment/locale/pt-br';
import React from 'react';
moment.locale('pt-br');

export default function App() {

  // VARIABLES
  const [location, setLocation] = React.useState(null);
  const [forecast, setForecast] = React.useState(null);
  const [weather, setWeather] = React.useState(null);

  // FONTS
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

  // GET FORECAST
  const getForecast = async () => {
    api.get(`forecast.json?key=fd49c88d2894495684f122240232303&q=${location.coords.latitude},${location.coords.longitude}&days=3&aqi=no&alerts=no&lang=pt`)
      .then((response) => {
        setForecast(response.data);
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
    if (location) {
      getWeather();
      getForecast();
    }
    getLocation();
  }, [location]);

  if (!loaded) {
    return null;
  }
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} mode="padding">
        <ToastManager />
        <StatusBar style="auto" />
        <View style={styles.header}>
          <Text style={[styles.titleHeader, { fontFamily: 'Nunito-Regular' }]}>{weather?.location.name}, {weather?.location.region}</Text>
          <Text style={[styles.subtitleHeader, { fontFamily: 'Nunito-Regular' }]}>{weather?.location.country}</Text>
        </View>
        <View style={styles.main}>
          <Text style={[styles.titleMain, { fontFamily: 'Nunito-Bold' }]}>{parseInt(weather?.current.temp_c)}°C</Text>
          <Text style={[styles.subtitleMain, { fontFamily: 'Nunito-Regular' }]}>{weather?.current.condition.text}</Text>
          <View style={styles.wind}>
            <Fontisto name="wind" size={22} color="#588157" />
            <Text style={[styles.textWind, { fontFamily: 'Nunito-Regular' }]}>{weather?.current.wind_kph}m/s</Text>
          </View>
        </View>
        <View style={styles.footer}>
          {
            forecast?.forecast.forecastday.map((item, index) => {
              return (
                <View key={index} style={styles.item}>
                  <Text style={[styles.itemText, { fontFamily: 'Nunito-Regular', width: '60%' }]}>{moment(item.date).format('dddd')}, {moment(item.date).format('DD MMMM')}</Text>
                  <Text style={[styles.itemText, { fontFamily: 'Nunito-Regular', width: '20%', textAlign: 'center' }]}>{parseInt(item.day.maxtemp_c)}°C</Text>
                  <Text style={[styles.itemText, { fontFamily: 'Nunito-Regular', width: '20%', textAlign: 'center' }]}>{parseInt(item.day.mintemp_c)}°C</Text>
                </View>
              )
            })
          }
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dad7cd',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
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
    fontSize: RFValue(100),
  },
  subtitleMain: {
    color: '#588157',
    fontSize: RFValue(14),
  },
  wind: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  textWind: {
    color: '#588157',
    fontSize: RFValue(15),
    marginLeft: 5,
  },
  footer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  itemText: {
    color: '#344e41',
    fontSize: RFValue(12),
  },
});
