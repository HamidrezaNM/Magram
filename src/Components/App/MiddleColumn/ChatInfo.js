import { memo, useCallback, useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getChatData } from "../Chat"
import { handleCall, handleThread, setActiveChat } from "../../Stores/UI"
import { PageHandle } from "../Page"
import { showUserProfile } from "../Pages/UserProfile"
import { Icon, Profile } from "../common"
import { getDate } from "../Message"
import { formatTime } from "../../Util/dateFormat"
import { socket } from "../../../App"
import FullNameTitle from "../../common/FullNameTitle"
import { UserContext } from "../../Auth/Auth"
import { getChatType } from "../../Helpers/chats"

function ChatInfo() {

    const User = useContext(UserContext);

    const page = useSelector((state) => state.ui.value.page)
    const showPage = useSelector((state) => state.ui.value.showPage)
    const activeChat = useSelector((state) => state.ui.value.activeChat)
    const fullChat = useSelector((state) => state.ui.value.activeFullChat)
    const typingStatus = useSelector((state) => state.ui.value.activeChat.typingStatus)
    const thread = useSelector((state) => state.ui.value.thread)

    const isSavedMessages = activeChat.id.value === User.id.value
    const chatType = getChatType(activeChat.entity)

    const dispatch = useDispatch()

    const showChatProfile = useCallback((e) => {
        if (e.target.closest('.BackArrow'))
            return
        if (chatType === 'User' || chatType === 'Bot') {
            showUserProfile(activeChat.entity, dispatch)
        } else
            PageHandle(dispatch, 'ChatProfile', '')
    }, [page, showPage, activeChat])

    const chatInfoSubtitle = () => {
        if (typingStatus && typingStatus.length > 0) {
            return typingStatus.join(', ') + ' is typing...'
        }
        switch (chatType) {
            case 'User':
                if (activeChat.id.value == '777000') return 'Service notifications'
                return getUserStatus(activeChat.entity.status)
            case 'Bot':
                return 'bot'
            case 'Group':
                const participantsCount = activeChat.entity?.participantsCount ?? fullChat?.participantsCount
                const onlineCount = fullChat?.onlineCount

                const participantsText = participantsCount ? (participantsCount > 1 ? participantsCount + ' members' : '1 member') : 'Updating...'
                const onlineText = onlineCount && (onlineCount > 1 ? onlineCount + ' online' : '')

                return participantsText + (onlineText ? ', ' + onlineText : '')
            case 'Channel':
                const subscribersCount = activeChat.entity?.participantsCount ?? fullChat?.participantsCount

                const subscribersText = subscribersCount ? (subscribersCount > 1 ? subscribersCount + ' subscribers' : '1 subscriber') : 'channel'

                return subscribersText
            default:
                break;
        }
    }

    useEffect(() => {

    }, [activeChat.typingStatus])

    return <div className="ChatInfo">
        <div className="info" onClick={showChatProfile}>
            {!thread ? <>
                <Icon name="arrow_back" className="BackArrow" onClick={() => dispatch(setActiveChat())} />
                <div className="meta"><Profile entity={activeChat.entity} name={activeChat.title} id={activeChat.entity?.id.value} isSavedMessages={isSavedMessages} /></div>
                <div className="body">
                    <div className="title"><FullNameTitle chat={activeChat.entity} isSavedMessages={isSavedMessages} /></div>
                    {!isSavedMessages && <div className="subtitle">{chatInfoSubtitle()}</div>}
                </div>
            </> :
                <>
                    <Icon name="arrow_back" className="BackArrow visible" onClick={() => dispatch(handleThread())} />
                    <div className="body">
                        <div className="title">{thread.replies.replies} Comments</div>
                    </div>
                </>}
        </div>
        <div className="actions">
            {activeChat.type === 'private' && activeChat.to && <Icon name="call" onClick={() => dispatch(handleCall(activeChat?.to))} />}
            <div className="Menu">
                <Icon name="more_vert" />
            </div>
        </div>
    </div>
}

export function getUserStatus(lastSeen, peer, short = true) {
    if (peer && peer.bot) return 'bot'
    if (!lastSeen) return
    switch (lastSeen.className) {
        case 'LastMonth': {
            return 'Last seen within a month';
        }

        case 'LastWeek': {
            return 'Last seen within a week';
        }

        case 'UserStatusOnline': {
            return 'Online';
        }

        case 'UserStatusRecently':
            return 'Last seen recently'

        case 'UserStatusOffline': {
            if (!lastSeen.wasOnline)
                return 'Last seen recently';
        }

        default: {
            const wasOnline = lastSeen.wasOnline

            if (!wasOnline) return 'Last seen a long time ago';

            const now = new Date(Date.now());
            const wasOnlineDate = new Date(wasOnline * 1000);

            if (wasOnlineDate >= now) {
                return 'Online';
            }

            const diff = new Date(now.getTime() - wasOnlineDate.getTime());

            if (short) {
                // within a minute
                if (diff.getTime() / 1000 < 30) {
                    return 'Last seen just now';
                }

                if (diff.getTime() / 1000 < 120) {
                    return 'Last seen a minute ago';
                }

                // within an hour
                if (diff.getTime() / 1000 < 60 * 60) {
                    const minutes = Math.floor(diff.getTime() / 1000 / 60);
                    return `Last seen ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
                }
            }

            // today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const _Today = new Date(today.getTime());
            if (wasOnlineDate > _Today) {
                // up to 6 hours ago
                if (short && diff.getTime() / 1000 < 6 * 60 * 60) {
                    const hours = Math.floor(diff.getTime() / 1000 / 60 / 60);
                    return `Last seen ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
                }

                // other
                return `Last seen today at ${formatTime(wasOnlineDate)}`;
            }

            // yesterday
            const yesterday = new Date();
            yesterday.setDate(now.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const _Yesterday = new Date(yesterday.getTime());
            if (wasOnlineDate > _Yesterday) {
                return `Last seen yesterday at ${formatTime(wasOnlineDate)}`;
            }

            return `Last seen ${getDate(wasOnlineDate, false, true)} at ${formatTime(wasOnlineDate)}`
        }
    }
}

export default memo(ChatInfo)