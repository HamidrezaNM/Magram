import { memo, useContext, useEffect, useRef, useState } from "react";
import { AuthContext, UserContext } from "../Auth/Auth";
import { toDoubleDigit } from "./Home";
import { client } from "../../App";
import Chat, { ChatsLoading } from "./Chat";
import { useDispatch, useSelector } from "react-redux";
import { setChats } from "../Stores/Chats";
import { setActiveChat } from "../Stores/UI";
import buildClassName from "../Util/buildClassName";
import Tabs from "../UI/Tabs";
import { Api } from "telegram";
import { getPeerId } from "../Helpers/chats";
import TabContent from "../UI/TabContent";
import ContextMenu from "./MiddleColumn/ContextMenu";

function ChatList() {
    const [showArchives, setShowArchives] = useState(false)
    const [folderTabIndex, setFolderTabIndex] = useState(0)
    const [folders, setFolders] = useState([])

    const ChatListRef = useRef()

    const Auth = useContext(AuthContext);
    const User = useContext(UserContext);

    const dispatch = useDispatch()

    const chats = useSelector((state) => state.chats.value)

    const activeChatId = useSelector((state) => state.ui.activeChat?.id)

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
                const getFolders = await client.invoke(new Api.messages.GetDialogFilters())
                setFolders(getFolders.filters)

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

    const renderFolderChats = (index) => {
        const folder = folders[index]

        let folderChats = []

        const includePeerIds = folders &&
            index !== 0 &&
            folder.includePeers.length &&
            folder.includePeers.map(
                peer =>
                    getPeerId(peer)
            )

        const includePeerChats = includePeerIds &&
            allChats.filter(chat =>
                includePeerIds.includes(chat.entity?.id?.value))

        folderChats = includePeerChats

        if (folder.excludeRead) {
            let chats = folderChats?.length > 0 ? folderChats : allChats

            folderChats = chats.filter(chat => chat.unreadCount !== 0)
        }

        if (folder.excludeArchived) {
            let chats = folderChats?.length > 0 ? folderChats : allChats

            folderChats = chats.filter(chat => !chat.archived)
        }

        return folderChats?.length ? folderChats.map((item) => (
            !item.entity?.migratedTo &&
            <Chat
                key={item.id?.value}
                info={item}
                isActive={Number(activeChatId) == item.id.value}
            />
        ))
            : null
    }

    return <div className="ChatList" ref={ChatListRef}>
        <Tabs index={folderTabIndex} setIndex={setFolderTabIndex} tabs={<>
            {folders.map((folder, index) =>
                <div className={buildClassName(
                    "Tab",
                    folderTabIndex === index &&
                    'active'
                )} onClick={() => setFolderTabIndex(index)}>
                    <span>{folder?.title?.text ?? 'All Chats'}</span>
                </div>
            )}
        </>
        }>
            <TabContent state={folderTabIndex === 0 || true} key={1}>
                {archives?.length > 0 && <div className="Archives">
                    <div className={buildClassName("Chat showAnim", showArchives && 'active')} onClick={() => { setShowArchives(!showArchives); ChatListRef.current.classList.add('Animating') }}>
                        <div className="body">
                            <div className="info">
                                <div className="title">Archived Chats</div>
                            </div>
                        </div>
                    </div>
                </div>}
                {allChats.filter(chat => !!chat.archived === showArchives).map((item) => (
                    !item.entity?.migratedTo &&
                    <Chat
                        key={item.id?.value}
                        info={item}
                        isActive={Number(activeChatId) == item.id.value}
                    />
                ))}
                {Object.keys(chats).length === 0 &&
                    <ChatsLoading />
                }
            </TabContent>
            {folders.map((folder, index) =>
                index !== 0 &&
                <TabContent state={folderTabIndex === index || true} key={folder.id}>
                    {renderFolderChats(index)}
                    {Object.keys(chats).length === 0 &&
                        <ChatsLoading />
                    }
                </TabContent>
            )}
        </Tabs>
        <ContextMenu type="chat" />
    </div>
}

export default memo(ChatList)

export function viewChat(data, dispatch) {
    dispatch(setActiveChat({ data, whenNeeded: true }));
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
