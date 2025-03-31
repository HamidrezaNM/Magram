import { memo } from "react";
import { parseDeepLink } from "../../Util/deepLink";
import { viewChat } from "../ChatList";
import { client } from "../../../App";
import { generateChatWithPeer } from "../../Helpers/chats";
import { useDispatch } from "react-redux";
import { resolveUsername } from "../../Util/username";
import { handleToast } from "../../Stores/UI";
import { openUrl } from "../../Util/url";

function Link({ url, allowClick, children }) {

    const dispatch = useDispatch()

    const handleClick = async e => {
        if (!allowClick) return

        e.preventDefault()

        openUrl(url, dispatch)
    }

    return <a href={allowClick ? url : undefined} onClick={handleClick}>{children}</a>
}

export default memo(Link)