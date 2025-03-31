import { memo } from "react";
import { useDispatch } from "react-redux";
import { generateChatWithPeer } from "../../Helpers/chats";
import { viewChat } from "../ChatList";
import { resolveUsername } from "../../Util/username";
import { handleToast } from "../../Stores/UI";

function MentionLink({ username, children, allowClick }) {
    const dispatch = useDispatch()

    const handleClick = async () => {
        if (!allowClick) return;

        const peer = await resolveUsername(username.substring(1))

        if (peer === 'USERNAME_NOT_OCCUPIED') {
            dispatch(handleToast({ icon: 'error', title: 'Username not found' }))
            return
        }

        viewChat(generateChatWithPeer(peer), dispatch)
    }

    return <a onClick={handleClick}>{children}</a>
}

export default memo(MentionLink)