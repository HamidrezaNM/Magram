import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHandle, PageHeader } from "../Page";
import ChatList from "../ChatList";
import { BackArrow } from "../common";
import { handleForwardMessage, handleForwardMessageChat } from "../../Stores/UI";
import { canSendMessages, getChatType } from "../../Helpers/chats";

export default function Forward() {
    const [isLoaded, setIsLoaded] = useState(false)

    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const dispatch = useDispatch()

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    const handleForward = (chat) => {
        dispatch(handleForwardMessageChat(chat))
        PageClose(dispatch)
    }

    return <div className={"Forward" + (!isLoaded ? ' fadeThrough' : '')}>
        <div className="Chats scrollable">
            <ChatList onClick={handleForward} filter={canSendMessages} pinSavedMessages />
        </div>
    </div>
}

export const showForwardMessage = (message, dispatch) => {
    dispatch(handleForwardMessage({ message }))
}