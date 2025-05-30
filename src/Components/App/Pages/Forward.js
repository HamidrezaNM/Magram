import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHandle, PageHeader } from "../Page";
import ChatList from "../ChatList";
import { BackArrow } from "../common";
import { handleForwardMessage, handleForwardMessageChat } from "../../Stores/UI";

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
        <PageHeader>
            <div><BackArrow index={0} onClick={() => PageClose(dispatch)} isiOS={centerTopBar} /></div>
            <div className="Title"><span>Forward to...</span></div>
            <div className="Meta"></div>
        </PageHeader>
        <div className="Chats scrollable">
            <ChatList onClick={handleForward} />
        </div>
    </div>
}

export const showForwardMessage = (message, dispatch) => {
    dispatch(handleForwardMessage({ message }))
    PageHandle(dispatch, 'Forward', '')
}