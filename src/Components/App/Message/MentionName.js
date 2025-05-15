import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { generateChatWithPeer } from "../../Helpers/chats";
import { viewChat } from "../ChatList";
import { handleToast } from "../../Stores/UI";
import Transition from "../Transition";
import { client } from "../../../App";

function MentionName({ userId, children, allowClick }) {
    const [isLoading, setIsLoading] = useState(false)

    const dispatch = useDispatch()

    const handleClick = async () => {
        if (!allowClick) return;

        setIsLoading(true)

        const peer = await client.getEntity(userId)

        setIsLoading(false)

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