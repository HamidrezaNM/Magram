import './App.css';
import './assets/styles/Material Symbol Rounded.css';
import './Mobile.css';
import { Auth } from './Components/Auth/Auth';
import { io } from "socket.io-client";
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import packageInfo from '../package.json';
import { GetDeviceData } from './Components/Auth/Verify';

export const socket = io("wss://temp", {
  reconnectionDelayMax: 100,
  reconnection: false
});

const getSession = () => {
  try {
    return new StringSession(localStorage.getItem('auth_key'))
  } catch (error) {
    console.log(error)
  }
  return new StringSession('')
}

const SESSION = getSession()
export const API_ID = process.env.REACT_APP_API_ID
export const API_HASH = process.env.REACT_APP_API_HASH

const deviceData = GetDeviceData()

export const client = new TelegramClient(SESSION, Number(API_ID), API_HASH, {
  appVersion: packageInfo?.version ?? '1.0',
  deviceModel: deviceData.browser + (deviceData.browserMajorVersion ? ' ' + deviceData.browserMajorVersion : ''),
  systemVersion: deviceData.os + (deviceData.osVersion ? ' ' + deviceData.osVersion : '')
})

function App() {
  return (
    <div className="App Dark">
      <div className="background"></div>
      <Auth />
    </div>
  );
}

export default App;
