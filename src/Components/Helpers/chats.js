import { message } from "telegram/client";
import { getUserStatus } from "../App/MiddleColumn/ChatInfo";
import { Api, utils } from "telegram";
import { returnBigInt } from "telegram/Helpers";
import { client } from "../../App";
import { numberWithCommas } from "../Util/numbers";

export function getChatTitle(chat) {
    return chat?.title;
}

export function getChatIdFromPeer(peer) {
    return utils.getPeerId(peer)
}

export async function getChatEntity(peerId) {
    return await client.getEntity(peerId)
}

export function getPeerId(peer) {
    switch (peer.className) {
        case 'PeerUser':
        case 'InputPeerUser':
            return Number(peer.userId)
        case 'PeerChat':
        case 'InputPeerChat':
            return Number(peer.chatId)
        case 'PeerChannel':
        case 'InputPeerChannel':
            return Number(peer.channelId)
        default:
            break;
    }

    return undefined;
}

export function getChatType(entity) {
    switch (entity?.className) {
        case 'User':
            if (entity.bot) return 'Bot'
            return 'User'
        case 'Chat':
        case 'Group':
            return 'Group'
        case 'Channel':
            if (entity.megagroup) {
                return 'Group'
            }
            return 'Channel'
        default:
            return undefined
    }
}

export function getChatSubtitle(chat, type) {
    switch (type ?? chat.className) {
        case 'User':
            if (chat.bot) return 'bot'
            if (chat.id.value == '777000') return 'Service notifications'
            return getUserStatus(chat.status)
        case 'Chat':
        case 'Group':
            const participantsCount = chat.participantsCount

            const participantsText = participantsCount ? (participantsCount > 1 ? numberWithCommas(participantsCount) + ' members' : '1 member') : 'group'

            return participantsText
        case 'Channel':
            const subscribersCount = chat.participantsCount
            if (chat.megagroup) {
                return subscribersCount ? (subscribersCount > 1 ? numberWithCommas(subscribersCount) + ' members' : '1 member') : 'group'
            }

            const subscribersText = subscribersCount ? (subscribersCount > 1 ? numberWithCommas(subscribersCount) + ' subscribers' : '1 subscriber') : 'channel'

            return subscribersText
        default:
            return ''
    }
}

export function isParticipantAdmin(participant) {
    if (!participant) return false;

    if (participant.rank) return true

    if (participant.className === 'ChannelParticipantAdmin' ||
        participant.className === 'ChatParticipantAdmin') return true

    if (participant.className === 'ChannelParticipantCreator' ||
        participant.className === 'ChatParticipantCreator') return true
}

export function getParticipantRank(participant) {
    if (!participant) return;

    if (participant.rank) return participant.rank

    if (participant.className === 'ChannelParticipantAdmin' ||
        participant.className === 'ChatParticipantAdmin') return 'Admin'

    if (participant.className === 'ChannelParticipantCreator' ||
        participant.className === 'ChatParticipantCreator') return 'Owner'
}

export function getParticipant(userId, chat) {
    return chat?.participants?.participants?.find(item => Number(item.id) === Number(userId))?.participant
}

export function getParticipantRights(entity) {
    if (!entity) return;

    if (entity.creator) return {
        deleteMessages: true,
        pinMessages: true,
        banUsers: true
    }

    if (entity.adminRights) return entity.adminRights
}

export const getDeleteChatText = (chat) => {
    switch (getChatType(chat)) {
        case 'Group':
            return 'Leave Group'
        case 'Channel':
            return 'Leave Channel'
        default:
            return 'Delete Chat'
    }
}

export const deleteChat = async (chat, userId) => {
    if (chat.isChannel) {
        await client.invoke(new Api.channels.LeaveChannel({ channel: chat.entity }))
        return true
    }
    if (chat.isGroup) {
        await client.invoke(new Api.messages.DeleteChatUser({
            chatId: chat.entity.id.value,
            userId,
            revokeHistory: false
        }))
        return true
    }
    await client.invoke(new Api.messages.DeleteHistory({
        peer: chat.entity,
        revoke: false
    }))
    return true
}

export function generateChatWithPeer(peer, chatId) {
    const peerType = getChatType(peer)

    return {
        id: chatId ?? returnBigInt(getChatIdFromPeer(peer)),
        title: peer.title ?? peer.firstName,
        entity: peer,
        isChannel: peerType === 'Channel' || (peerType === 'Group' && peer.megagroup),
        isGroup: peerType === 'Group',
        isUser: peerType === 'User' || peerType === 'Bot',
        message: null,
        unreadCount: 0,
        isGeneratedByPeer: true
    }
}