import { memo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { client } from "../../../App";
import { Api } from "telegram";
import { chatAdded, handleTypingStatus, removeTypingStatus, setFullChat, updateChatRead, updateChatUserStatus, updateTypingStatus } from "../../Stores/Chats";
import { setActiveChat, setActiveFullChat } from "../../Stores/UI";
import { generateChatWithPeer, getChatIdFromPeer } from "../../Helpers/chats";
import { returnBigInt } from "telegram/Helpers";

function ChatHandler() {

    const activeChat = useSelector((state) => state.ui.activeChat)
    // const chats = useSelector((state) => state.chats.value)

    const dispatch = useDispatch()

    const onUpdate = async (update) => {
        switch (update.className) {
            case 'UpdateUserStatus':
                dispatch(updateChatUserStatus({ id: update.userId.value, status: update.status }))
                if (activeChat?.id?.value == update.userId.value) {
                    dispatch(setActiveChat({ ...activeChat, entity: { ...activeChat.entity, status: update.status } }))
                }
                break;
            case 'UpdateChannel':
                if (update._entities) {
                    const [chatId, peer] = update._entities.entries().next().value
                    const chat = generateChatWithPeer(peer, returnBigInt(chatId))

                    console.log('channel updated', chat)
                    dispatch(chatAdded(chat))
                }
                break;
            case 'UpdateReadHistoryOutbox':
                dispatch(updateChatRead({ chatId: getChatIdFromPeer(update.peer), maxId: update.maxId }))
                dispatch(setActiveChat({ ...activeChat, dialog: { ...activeChat.dialog, readOutboxMaxId: update.maxId } }))
                break;
            case 'UpdateUserTyping':
                dispatch(handleTypingStatus({ chatId: Number(update.userId), typing: Number(update.userId) }))
                setTimeout(() => {
                    dispatch(removeTypingStatus({ chatId: Number(update.userId), typing: Number(update.userId) }))
                }, 5000); break
            case 'UpdateChannelUserTyping':
                const user = await client.getEntity(update.fromId)
                dispatch(handleTypingStatus({ chatId: getChatIdFromPeer(update.channelId), typing: user?.firstName }))
                setTimeout(() => {
                    dispatch(removeTypingStatus({ chatId: getChatIdFromPeer(update.channelId), typing: user?.firstName }))
                }, 5000);
                break
            default:
                break;
        }
    }

    useEffect(() => {
        client.addEventHandler(onUpdate);
        return () => {
            client.removeEventHandler(onUpdate)
        }
    }, [activeChat?.id])

    useEffect(() => {
        (async () => {
            if (activeChat) {
                if (activeChat.isChannel) {
                    if (!activeChat.fullChat) {
                        const fullChannel = await client.invoke(
                            new Api.channels.GetFullChannel({ channel: activeChat.id.value })
                        )

                        dispatch(setFullChat({ chatId: activeChat.id.value, fullChat: fullChannel.fullChat }))
                        dispatch(setActiveFullChat(fullChannel.fullChat))
                    } else {
                        dispatch(setActiveFullChat(activeChat.fullChat))
                    }
                } else if (activeChat.isUser) {
                    const fullUser = await client.invoke(
                        new Api.users.GetFullUser({ id: activeChat?.id })
                    )

                    dispatch(setFullChat({ chatId: activeChat.id.value, fullChat: fullUser.fullUser }))
                    dispatch(setActiveFullChat(fullUser.fullUser))
                } else
                    dispatch(setActiveFullChat())
            }
        })()
    }, [activeChat?.id])

    return;
}

export default memo(ChatHandler)