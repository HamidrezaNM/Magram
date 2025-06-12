import { useCallback, useEffect, useState } from "react";
import { BackArrow, Icon, Profile } from "../common";
import './NewGroup.css';
import { PageClose, PageHeader } from "../Page";
import { useDispatch, useSelector } from "react-redux";
import { client } from "../../../App";
import { Api } from "telegram";
import { chatAdded } from "../../Stores/Chats";
import { generateChatWithPeer } from "../../Helpers/chats";
import { viewChat } from "../ChatList";

export default function NewGroup() {
    const [title, setTitle] = useState('')
    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('')

    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const dispatch = useDispatch()

    useEffect(() => {
        setTimeout(() => {
            if (document.querySelector('.fadeThrough'))
                document.querySelector('.fadeThrough').classList.remove('fadeThrough')
        }, 100);
    }, [])

    const createGroup = useCallback(async () => {
        if (!title || title === null || title === '') return false;

        const createChat = await client.invoke(new Api.messages.CreateChat({
            title,
            users: [new Api.InputUserEmpty]
        }))

        const entity = createChat.updates.chats[0]
        const chat = generateChatWithPeer(entity)

        dispatch(chatAdded(chat))
        PageClose(dispatch)
        viewChat(chat, dispatch)
    }, [title])

    return <div className="NewGroup fadeThrough">
        <PageHeader key={title + username + bio}>
            <div><BackArrow index={0} onClick={() => PageClose(dispatch)} isiOS={centerTopBar} /></div>
            <div className="Title"><span>New Group</span></div>
            <div className="Meta">
                <button onClick={() => createGroup()}>Create</button>
            </div>
        </PageHeader>
        <div className="section">
            <div className="Group">
                <Profile name={title} />
                <div className="Items">
                    <div className="Item textfield"><input type="text" value={title} onInput={(e) => setTitle(e.target.value)} placeholder="Enter group name" /></div>
                </div>
            </div>
        </div>
        <div className="section">
            <div className="Items Info">
                <div className="Item"><Icon name="alternate_email" /><div className="textfield"><input type="text" value={username} onInput={(e) => setUsername(e.target.value)} placeholder="Username (Optional)" /></div></div>
                <div className="Item"><Icon name="info" /><div className="textfield"><input type="text" value={bio} onInput={(e) => setBio(e.target.value)} placeholder="Bio (Optional)" /></div></div>
            </div>
        </div>
    </div>
}