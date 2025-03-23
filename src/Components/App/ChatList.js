import { memo, useContext, useEffect, useRef, useState } from "react";
import { AuthContext, UserContext } from "../Auth/Auth";
import { toDoubleDigit } from "./Home";
import { client, socket } from "../../App";
import Chat, { ChatsLoading } from "./Chat";
import { useDispatch, useSelector } from "react-redux";
import { setChats } from "../Stores/Chats";
import { setActiveChat } from "../Stores/UI";
import { Icon } from "./common";
import buildClassName from "../Util/buildClassName";

function ChatList() {
    const [showArchives, setShowArchives] = useState(false)

    const ChatListRef = useRef()

    const Auth = useContext(AuthContext);
    const User = useContext(UserContext);

    const dispatch = useDispatch()

    const chats = useSelector((state) => state.chats.value)

    const activeChat = useSelector((state) => state.ui.activeChat)

    const allChats = Object.values(chats).sort((a, b) => {
        if (a.message?.date > b.message?.date) {
            return -1;
        }
        if (a.message?.date < b.message?.date) {
            return 1;
        }
        return 0;
    })

    const archives = allChats.filter((chat) => chat.archived)

    console.log('ChatList Rerendered')

    useEffect(() => {
        (async () => {
            try {
                const getChats = await client.getDialogs()
                ChatListRef.current.classList.add('Animating')
                dispatch(setChats(getChats))
            } catch (error) {
                console.log(error)
            }
        })()
    }, [User, Auth.authJWT])

    useEffect(() => {
        if (Object.keys(chats).length > 0) {
            // ChatListRef.current.classList.add('Animating')
            const items = ChatListRef.current.querySelectorAll('.ChatList.Animating .Chat')
            const itemsLength = Object.keys(items).length

            if (itemsLength) {
                Object.values(items).forEach((item, index) => {
                    setTimeout(() => item.classList.add('showAnim'), 20 * index)
                })

                setTimeout(() => {
                    ChatListRef.current?.classList?.remove('Animating')
                }, itemsLength * 20);
            }
        }
    }, [chats, showArchives])

    return <div className="ChatList" ref={ChatListRef}>
        {archives?.length > 0 && <div className="Archives">
            <div className={buildClassName("Chat showAnim", showArchives && 'active')} onClick={() => { setShowArchives(!showArchives); ChatListRef.current.classList.add('Animating') }}>
                {/* <div className="meta">
                    <div className="profile">
                        <Icon name="archive" size={28} />
                    </div>
                </div> */}
                <div className="body">
                    <div className="info">
                        <div className="title">Archived Chats</div>
                    </div>
                    {/* <div className="subtitle">
                        <div className="message-details">salam</div>
                        {info.unreadCount ? info.unreadCount > 0 && <div className={buildClassName('unread', info.dialog?.notifySettings?.muteUntil && 'muted')}>{info.unreadCount}</div> : null}
                    </div> */}
                </div>
            </div>
        </div>}
        {allChats.filter(chat => chat.archived === showArchives).map((item) => (
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
