import { memo, useContext, useEffect, useState } from "react";
import { AuthContext, UserContext } from "../Auth/Auth";
import { toDoubleDigit } from "./Home";
import { client, socket } from "../../App";
import Chat, { ChatsLoading } from "./Chat";
import { useDispatch, useSelector } from "react-redux";
import { setChats } from "../Stores/Chats";
import { setActiveChat } from "../Stores/UI";
import { Api } from "telegram";

function ChatList() {
    const Auth = useContext(AuthContext);
    const User = useContext(UserContext);

    const dispatch = useDispatch()

    const chats = useSelector((state) => state.chats.value)

    const activeChat = useSelector((state) => state.ui.value.activeChat)

    console.log('ChatList Rerendered')

    useEffect(() => {
        // socket.on('disconnect', () => {
        //     socket.on('connect', () => {
        //         if (Auth.authJWT) {
        //             console.log('Reconnected')
        //             setTimeout(() => {
        //                 socket.emit('GetChats', { token: Auth.authJWT })
        //             }, 1000);
        //         }
        //         socket.off('connect')
        //     })
        // })
        (async () => {
            try {
                const getChats = await client.getDialogs()
                console.log(getChats)
                dispatch(setChats(getChats))
            } catch (error) {
                console.log(error)
            }
        })()
        // if (Auth.authJWT)
        //     socket.emit('GetChats', { token: Auth.authJWT })
        // socket.on('GetChats', (response) => {
        //     if (response && response?.ok) {
        //         dispatch(setChats(response.data))
        //     }
        // })
    }, [User, Auth.authJWT])

    return <div className="ChatList">
        {Object.values(chats).sort((a, b) => {
            if (a.message?.date > b.message?.date) {
                return -1;
            }
            if (a.message?.date < b.message?.date) {
                return 1;
            }
            return 0;
        }).map((item) => (
            !item.entity?.migratedTo && <Chat key={item.id?.value} info={item} isActive={activeChat?.id.value == item.id.value} />
        ))}
        {Object.keys(chats).length === 0 &&
            <ChatsLoading />
        }
    </div>
}

export default memo(ChatList)

export function viewChat(data, dispatch) {
    dispatch(setActiveChat(data));
    if (data.id?.value) {
        window.location.hash = data.id.value
    }
}

function getDateText(date) {
    const _date = new Date(date * 1000);
    const _now = new Date();
    return _now.toLocaleDateString() == _date.toLocaleDateString()
        ? `${toDoubleDigit(_date.getHours())}:${toDoubleDigit(_date.getMinutes())}`
        : _date.toLocaleDateString();
}
