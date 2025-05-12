import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { client } from "../../../App";
import { Api } from "telegram";
import { chatAdded, handleTypingStatus, removeTypingStatus, setFullChat, updateChatRead, updateChatUserStatus, updateTypingStatus } from "../../Stores/Chats";
import { handleToast, setActiveChat, setActiveFullChat } from "../../Stores/UI";
import { generateChatWithPeer, getChatIdFromPeer } from "../../Helpers/chats";
import { returnBigInt } from "telegram/Helpers";

const ChatHandler = forwardRef(({ }, ref) => {

    const activeChat = useSelector((state) => state.ui.activeChat)

    const dispatch = useDispatch()

    useImperativeHandle(
        ref,
        () => ({
            async onUpdate(update) {
                switch (update.type) {
                    case 'UpdateUserStatus':
                        dispatch(updateChatUserStatus({ id: update.userId.value, status: update.status }))
                        if (activeChat?.id?.value == update.userId.value) {
                            dispatch(setActiveChat({ ...activeChat, entity: { ...activeChat.entity, status: update.status } }))
                        }
                        break;
                    case 'UpdateChannel':
                        if (update.channel) {
                            const [chatId, peer] = update.channel
                            const chat = generateChatWithPeer(peer, returnBigInt(chatId))

                            console.log('channel updated', chat)
                            dispatch(chatAdded(chat))
                            if (Number(activeChat?.id) == chatId) {
                                dispatch(setActiveChat({ ...activeChat, entity: { ...activeChat.entity, ...peer } }))
                            }
                        }
                        break;
                    case 'UpdateReadHistory':
                        dispatch(updateChatRead({ chatId: getChatIdFromPeer(update.peer), maxId: update.maxId, unreadCount: update.stillUnreadCount }))
                        if (activeChat)
                            dispatch(setActiveChat({ ...activeChat, dialog: { ...activeChat.dialog, readOutboxMaxId: update.maxId } }))
                        console.log('updated unread count', update.stillUnreadCount, getChatIdFromPeer(update.peer))
                        break;
                    case 'UpdateUserTyping':
                        dispatch(handleTypingStatus({ chatId: Number(update.userId), typing: Number(update.userId) }))
                        setTimeout(() => {
                            dispatch(removeTypingStatus({ chatId: Number(update.userId), typing: Number(update.userId) }))
                        }, 5000); break
                    case 'UpdateChannelUserTyping':
                        try {
                            const user = await client.getEntity(update.fromId)
                            dispatch(handleTypingStatus({ chatId: Number('-100' + update.channelId), typing: user?.firstName }))
                            setTimeout(() => {
                                dispatch(removeTypingStatus({ chatId: Number('-100' + update.channelId), typing: user?.firstName }))
                            }, 5000);
                        } catch (error) {
                            console.log(error)
                        }
                        break
                    default:
                        break;
                }
            }
        }),
        [activeChat?.id],
    )

    useEffect(() => {
        (async () => {
            if (activeChat) {
                try {
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
                } catch (error) {
                    dispatch(setActiveFullChat())
                    dispatch(handleToast({ icon: 'error', title: error.errorMessage }))
                }
            }
        })()
    }, [activeChat?.id])

    return;
})

export default memo(ChatHandler)