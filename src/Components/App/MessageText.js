import { memo, useContext, useEffect, useRef, useState } from "react"
import { EmojiConvertor } from "emoji-js";
import { UserContext } from "../Auth/Auth";
import { getMediaType } from "../Helpers/messages";
import renderTextWithEntities from "../Helpers/renderTextWithEntities";
import { formatTime } from "../Util/dateFormat";
import { getDate } from "./Message";
import MessageCall from "./Message/MessageCall";

function MessageText({ data, isInChat = false, includeFrom = false }) {
    const User = useContext(UserContext)

    return <span>{getMessageText(data, User._id, isInChat, includeFrom)}</span>
}

export const getMessageText = (data, userId, isInChat = false, includeFrom = false) => {
    if (data.message) {
        // const emoji = new EmojiConvertor()

        // emoji.replace_mode = 'img';
        // emoji.img_sets.apple.path = 'https://cdnjs.cloudflare.com/ajax/libs/emoji-datasource-apple/15.0.1/img/apple/64/'
        // emoji.allow_native = true;
        // emoji.include_title = true
        // var output = emoji.replace_colons(data.message);
        // output = (includeFrom ? data._sender?.firstName + ': ' : '') + data.message
        // if (isInChat)
        //     output = output.replace(/(https?:\/\/((\d{1,3}\.){3}\d{1,3}|\b[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,})(:\d+)?(\/[^\s]*)?)|([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}(\/[^\s]*)?(?<!\.)\b(:\d+)?)/gi, function (x) {
        //         var href = x;
        //         if (!x.startsWith('http') && !x.startsWith('https')) {
        //             href = 'https://' + x
        //         }
        //         return `<a href="${href}" target="_blank">${x}</a>`;
        //     })
        // output = new DOMParser().parseFromString(output, "text/html").documentElement.textContent;
        return renderTextWithEntities(data.message, data.entities, isInChat, includeFrom && (data._sender?.firstName ?? data._sender?.title), isInChat)
    } else if (data.action) {
        switch (data.action.className) {
            case 'MessageActionChannelCreate':
                return 'Channel created'
            case 'MessageActionChatCreate':
                return `${data._actionEntities[0]?.firstName} created the group`
            case 'MessageActionChatJoinedByLink':
            case 'MessageActionChannelMigrateFrom':
                return 'You joined the group via invite link'
            case 'MessageActionChatJoinedByRequest':
                return `${data.sender?.firstName} was accepted into the group`
            case 'MessageActionChatAddUser':
                if (data.senderId?.value == data.action.users[0]?.value) {
                    return `${data.sender?.firstName} joined the group`
                }
                return `${data.sender?.firstName} added ${data._actionEntities[0]?.firstName}`
            case 'MessageActionChatDeleteUser':
                if (data.senderId.value == data.action.userId.value) {
                    return `${data.sender?.firstName} left the group`
                }
                return `${data.sender?.firstName} removed ${data._actionEntities[0]?.firstName}`
            case 'MessageActionPinMessage':
                return `${data.sender?.firstName ?? data.sender?.title ?? data.chat?.title} pinned this message`
            case 'MessageActionGroupCallScheduled':
                let date = data.action.scheduleDate * 1000
                return `Live stream scheduled on ${getDate(date, false, true)}, ${formatTime(date)}`
            case 'MessageActionGroupCall':
                return 'Live stream started'
            case 'MessageActionContactSignUp':
                return `${data.sender?.firstName} joined Telegram!`
            case 'MessageActionPhoneCall':
                return isInChat ? <MessageCall data={data} /> : 'Outgoing Call'
            default:
                return <span>This message is currently not supported in this version of Magram.
                    <br /><br />
                    <code>{data.action.className}</code>
                </span>
        }
    } else if (!isInChat) {
        if (data.media) {
            return <span>{includeFrom ? data.sender?.firstName + ': ' : ''}<span style={{ fontWeight: 500 }}>{getMediaType(data.media) ?? 'Media'}</span></span>
        } else if (data.type === 'call') {
            var output = ''
            switch (data.call?.status) {
                case 'declined':
                    output = 'Declined Call'
                    break;
                case 'answered':
                default:
                    if (data.from._id === userId)
                        output = 'Outgoing Call'
                    else
                        output = 'Incoming Call'
                    break;
            }
            return (includeFrom ? data.sender?.firstname + ': ' : '') + output
        }
    }
}

export default memo(MessageText)