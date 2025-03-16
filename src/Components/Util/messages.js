import { client } from "../../App"
import { updateChatUnreadCount } from "../Stores/Chats"
import { removeMessage } from "../Stores/Messages"

export async function readHistory(peerId, dispatch) {
    await client.markAsRead(peerId)

    dispatch(updateChatUnreadCount({ id: peerId, count: 0 }))
}

export async function deleteMessage(peerId, messageId, dispatch) {
    await client.deleteMessages(peerId, [messageId], { revoke: true })

    dispatch(removeMessage({
        chatId: peerId,
        messageId
    }))
}