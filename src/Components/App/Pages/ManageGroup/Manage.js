import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHandle, PageHeader, SubPage } from "../../Page";
import { BackArrow, Icon, Profile } from "../../common";
import Transition from "../../Transition";
import Permissions from "./Permissions";
import { client, socket } from "../../../../App";
import { setChat, setFullChat } from "../../../Stores/Chats";
import { setActiveChat, setActiveFullChat } from "../../../Stores/UI";
import Administrators from "./Administrators";
import Members from "./Members";
import { Api } from "telegram";

export default function ManageGroup() {
    const dispatch = useDispatch()

    const subPage = useSelector((state) => state.ui.subPage)
    const activeChat = useSelector((state) => state.ui.activeChat)
    const fullChat = useSelector((state) => state.ui.activeFullChat)
    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const [isLoaded, setIsLoaded] = useState(false)
    const [hasChanged, setHasChanged] = useState(false)
    const [title, setTitle] = useState(activeChat.title)
    const [username, setUsername] = useState(fullChat.username)
    const [bio, setBio] = useState(fullChat.about)

    useEffect(() => {
        if (title === activeChat.title && username === fullChat.username && bio === fullChat.about)
            setHasChanged(false)
        else
            setHasChanged(true)
    }, [title, username, bio])

    const applyChanges = useCallback(async () => {
        // Edit Chat Title
        if (title !== activeChat.title) {
            const editChatTitle = await client.invoke(new Api.messages.EditChatTitle({
                chatId: activeChat.entity.id,
                title
            }))

            console.log(editChatTitle)
        }

        // Edit Chat About
        if (bio !== fullChat.about) {
            const editChatAbout = await client.invoke(new Api.messages.EditChatAbout({
                peer: activeChat.entity.id,
                about: bio
            }))

            console.log(editChatAbout)
        }

        const updatedFullChat = {
            ...fullChat.fullChat,
            about: bio
        }

        dispatch(setFullChat({ chatId: activeChat.id.value, fullChat: updatedFullChat }))
        dispatch(setActiveFullChat(updatedFullChat))

        PageClose(dispatch, true)
    }, [title, username, bio])

    const getSubPageLayout = useCallback(() => {
        switch (subPage[1]?.page) {
            case 'Reactions':
                return <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', width: '100%', height: '100%' }}>There is nothing here yet :(</div>
            case 'Permissions':
                return <Permissions />
            case 'Administrators':
                return <Administrators />
            case 'Members':
                return <Members />
            default:
                break;
        }
    }, [subPage])

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    return <>
        <div className={"ManageGroup" + (!isLoaded ? ' fadeThrough' : '') + (subPage[1] ? ' pushUp' : '')}>
            <PageHeader key={subPage[1] + title + username + bio + hasChanged}>
                <div><BackArrow index={1} onClick={() => PageClose(dispatch, true)} isiOS={centerTopBar} /></div>
                <div className="Title"><span>Manage</span></div>
                <div className="Meta">
                    <button className={hasChanged ? '' : 'disabled'} onClick={applyChanges}>Apply</button>
                </div>
            </PageHeader>
            <div className="section">
                <div className="Group">
                    <Profile entity={activeChat.entity} name={title} id={activeChat.entity.id} />
                    <div className="Items">
                        <div className="Item textfield"><input type="text" value={title} onInput={(e) => setTitle(e.target.value)} placeholder="Enter group name" /></div>
                    </div>
                </div>
            </div>
            <div className="section Info">
                <div className="Items">
                    <div className="Item"><Icon name="alternate_email" /><div className="textfield"><input type="text" value={username} onInput={(e) => setUsername(e.target.value)} placeholder="Username (Optional)" /></div></div>
                    <div className="Item"><Icon name="info" /><div className="textfield"><input type="text" value={bio} onInput={(e) => setBio(e.target.value)} placeholder="Bio (Optional)" /></div></div>
                </div>
            </div>
            <div className="section">
                <div className="Items">
                    <div className="Item" onClick={() => PageHandle(dispatch, 'Reactions', 'Reactions', true)}><Icon name="favorite" /><span>Reactions</span></div>
                    <div className="Item" onClick={() => PageHandle(dispatch, 'Permissions', 'Permissions', true)}><Icon name="key" /><span>Permissions</span></div>
                    <div className="Item" onClick={() => PageHandle(dispatch, 'Administrators', 'Administrators', true)}><Icon name="local_police" /><span>Administators</span></div>
                    <div className="Item" onClick={() => PageHandle(dispatch, 'Members', 'Members', true)}><Icon name="group" /><span>Members</span></div>
                </div>
            </div>
        </div>
        <Transition state={subPage[1]}><SubPage>{getSubPageLayout()}</SubPage></Transition>
    </>
}