import { memo } from "react";
import { useDispatch } from "react-redux";
import { setActiveChat } from "../../Stores/UI";
import { client } from "../../../App";
import { Api } from "telegram";
import { generateChatWithPeer } from "../../Helpers/chats";
import { viewChat } from "../ChatList";

function MentionLink({ username, children, allowClick }) {
    const dispatch = useDispatch()

    const handleClick = async () => {
        if (!allowClick) return;
        let peer
        const resolveUsername = await client.invoke(new Api.contacts.ResolveUsername({ username: username.substring(1) }))
        if (resolveUsername.peer.className == 'PeerUser')
            peer = resolveUsername.users[0]
        else
            peer = resolveUsername.chats[0]
        viewChat(generateChatWithPeer(peer), dispatch)
    }

    return <a onClick={handleClick}>{children}</a>
}

export default memo(MentionLink)