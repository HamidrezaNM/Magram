import { message } from "telegram/client";
import { getUserStatus } from "../App/MiddleColumn/ChatInfo";

export function getChatTitle(chat) {
    return chat?.title;
}

export function getPeerId(peerId) {
    switch (peerId.className) {
        case 'PeerUser':
            return peerId.userId.value
        case 'PeerChannel':
            return peerId.channelId.value
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

            const participantsText = participantsCount ? (participantsCount > 1 ? participantsCount + ' members' : '1 member') : 'group'

            return participantsText
        case 'Channel':
            const subscribersCount = chat.participantsCount
            if (chat.megagroup) {
                return subscribersCount ? (subscribersCount > 1 ? subscribersCount + ' members' : '1 member') : 'group'
            }

            const subscribersText = subscribersCount ? (subscribersCount > 1 ? subscribersCount + ' subscribers' : '1 subscriber') : 'channel'

            return subscribersText
        default:
            return ''
    }
}

export function generateChatWithPeer(peer, chatId) {
    const peerType = getChatType(peer)

    return {
        id: chatId ?? peer.id,
        title: peer.title ?? peer.firstName,
        entity: peer,
        isChannel: peerType === 'Channel' || peerType === 'Group',
        isGroup: peerType === 'Group',
        isUser: peerType === 'User',
        message: null,
        unreadCount: 0,
        isGeneratedByPeer: true
    }
}