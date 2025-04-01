import { Api } from "telegram"
import { client } from "../../App"
import { updateChatUnreadCount } from "../Stores/Chats"
import { removeMessage, updateMessagePoll } from "../Stores/Messages"

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

export async function retractVote(peerId, messageId, dispatch) {
    const result = await client.invoke(new Api.messages.SendVote({
        peer: peerId,
        msgId: messageId,
        options: []
    }))
    console.log(result)
    const poll = result.updates[0]
    dispatch(updateMessagePoll({ chatId: Number(peerId), messageId, media: { poll: poll.poll, results: poll.results } }))
}