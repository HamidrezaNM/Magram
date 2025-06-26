import { Api } from "telegram"
import { client } from "../../App"
import { updateChatUnreadCount } from "../Stores/Chats"
import { handleDeleteMessage, removeMessage, updateMessagePoll, updateMessageReactions } from "../Stores/Messages"
import { handlePositionTransition } from "../Stores/UI"

export async function readHistory(peerId, dispatch) {
    await client.markAsRead(peerId)

    dispatch(updateChatUnreadCount({ id: peerId, count: 0 }))
}

export async function deleteMessage(peerId, messageId, dispatch, revoke = true) {
    await client.deleteMessages(peerId, [messageId], { revoke })

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

export async function sendReaction(peerId, messageId, emoticon, currentReactions = [], rect, element, dispatch) {
    const reactionExist = currentReactions && currentReactions.find(item => item.reaction.emoticon === emoticon)

    let result;
    if (reactionExist) {
        if (reactionExist.flags === 1) {
            reactionExist.count--
            reactionExist.flags = 0
            console.log('flag true')
        } else {
            reactionExist.count++
            reactionExist.flags = 1
            console.log('flag false')
        }

        result = currentReactions
    }
    else {
        result = [...currentReactions, new Api.ReactionCount({ count: 1, flags: 1, reaction: new Api.ReactionEmoji({ emoticon }) })]
    }

    dispatch(handlePositionTransition({ from: rect, id: messageId + emoticon, type: 'reaction' }))

    console.log('reaction result', result)
    dispatch(updateMessageReactions({ chatId: Number(peerId), messageId, reactions: result }))

    console.log(peerId, messageId, emoticon)

    const sendReactionResult = await client.invoke(new Api.messages.SendReaction({
        peer: peerId,
        msgId: messageId,
        reaction: [new Api.ReactionEmoji({ emoticon })]
    }))

    return sendReactionResult
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

export async function getStoriesById(peer, storiesId) {
    return await client.invoke(new Api.stories.GetStoriesByID({
        id: storiesId,
        peer
    }))
}