import { memo, useState } from "react";
import { parseDeepLink } from "../../Util/deepLink";
import { viewChat } from "../ChatList";
import { client } from "../../../App";
import { generateChatWithPeer } from "../../Helpers/chats";
import { useDispatch } from "react-redux";
import { resolveUsername } from "../../Util/username";
import { handleToast } from "../../Stores/UI";
import { openUrl } from "../../Util/url";
import LoadingButtonBorder from "../../common/LoadingButtonBorder";
import Transition from "../Transition";

function Link({ url, allowClick, children }) {
    const [isLoading, setIsLoading] = useState(false)

    const dispatch = useDispatch()

    const handleClick = async e => {
        if (!allowClick) return

        e.preventDefault()

        setIsLoading(true)

        await openUrl(url, dispatch)

        requestAnimationFrame(() => {
            setIsLoading(false)
        })
    }

    return <a href={allowClick ? url : undefined} onClick={handleClick}>
        {children}
        <Transition state={isLoading}>
            <div className="TextLoading Loading"></div>
        </Transition>
    </a>
}

export default memo(Link)