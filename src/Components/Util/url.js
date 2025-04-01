import { Api } from "telegram";
import { client } from "../../App";
import { viewChat } from "../App/ChatList";
import { generateChatWithPeer } from "../Helpers/chats";
import { handleDialog, handleToast } from "../Stores/UI";
import { parseDeepLink } from "./deepLink";
import { resolveUsername } from "./username";

export async function openUrl(url, dispatch) {
    const deepLink = parseDeepLink(url)

    if (!deepLink) return window.open(url, '_blank', 'noopener');

    switch (deepLink?.type) {
        case 'publicUsernameOrBotLink':
            const peer = await resolveUsername(deepLink.username)

            if (peer === 'USERNAME_NOT_OCCUPIED') {
                dispatch(handleToast({ icon: 'error', title: 'Username not found' }))
                return false;
            }

            viewChat(generateChatWithPeer(peer), dispatch)
            break
        case 'privateChannelLink':
            const entity = await client.getEntity(deepLink.channelId)
            viewChat(generateChatWithPeer(entity), dispatch)
            break;
        case 'inviteLink':
            try {
                const chatInvite = await client.invoke(new Api.messages.CheckChatInvite({
                    hash: deepLink.hash
                }))

                if (chatInvite.chat) {
                    viewChat(generateChatWithPeer(chatInvite.chat), dispatch)
                } else {
                    dispatch(handleDialog({
                        type: 'joinChat',
                        chat: chatInvite,
                        hash: deepLink.hash
                    }))
                }
            } catch (error) {
                dispatch(handleToast({
                    icon: 'error',
                    title: 'Invite link invalid or expired'
                }))
            }
            break
        case 'proxy':
            dispatch(handleToast({ icon: 'error', title: "Proxy doesn't supported" }))
            break
        default:
            dispatch(handleToast({ icon: 'error', title: 'This link is not currently supported.' }))
            break;
    }
}