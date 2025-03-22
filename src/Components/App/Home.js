import { createContext, memo, useCallback, useEffect, useState } from "react";
import ChatList from "./ChatList";
import { Icon, Profile } from "./common";
import './LeftColumn.css'
import './MiddleColumn.css'
import '../../MATheme.css'
import { useRef } from "react";
import { useContext } from "react";
import { AuthContext, UserContext } from "../Auth/Auth";
import Message from "./Message";
import { client, socket } from "../../App";
import DropdownMenu from "../UI/DropdownMenu";
import MenuItem from "../UI/MenuItem";
import Menu from "../UI/Menu";
import Transition from "./Transition";
import Page, { PageHandle } from "./Page";
import Settings from "./Settings";
import './Settings.css'
import { Skeleton, ThemeProvider, createTheme } from "@mui/material";
import MessagesLoading from "../UI/MessagesLoading";
import Messages from "./Messages";
import ChatContextProvider, { ChatContext } from "./ChatContext";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "../Stores/store";
import { handleCachedMessages, handleMessageError, messageAdded, setMessages, updateMessageId, updateMessageMediaUploadProgress, updateMessageSeen, updateMessageText } from "../Stores/Messages";
import { handleBackground, handleCall, handleCloseCall, handleContextMenu, handleEditMessage, handlePage, handlePageClose, handlePinnedMessage, handleReplyToMessage, handleThread, handleToggleDarkMode, handleTopbarTitleChange, handleUserProfile, setActiveChat, updateActiveChatPermissions } from "../Stores/UI";
import { chatAdded, handleCachedChats, setChat, setChats, updateLastMessage, updateTypingStatus } from "../Stores/Chats";
import EmojiData from '@emoji-mart/data/sets/14/apple.json'
import Picker from '@emoji-mart/react'
import { Emoji } from "emoji-mart";
import ContentEditable from "../common/WrappedContentEditable";
import MessageText from "./MessageText";
import { IKContext, IKUpload } from "imagekitio-react";
import NewGroup from "./Pages/NewGroup";
import ChatProfile from "./Pages/ChatProfile";
import UserProfile, { showUserProfile } from "./Pages/UserProfile";
import Search from "./Pages/Search";
import Call from "./Call/Call";
import CallMinimal from "./Call/CallMinimal";
import VoiceChat from "./VoiceChat/VoiceChat";
import MediaPreview from "./MediaPreview";
import { getChatData } from "./Chat";
import LeftColumn from "./LeftColumn";
import ChatInfo from "./MiddleColumn/ChatInfo";
import PinnedMessage from "./MiddleColumn/PinnedMessage";
import Composer from "./MiddleColumn/Composer";
import ContextMenu from "./MiddleColumn/ContextMenu";
import MessagesHandler from "./Handlers/MessagesHandler";
import ChatHandler from "./Handlers/ChatHandler";
import { NewMessage } from "telegram/events";
import { Api } from "telegram";
import { UpdateConnectionState } from "telegram/network";
import { readHistory } from "../Util/messages";
import Thread from "./MiddleColumn/Thread";
import MiddleColumn from "./MiddleColumn";

export const urlEndpoint = 'https://ik.imagekit.io/b4acyrnt3';
export const publicKey = 'public_2eNXL57bxEZ/Rt0HN1o55o4WPD4=';

function Home() {
    const [backgroundAngle, setBackgroundAngle] = useState(120);
    const [msgsScrollTop, setMsgsScrollTop] = useState(0);
    const [messageUploading, setMessageUploading] = useState();
    const [callState, setCallState] = useState({});
    const [connectionState, setConnectionState] = useState('connected');

    const Auth = useContext(AuthContext);
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

    const activeChat = useSelector((state) => state.ui.value.activeChat)
    const thread = useSelector((state) => state.ui.value.thread)
    const page = useSelector((state) => state.ui.value.page)
    const showCall = useSelector((state) => state.ui.value.showCall)
    const callMinimal = useSelector((state) => state.ui.value.callMinimal)
    const callMaximized = useSelector((state) => state.ui.value.callMaximized)
    const callLeftPanelClose = useSelector((state) => state.ui.value.callLeftPanelClose)
    const background = useSelector((state) => state.ui.value.background)
    const mediaPreview = useSelector((state) => state.ui.value.mediaPreview)
    const darkMode = useSelector((state) => state.ui.value.darkMode)

    useEffect(() => {
        requestAnimationFrame(() => {
            homeRef.current.classList.remove('animate')
        })

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches !== darkMode) {
            dispatch(handleToggleDarkMode())
        }
    }, [])

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
            if (window.location.hash?.split('#')[1] != activeChat?.id.value) {
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

        message._sender = await message.getSender()

        console.log(chatId, chats)

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


        console.log(event)
        // if (!User._id || User._id === message.fromId && message.type !== 'call') return
        dispatch(messageAdded(message));
        dispatch(updateLastMessage({ id: chatId, message, unread: User.id.value !== message._senderId.value }))
        if (chatId == activeChat?.id.value)
            readHistory(activeChat.id.value, dispatch)
        else if (!message.chat?.left && !chats[message.chat?.id?.value].dialog?.notifySettings?.muteUntil) {
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
    }, [User, activeChat, chats, isWindowFocused.current]) // onNewMessage

    const onMessageAction = (response) => {
        const chat = Object.values(chats).find((obj) => obj._id === response.chatId)
        var typingStatus = chat.typingStatus ?? []
        dispatch(updateTypingStatus({ chatId: response.chatId, typingStatus: [...typingStatus, response.user.firstname] }))
    }

    useEffect(() => {
        socket.on('MessageAction', onMessageAction)
        return () => {
            socket.off('MessageAction', onMessageAction)
        }
    }, [User, chats]) // onReceiveMessage

    const onIncomingCall = (call) => {
        if (!User._id || User._id === call.fromId) return
        const to = Object.values(chats).find((obj) => obj.to?._id === call.fromId).to
        flashTitle(`Incoming Call - ${to.firstname}`)
        dispatch(handleCall({ ...call, ...to, incoming: true }));
    }

    useEffect(() => {
        socket.on('IncomingCall', onIncomingCall)
        return () => {
            socket.off('IncomingCall', onIncomingCall)
        }
    }, [User, chats, isWindowFocused.current]) // onIncomingCall

    const flashTitle = (newTitle) => {
        console.log(isWindowFocused.current)
        if (isWindowFocused.current) return
        flashTitleInterval.current = setInterval(() => {
            document.title === 'Magram'
                ? (document.title = newTitle)
                : (document.title = 'Magram');
        }, 1000);
    }

    const handleUpdateGroupPermissions = (response) => {
        if (response.data) {
            response = response.data
        }
        dispatch(setChat(response))
        if (response._id === activeChat?._id)
            dispatch(updateActiveChatPermissions(response.permissions))
    }

    useEffect(() => {
        socket.on('UpdateGroupPermissions', handleUpdateGroupPermissions)
        return () => socket.off('UpdateGroupPermissions', handleUpdateGroupPermissions)
    }, [User, chats, activeChat])

    useEffect(() => {
        document.querySelector('.App').classList.toggle('Dark', darkMode)
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
            if (update.constructor === UpdateConnectionState) {
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

    useEffect(() => {
        if (lastSeenInterval.current) clearInterval(lastSeenInterval.current)

        if (isWindowFocused.current) {
            socket.emit('UpdateLastSeen', { token: Auth.authJWT })
            lastSeenInterval.current = setInterval(() => {
                socket.emit('UpdateLastSeen', { token: Auth.authJWT })
            }, 30000);
        }
    }, [Auth, isWindowFocused.current])

    console.log('Home Rerendered')
    return (
        <ThemeProvider theme={darkTheme}>
            <IKContext publicKey={publicKey} urlEndpoint={urlEndpoint}>
                <div className="Home animate" ref={homeRef}>
                    <LeftColumn CallRef={CallRef} CallStream={CallStream} callState={callState} connectionState={connectionState} />
                    <Transition state={showCall} action={() => dispatch(handleCall())}>
                        <Call ref={CallRef} CallStream={CallStream} setCallState={setCallState} />
                    </Transition>
                    <div className={`MiddleColumn ${activeChat ? 'active' + (!page ? ' focused' : '') : ''} ${(showCall && !callMinimal) ? 'C' : ''} ${callLeftPanelClose ? 'L' : ''} ${callMaximized ? 'X' : ''} `}>
                        <MiddleColumn />
                    </div>

                    <Transition state={mediaPreview?.active} eachElement>
                        <MediaPreview />
                    </Transition>

                    <ContextMenu />
                    {background &&
                        <div className="bg animate" ref={_bg} onClick={() => { dispatch(handleBackground()); background?.onClick() }}></div>}
                </div>

                {/* Handlers */}
                <ChatHandler />
                <MessagesHandler />
            </IKContext>
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