import Welcome from "./Welcome";
import './Auth.css';
import { createContext, useEffect, useState } from "react";
import PhoneNumber from "./PhoneNumber";
import Verify, { GetDeviceData } from "./Verify";
import Register from "./Register";
import Password from "./Password";
import Home from "../App/Home";
import { client, socket } from "../../App";
import ChatContextProvider from "../App/ChatContext";
import { Provider } from "react-redux";
import store from "../Stores/store";
import { LogLevel } from "telegram/extensions/Logger";

export const AuthContext = createContext();
export const UserContext = createContext();

function getScreen({ authState }) {
    switch (authState) {
        case "Welcome":
            return <Welcome />;
        case "authorizationStateWaitPhoneNumber":
            return <PhoneNumber />;
        case "authorizationStateWaitCode":
            return <Verify />;
        case "authorizationStateWaitPassword":
            return <Password />;
        case "authorizationStateWaitRegistration":
            return <Register />;
        default:
            break;
    }
}

export function Auth() {
    const [user, setUser] = useState({ id: 1, firstname: "Test Man" });
    const [authState, setAuthState] = useState("");
    const [authKey, setAuthKey] = useState("");
    const [authPhoneNumber, setAuthPhoneNumber] = useState("");
    const [authCountryCode, setAuthCountryCode] = useState("");
    const [authPhoneCode, setAuthPhoneCode] = useState("");
    const [authPhoneCodeHash, setAuthPhoneCodeHash] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [authJWT, setAuthJWT] = useState("");
    const [device, setDevice] = useState({});

    useEffect(() => {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            //   document.body.classList.add("Dark");
        }

        if (
            localStorage.getItem("authState") === "authorizationStateReady" &&
            localStorage.getItem("auth_key") != ""
        ) {
            VerifySession()
        } else {
            // setAuthState("Authorized");
            setAuthState("Welcome");
            setTimeout(() => {
                // if (authState === "Welcome") {
                // container.current.classList.remove("hidden");
                // }
            }, 300);
        }
    }, []);

    useEffect(() => {
        if (!authKey && !localStorage.getItem("auth_key") && authState === 'authorizationStateReady') VerifySession()
    }, [authState])

    const VerifySession = async () => {
        if (!localStorage.getItem('auth_key')) {
            setAuthState("Welcome")
            localStorage.removeItem('chats')
            localStorage.removeItem('messages')
            return;
        }

        localStorage.removeItem('chats')
        localStorage.removeItem('messages')

        setAuthState("authorizationStateReady");

        await client.connect()

        try {
            const getMe = await client.getMe()

            client.addEventHandler((update) => console.log(update));

            console.log(getMe)
            setUser(getMe)

            setAuthState("authorizationStateReady");
        } catch (error) {
            if (error.errorMessage === 'AUTH_KEY_UNREGISTERED') {
                localStorage.removeItem('auth_key')
                setAuthState("Welcome")
            }
        }

        // setUser
        //     if (localStorage.getItem("user_auth")) {
        //         setAuthKey(localStorage.getItem("auth_key"));
        //         setAuthState("authorizationStateReady");
        //         setUser(localStorage.getItem("user_auth"))
        //     }
        //     socket.emit('VerifySession', { session: localStorage.getItem("auth_key") })
        //     socket.on('VerifySession', (response) => {
        //         console.log(response)
        //         if (response.ok) {
        //             GetDeviceData(true).then(data => setDevice({ ...data, sessionId: response.data.sessionId }))
        //             setAuthJWT(response.data.token)
        //             setAuthKey(localStorage.getItem("auth_key"));
        //             setAuthState("authorizationStateReady");
        //             socket.emit('GetMe', { token: response.data.token })
        //             socket.on('GetMe', (data) => {
        //                 data.ok && setUser(data.data)
        //                 data.ok && localStorage.setItem("user_auth", JSON.stringify(data.data))
        //             })
        //         } else if (response.errorCode === 403) {
        //             console.log(response)
        //             setAuthState("Welcome")
        //         }
        //     })
    }

    return <>
        <AuthContext.Provider
            value={{
                authState,
                setAuthState,
                authKey,
                setAuthKey,
                authPhoneNumber,
                setAuthPhoneNumber,
                authCountryCode,
                setAuthCountryCode,
                authPhoneCode,
                setAuthPhoneCode,
                authPhoneCodeHash,
                setAuthPhoneCodeHash,
                authPassword,
                setAuthPassword,
                authJWT,
                device,
                setDevice
            }}
        >
            <UserContext.Provider value={user}>
                {authState === 'authorizationStateReady' ? <Provider store={store}><Home /></Provider> :
                    (<><div className="background"></div>
                        <div className="Auth container">
                            {getScreen({ authState })}
                        </div></>)
                }
            </UserContext.Provider>
        </AuthContext.Provider>
    </>
}

export async function AuthComplete(Auth, data) {
    let deviceData = await GetDeviceData(true);

    Auth.setAuthState('authorizationStateReady')
    Auth.setAuthKey(data)
    Auth.setDevice(deviceData)
    localStorage.setItem("auth_key", data);
    localStorage.setItem("authState", "authorizationStateReady");
}