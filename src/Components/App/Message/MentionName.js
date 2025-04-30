import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { generateChatWithPeer } from "../../Helpers/chats";
import { viewChat } from "../ChatList";
import { resolveUsername } from "../../Util/username";
import { handleToast } from "../../Stores/UI";
import Transition from "../Transition";

function MentionName({ username, children, allowClick }) {
    const [isLoading, setIsLoading] = useState(false)

    const dispatch = useDispatch()

    const handleClick = async () => {
        if (!allowClick) return;

        setIsLoading(true)

        const peer = await resolveUsername(username.substring(1))

        setIsLoading(false)

        if (peer === 'USERNAME_NOT_OCCUPIED') {
            dispatch(handleToast({ icon: 'error', title: 'Username not found' }))
            return
        }

        viewChat(generateChatWithPeer(peer), dispatch)
    }

    return <a onClick={handleClick}>
        {children}
        <Transition state={isLoading}>
            <div className="TextLoading Loading"></div>
        </Transition>
    </a>
}

export default memo(MentionName)