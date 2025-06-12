import './App.css';
import './assets/styles/Material Symbol Rounded.css';
import './Mobile.css';
import { Auth } from './Components/Auth/Auth';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import packageInfo from '../package.json';
import { GetDeviceData } from './Components/Auth/Verify';

const getSession = () => {
  try {
    return new StringSession(localStorage.getItem('auth_key'))
  } catch (error) {
    console.log(error)
  }
  return new StringSession('')
}

const SESSION = getSession()
export const API_ID = import.meta.env.VITE_API_ID
export const API_HASH = import.meta.env.VITE_API_ID

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
