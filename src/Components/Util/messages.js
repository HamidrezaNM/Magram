import { Api } from "telegram"
import { client } from "../../App"
import { updateChatUnreadCount } from "../Stores/Chats"
import { handleDeleteMessage, removeMessage, updateMessagePoll } from "../Stores/Messages"

export async function readHistory(peerId, dispatch) {
    await client.markAsRead(peerId)

    dispatch(updateChatUnreadCount({ id: peerId, count: 0 }))
}

export async function deleteMessage(peerId, messageId, dispatch) {
    await client.deleteMessages(peerId, [messageId], { revoke: true })

    dispatch(handleDeleteMessage({
        chatId: peerId,
        messageId
    }))

    setTimeout(() => {
        dispatch(removeMessage({
            chatId: peerId,
            messageId
        }))
    }, 2000);
}

export async function saveGIF(documentId, unsave = false) {
    const result = await client.invoke(new Api.messages.SaveGif({
        id: documentId,
        unsave
    }))
    return result;
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

export async function getMessageReadParticipants(peerId, messageId) {
    const result = await client.invoke(new Api.messages.GetMessageReadParticipants({
        peer: peerId,
        msgId: messageId
    }))

    const userIds = result.map(item => item.userId)
    const users = await client.getEntity(userIds)

    const finalData = result.map((item, index) => { return { seenDate: item.date, ...users[index] } })

    return finalData
}

export async function getMessageReadDate(peerId, messageId) {
    const result = await client.invoke(new Api.messages.GetOutboxReadDate({
        peer: peerId,
        msgId: messageId
    }))

    return result.date
}