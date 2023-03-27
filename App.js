import { ActivityIndicator, Text, Provider, DarkTheme, DefaultTheme } from 'react-native-paper';
import { StyleSheet, View, Animated, Dimensions, TouchableOpacity } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ToastManager, { Toast } from 'toastify-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Fontisto, Ionicons } from '@expo/vector-icons';
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
  const [data, setData] = React.useState(null);

  const scrollX = new Animated.Value(0);

  const height = Dimensions.get('window').height;
  const width = Dimensions.get('window').width;

  const [loading, setLoading] = React.useState(true);

  const [mesure, setMesure] = React.useState('C');

  const [isDarkTheme, setIsDarkTheme] = React.useState(false);

  // FONTS
  const [loaded] = useFonts({
    'Nunito-Regular': require('./assets/fonts/Nunito/static/Nunito-Regular.ttf'),
    'Nunito-Bold': require('./assets/fonts/Nunito/static/Nunito-Bold.ttf'),
    'Nunito-Black': require('./assets/fonts/Nunito/static/Nunito-Black.ttf'),
  });

  // THEME
  const CustomDefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#fff',
      text: '#01497c',
      title: '#012a4a',
      card: '#012a4a',
      cardText: '#fff',
      icons: '#01497c',
    }
  }

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme,
      background: '#012a4a',
      text: '#cfcfcf',
      title: '#fff',
      card: '#fff',
      cardText: '#012a4a',
      icons: '#cfcfcf',
    }
  }

  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

  const your_key = 'your_key';

  // GET WEATHER
  const getWeather = async () => {
    api.get(`current.json?key=${your_key}&q=${location.coords.latitude},${location.coords.longitude}&aqi=no&lang=pt`)
      .then((response) => {
        setWeather(response.data);
      })
      .catch((error) => {
        Toast.error(error.response.data.message);
      })
      .finally(() => {
        setLoading(false);
      })
  }

  // GET FORECAST
  const getForecast = async () => {
    api.get(`forecast.json?key=${your_key}&q=${location.coords.latitude},${location.coords.longitude}&days=3&aqi=no&alerts=no&lang=pt`)
      .then((response) => {
        setForecast(response.data);
        setData(response.data.forecast.forecastday[0].hour);
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

  function switchTheme() {
    setIsDarkTheme(!isDarkTheme);
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
    <Provider theme={theme}>
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <ToastManager />
          <StatusBar style="auto" />
          {
            loading
              ?
              <ActivityIndicator size="large" color={theme.colors.primary} />
              :
              <>
                <View style={styles.header}>
                  <TouchableOpacity onPress={() => mesure === 'C' ? setMesure('F') : setMesure('C')}>
                    <Text style={[styles.titleHeader, { fontFamily: 'Nunito-Regular', color: theme.colors.text }]}>{mesure === 'C' ? '°C' : '°F'}</Text>
                  </TouchableOpacity>
                  <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Text style={[styles.titleHeader, { fontFamily: 'Nunito-Regular', color: theme.colors.text }]}>{weather?.location.name}, {weather?.location.region}</Text>
                    <Text style={[styles.subtitleHeader, { fontFamily: 'Nunito-Regular', color: theme.colors.text }]}>{weather?.location.country}</Text>
                  </View>
                  <TouchableOpacity onPress={() => switchTheme()}>
                    <View>
                      {
                        isDarkTheme
                          ?
                          <Ionicons name="ios-sunny-outline" size={22} color={theme.colors.icons} />
                          :
                          <Ionicons name="ios-moon-outline" size={22} color={theme.colors.icons} />
                      }
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={[styles.main, { width: width, height: height / 2 }]}>
                  <Text style={[styles.subtitleMain, { fontFamily: 'Nunito-Regular', color: theme.colors.text }]}>{moment().format('LT')}</Text>
                  <Text style={[styles.titleMain, { fontFamily: 'Nunito-Bold', color: theme.colors.title }]}>{mesure === 'C' ? parseInt(weather?.current.temp_c) : parseInt(weather?.current.temp_f)}{mesure === 'C' ? '°C' : '°F'}</Text>
                  <Text style={[styles.subtitleMain, { fontFamily: 'Nunito-Regular', color: theme.colors.text }]}>{weather?.current.condition.text}</Text>
                  <View style={styles.subInfo}>
                    <View style={{ flexDirection: 'row', marginHorizontal: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="ios-water-outline" size={22} color={theme.colors.icons} />
                      <Text style={[styles.label, { fontFamily: 'Nunito-Regular', color: theme.colors.text }]}>{parseInt(weather?.current.humidity)}%</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginHorizontal: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Fontisto name="wind" size={22} color={theme.colors.icons} />
                      <Text style={[styles.label, { fontFamily: 'Nunito-Regular', color: theme.colors.text }]}>{parseInt(weather?.current.wind_kph)}m/s</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginHorizontal: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Fontisto name="day-sunny" size={22} color={theme.colors.icons} />
                      <Text style={[styles.label, { fontFamily: 'Nunito-Regular', color: theme.colors.text }]}>{parseInt(weather?.current.uv)}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ width: width, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={[{ fontFamily: 'Nunito-Black', color: theme.colors.title, textTransform: 'uppercase', fontSize: RFValue(15), marginVertical: 5 }]}>Temperaturas do dia</Text>
                  <Animated.ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onScroll={() => {
                      Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false })
                    }}
                    scrollEventThrottle={30}
                  >
                    {
                      data?.map((item, index) => {
                        return (
                          <View key={index} style={[styles.block, { width: width / 5.5, height: 90, backgroundColor: theme.colors.card }]}>
                            <Text style={[styles.subtitleBlock, { fontFamily: 'Nunito-Regular', color: theme.colors.cardText }]}>{moment(item.time).format('LT')}</Text>
                            <Text style={[styles.titleBlock, { fontFamily: 'Nunito-Bold', color: theme.colors.cardText }]}>{parseInt(item.temp_c)}°C</Text>
                            <Text style={[styles.subtitleBlock, { fontFamily: 'Nunito-Regular', color: theme.colors.cardText }]}>{item.condition.text}</Text>
                          </View>
                        )
                      })
                    }
                  </Animated.ScrollView>
                </View>
                <View style={styles.footer}>
                  {
                    forecast?.forecast.forecastday.map((item, index) => {
                      return (
                        <View key={index} style={styles.item}>
                          <Text style={[styles.itemText, { fontFamily: 'Nunito-Regular', color: theme.colors.text, width: '60%' }]}>{moment(item.date).format('dddd')}, {moment(item.date).format('DD MMMM')}</Text>
                          <Text style={[styles.itemText, { fontFamily: 'Nunito-Regular', color: theme.colors.text, width: '20%', textAlign: 'center' }]}>{parseInt(item.day.maxtemp_c)}°C</Text>
                          <Text style={[styles.itemText, { fontFamily: 'Nunito-Regular', color: theme.colors.text, width: '20%', textAlign: 'center' }]}>{parseInt(item.day.mintemp_c)}°C</Text>
                        </View>
                      )
                    })
                  }
                </View>
              </>
          }
        </SafeAreaView>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
    width: '100%',
  },
  titleHeader: {
    fontSize: RFValue(14),
  },
  subtitleHeader: {
    fontSize: RFValue(12),
  },
  main: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleMain: {
    fontSize: RFValue(100),
  },
  subtitleMain: {
    fontSize: RFValue(14),
  },
  subInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  label: {
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
    fontSize: RFValue(12),
  },
  block: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderRadius: 10,
  },
  titleBlock: {
    fontSize: RFValue(18),
  },
  subtitleBlock: {
    fontSize: RFValue(8),
    textAlign: 'center',
  },
});
