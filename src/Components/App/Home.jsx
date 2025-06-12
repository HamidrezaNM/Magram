import { memo, useEffect, useState } from "react";
import './LeftColumn.css'
import './MiddleColumn.css'
import '../../MATheme.css'
import '../../CustomTheme.scss'
import { useRef } from "react";
import { useContext } from "react";
import { UserContext } from "../Auth/Auth";
import { client } from "../../App";
import Transition from "./Transition";
import './Settings.css'
import { ThemeProvider, createTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { handleCachedMessages, messageAdded } from "../Stores/Messages";
import { handleBackground, handleCall, setActiveChat } from "../Stores/UI";
import { chatAdded, handleCachedChats, updateLastMessage } from "../Stores/Chats";
import Call from "./Call/Call";
import VoiceChat from "./VoiceChat/VoiceChat";
import MediaPreview from "./MediaPreview";
import LeftColumn from "./LeftColumn";
import { NewMessage } from "telegram/events";
import { UpdateConnectionState } from "telegram/network";
import { readHistory } from "../Util/messages";
import MiddleColumn from "./MiddleColumn";
import Toasts from "../UI/Toasts";
import Dialogs from "../UI/Dialogs";
import UpdateManager from "./UpdateManager";
import buildClassName from "../Util/buildClassName";
import { handleToggleDarkMode } from "../Stores/Settings";
import DeleteEffect from "../common/DeleteEffect";
import CallHeader from "./CallHeader";
import StoryModal from "./StoryModal";

function Home() {
    const [backgroundAngle, setBackgroundAngle] = useState(120);
    const [msgsScrollTop, setMsgsScrollTop] = useState(0);
    const [messageUploading, setMessageUploading] = useState();
    const [callState, setCallState] = useState({});
    const [connectionState, setConnectionState] = useState('Authenticating...');

    const User = useContext(UserContext);

    const isWindowFocused = useRef(true);
    const homeRef = useRef();
    const LeftColumnRef = useRef();
    const MiddleColumnRef = useRef();
    const CallRef = useRef();
    const CallStream = useRef();
    const flashTitleInterval = useRef();
    const lastSeenInterval = useRef();
    const _bg = useRef();

    const dispatch = useDispatch()

    const chats = useSelector((state) => state.chats.value)

    const activeChat = useSelector((state) => state.ui.activeChat?.id)
    const thread = useSelector((state) => state.ui.thread)
    const page = useSelector((state) => state.ui.page)
    const storyModal = useSelector((state) => state.ui.storyModal)
    const showCall = useSelector((state) => state.ui.showCall)
    const callMinimal = useSelector((state) => state.ui.callMinimal)
    const callMaximized = useSelector((state) => state.ui.callMaximized)
    const groupCallJoined = useSelector((state) => state.ui.groupCall?.joined)
    const callLeftPanelClose = useSelector((state) => state.ui.callLeftPanelClose)

    const background = useSelector((state) => state.ui.background)
    const darkMode = useSelector((state) => state.settings.darkMode)
    const animations = useSelector((state) => state.settings.animations)
    const customTheme = useSelector((state) => state.settings.customTheme)
    const deleteEffect = useSelector((state) => state.ui.deleteEffect)

    const themeOptions = Object.keys(customTheme).filter(key => customTheme[key]);

    useEffect(() => {
        requestAnimationFrame(() => {
            homeRef.current.classList.remove('animate')
        })

        if (darkMode === undefined && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches !== darkMode) {
            dispatch(handleToggleDarkMode())
        }
    }, [])

    useEffect(() => {
        window.Animations = animations
    }, [animations])

    useEffect(() => {
        if (customTheme.primaryColor) {
            const rgb = `${customTheme.primaryColor.rgb.r}, ${customTheme.primaryColor.rgb.g}, ${customTheme.primaryColor.rgb.b}`

            document.querySelector(':root').style.setProperty('--primary', customTheme.primaryColor.hex)
            if (darkMode)
                document.querySelector('.Dark').style.setProperty('--primary', customTheme.primaryColor.hex)
            if (customTheme.iOSTheme)
                document.querySelector('.iOSTheme').style.setProperty('--primary', customTheme.primaryColor.hex)

            document.querySelector(':root').style.setProperty('--primary-rgb', rgb)
            if (darkMode)
                document.querySelector('.Dark').style.setProperty('--primary-rgb', rgb)
        }
        setTimeout(() => {
            homeRef.current.classList.remove('animate')
        }, 300);
    }, [customTheme])

    useEffect(() => {
        const _chats = localStorage.getItem("chats")
        const _messages = localStorage.getItem("messages")

        if (_chats) {
            dispatch(handleCachedChats(JSON.parse(_chats)))
        }

        if (_messages) {
            dispatch(handleCachedMessages(JSON.parse(_messages)))
        }
    }, [])

    useEffect(() => {
        window.onhashchange = () => {
            if (window.location.hash?.split('#')[1] != Number(activeChat)) {
                // if (document.querySelector('.backBtn')) {
                //     document.querySelector('.backBtn').click()
                // } else
                dispatch(setActiveChat())
            }
        }
    }, [activeChat, thread, window.location.hash])


    const onNewMessage = async (event) => {
        const message = event.message
        const chatId = message.chatId

        dispatch(messageAdded(message));

        console.log(event)

        message._sender = await message.getSender()

        if (chatId && !chats[chatId]) {
            await message.getChat()

            if (message.chat && !message.chat.left) {
                const chat = {
                    id: { value: chatId },
                    entity: message.chat,
                    message,
                    title: message.chat.title ?? message.chat.firstName,
                    date: message.date,
                    isChannel: message.isChannel,
                    isGroup: message.isGroup,
                    isUser: message.isPrivate
                }

                dispatch(chatAdded(chat))
            }
        }

        // if (!User._id || User._id === message.fromId && message.type !== 'call') return

        if (thread && (thread.id === message.replyTo?.replyToMsgId || thread.id === message.replyTo?.replyToTopId)) {
            console.log('new comment')
            dispatch(messageAdded({ ...message, chatId: thread.chatId?.value + '_' + thread.id }));
        }
        dispatch(updateLastMessage({ id: chatId, message, unread: User.id.value !== message._senderId.value }))
        if (chatId == Number(activeChat))
            readHistory(Number(activeChat), dispatch)
        else if (!message.chat?.left && !chats[message.chat?.id?.value]?.dialog?.notifySettings?.muteUntil) {
            if (!isWindowFocused.current)
                notify(chats[chatId]?.title ?? message.chat?.title ?? message.chat?.firstName, {
                    body: (message._sender?.firstName + ': ') + message.text
                })
        }
    }

    useEffect(() => {
        client.addEventHandler(onNewMessage, new NewMessage({}))
        return () => {
            client.removeEventHandler(onNewMessage, new NewMessage({}))
        }
    }, [User, activeChat, chats, thread, isWindowFocused.current]) // onNewMessage

    const onIncomingCall = (call) => {
        if (!User._id || User._id === call.fromId) return
        const to = Object.values(chats).find((obj) => obj.to?._id === call.fromId).to
        flashTitle(`Incoming Call - ${to.firstname}`)
        dispatch(handleCall({ ...call, ...to, incoming: true }));
    }

    const flashTitle = (newTitle) => {
        console.log(isWindowFocused.current)
        if (isWindowFocused.current) return
        flashTitleInterval.current = setInterval(() => {
            document.title === 'Magram'
                ? (document.title = newTitle)
                : (document.title = 'Magram');
        }, 1000);
    }

    // const handleUpdateGroupPermissions = (response) => {
    //     if (response.data) {
    //         response = response.data
    //     }
    //     dispatch(setChat(response))
    //     if (response._id === activeChat?._id)
    //         dispatch(updateActiveChatPermissions(response.permissions))
    // }

    // useEffect(() => {
    //     socket.on('UpdateGroupPermissions', handleUpdateGroupPermissions)
    //     return () => socket.off('UpdateGroupPermissions', handleUpdateGroupPermissions)
    // }, [User, chats, activeChat])

    useEffect(() => {
        document.querySelector('.App').classList.toggle('Dark', darkMode)

        document.querySelector('meta[name=theme-color]').setAttribute('content', darkMode ? '#000000' : '#ffffff')
    }, [darkMode])

    function notify(title, options) {
        if (!("Notification" in window)) {
        } else if (Notification.permission === "granted") {
            const notification = new Notification(title, options);
        } else if (Notification.permission !== "denied") {
            // We need to ask the user for permission
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    const notification = new Notification(title, options);
                }
            });
        }
    }

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            background: {
                paper: '#0e1214'
            }
        },
    });

    useEffect(() => {
        window.addEventListener('focus', () => {
            isWindowFocused.current = true
        })
        window.addEventListener('blur', () => {
            isWindowFocused.current = false
        })

        client.addEventHandler((update) => {
            if (update instanceof UpdateConnectionState) {
                setConnectionState(update.state === 1 ? 'connected' : 'Connecting...')
            }
        });
    }, [])

    useEffect(() => {
        if (isWindowFocused.current && flashTitleInterval.current) {
            clearInterval(flashTitleInterval.current)
            document.title = 'Magram'
        }
    }, [isWindowFocused.current])

    console.log('Home Rerendered')
    return (
        <ThemeProvider theme={darkTheme}>
            <div className={buildClassName('Home', 'animate', themeOptions.join(' '))} ref={homeRef}>
                <div className="Main">
                    <LeftColumn CallRef={CallRef} CallStream={CallStream} callState={callState} connectionState={connectionState} />
                    <Transition state={showCall} action={() => dispatch(handleCall())}>
                        <Call ref={CallRef} CallStream={CallStream} setCallState={setCallState} />
                    </Transition>
                    <div className={buildClassName('MiddleColumn', activeChat && 'active', (activeChat && !page) && 'focused', (showCall && !callMinimal) && 'C', callLeftPanelClose && 'L', callMaximized && 'X')}>
                        <MiddleColumn />
                    </div>
                    {groupCallJoined && <CallHeader />}
                </div>
                {groupCallJoined && <VoiceChat />}

                <MediaPreview />

                {storyModal && <StoryModal stories={storyModal.stories} peerIndex={storyModal.peerIndex} itemIndex={storyModal.itemIndex} />}

                <Toasts />
                <Dialogs />
                {deleteEffect && <DeleteEffect />}
                {background &&
                    <div className="bg animate" ref={_bg} onClick={() => { dispatch(handleBackground()); background?.onClick() }}></div>}
            </div>

            <UpdateManager />
        </ThemeProvider>
    )
}

export default memo(Home)

export const toDoubleDigit = (number) => {
    return number.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
    });
};

export const goToMessage = (messageId) => {
    try {
        const message = document.getElementById(messageId)

        message.scrollIntoView({ block: 'center' })
        message.classList.add('highlight')
        setTimeout(() => {
            message.classList.remove('highlight')
        }, 3000);
    } catch (error) {
        console.log('error:', error)
    }
}