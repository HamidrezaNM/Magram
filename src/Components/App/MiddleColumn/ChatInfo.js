import { memo, useCallback, useContext, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getChatData } from "../Chat"
import { handleCall, handleThread, setActiveChat } from "../../Stores/UI"
import { PageHandle } from "../Page"
import { showUserProfile } from "../Pages/UserProfile"
import { BackArrow, Icon, Profile } from "../common"
import { getDate } from "../Message"
import { formatTime } from "../../Util/dateFormat"
import { client, socket } from "../../../App"
import FullNameTitle from "../../common/FullNameTitle"
import { UserContext } from "../../Auth/Auth"
import { deleteChat, generateChatWithPeer, getChatType, getDeleteChatText } from "../../Helpers/chats"
import MenuItem from "../../UI/MenuItem"
import DropdownMenu from "../../UI/DropdownMenu"
import Menu from "../../UI/Menu"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material"
import { removeChat } from "../../Stores/Chats"
import { viewChat } from "../ChatList"
import buildClassName from "../../Util/buildClassName"

function ChatInfo() {
    const [openDeleteChatModal, setOpenDeleteChatModal] = useState(false)
    const [typingAction, setTypingAction] = useState(false)

    const User = useContext(UserContext);

    const page = useSelector((state) => state.ui.page)
    const showPage = useSelector((state) => state.ui.showPage)
    const activeChat = useSelector((state) => state.ui.activeChat)
    const fullChat = useSelector((state) => state.ui.activeFullChat)
    const typingStatus = useSelector((state) => state.chats.value[activeChat.id.value]?.typing)
    const thread = useSelector((state) => state.ui.thread)
    const centerTopBar = useSelector((state) => state.ui.customTheme.centerTopBar)

    const isSavedMessages = activeChat.id.value === User.id.value
    const chatType = getChatType(activeChat.entity)

    const dispatch = useDispatch()

    const showChatProfile = useCallback((e) => {
        if (e.target.closest('.BackArrow') || e.target.closest('.BackButton'))
            return
        if (chatType === 'User' || chatType === 'Bot') {
            showUserProfile(activeChat.entity, dispatch)
        } else
            PageHandle(dispatch, 'ChatProfile', '')
    }, [page, showPage, activeChat])

    const chatInfoSubtitle = useCallback(() => {
        if (typingStatus && typingStatus.length > 0) {
            if (!typingAction)
                setTypingAction(true)
            if (chatType === 'User' || chatType === 'Bot')
                return 'typing...'
            return typingStatus.join(', ') + ' is typing...'
        }

        if (typingAction)
            setTypingAction(false)

        switch (chatType) {
            case 'User':
                if (activeChat.id.value == '777000') return 'Service notifications'
                return getUserStatus(activeChat.entity.status)
            case 'Bot':
                return activeChat.entity.botActiveUsers ? activeChat.entity.botActiveUsers + ' monthly users' : 'bot'
            case 'Group':
                const participantsCount = fullChat?.participantsCount ?? activeChat.entity?.participantsCount
                const onlineCount = fullChat?.onlineCount

                const participantsText = participantsCount ? (participantsCount > 1 ? participantsCount + ' members' : '1 member') : 'Updating...'
                const onlineText = onlineCount && (onlineCount > 1 ? onlineCount + ' online' : '')

                return participantsText + (onlineText ? ', ' + onlineText : '')
            case 'Channel':
                console.log(fullChat, activeChat)
                const subscribersCount = fullChat?.participantsCount ?? activeChat.entity?.participantsCount

                const subscribersText = subscribersCount ? (subscribersCount > 1 ? subscribersCount + ' subscribers' : '1 subscriber') : 'channel'

                return subscribersText
            default:
                break;
        }
    }, [activeChat, fullChat, chatType, typingStatus, typingAction])

    const onLeaveGroup = () => {
        dispatch(removeChat(activeChat.id.value))
        dispatch(setActiveChat())
        setOpenDeleteChatModal(false)
    }

    const leaveGroup = async () => {
        await deleteChat(activeChat, User.id.value)
        onLeaveGroup()
    }

    const viewDiscussion = async () => {
        const discussionChat = await client.getEntity(fullChat?.linkedChatId)
        viewChat(generateChatWithPeer(discussionChat), dispatch)
    }

    useEffect(() => {

    }, [activeChat.typingStatus])

    return <><div className="ChatInfo">
        <div className="info" onClick={showChatProfile}>
            {!thread ? <>
                <BackArrow title="Back" onClick={() => dispatch(setActiveChat())} isiOS={centerTopBar} />
                {centerTopBar ? <>
                    <div className="body">
                        <div className="title"><FullNameTitle chat={activeChat.entity} isSavedMessages={isSavedMessages} /></div>
                        {!isSavedMessages && <div className={buildClassName("subtitle", typingAction && 'typing')}>{chatInfoSubtitle()}</div>}
                    </div>
                    <div className="meta"><Profile entity={activeChat.entity} name={activeChat.title} id={activeChat.entity?.id.value} isSavedMessages={isSavedMessages} /></div>
                </>
                    : <>
                        <div className="meta"><Profile entity={activeChat.entity} name={activeChat.title} id={activeChat.entity?.id.value} isSavedMessages={isSavedMessages} /></div>
                        <div className="body">
                            <div className="title"><FullNameTitle chat={activeChat.entity} isSavedMessages={isSavedMessages} /></div>
                            {!isSavedMessages && <div className={buildClassName("subtitle", typingAction && 'typing')}>{chatInfoSubtitle()}</div>}
                        </div>
                    </>
                }
            </> :
                <>
                    <BackArrow className="visible" title="Back" onClick={() => dispatch(handleThread())} isiOS={centerTopBar} />
                    <div className="body">
                        <div className="title">{thread.replies.replies} Comments</div>
                    </div>
                </>}
        </div>
        <div className="actions">
            {activeChat.type === 'private' && activeChat.to && <Icon name="call" onClick={() => dispatch(handleCall(activeChat?.to))} />}
            <Menu icon="more_vert">
                <DropdownMenu className="top right withoutTitle">
                    {chatType === 'Channel' && fullChat?.linkedChatId && <MenuItem icon="chat" title="View Discussion" onClick={viewDiscussion} />}
                    <MenuItem icon="logout" title={getDeleteChatText(activeChat.entity)} className="danger" onClick={() => setOpenDeleteChatModal(true)} />
                </DropdownMenu>
            </Menu>
        </div>
    </div >
        <Dialog
            open={openDeleteChatModal}
            onClose={() => setOpenDeleteChatModal(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
                sx: {
                    background: '#0008',
                    backdropFilter: 'blur(25px)',
                    borderRadius: '16px'
                }
            }}
            sx={{
                "& > .MuiBackdrop-root": {
                    background: "rgba(0, 0, 0, 0.2)"
                }
            }}
        >
            <DialogTitle id="alert-dialog-title" className="flex">
                <Profile entity={activeChat.entity} name={activeChat?.title} id={activeChat?.entity?.id.value} />
                {getDeleteChatText(activeChat.entity)}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to leave {activeChat?.title}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenDeleteChatModal(false)}>CANCEL</Button>
                <Button color="error" onClick={leaveGroup}>
                    {getDeleteChatText(activeChat.entity).toUpperCase()}
                </Button>
            </DialogActions>
        </Dialog>
    </>
}

export function getUserStatus(lastSeen, peer, short = true) {
    if (peer && peer.bot) return 'bot'
    if (!lastSeen) return 'Last seen a long time ago'
    switch (lastSeen.className) {
        case 'UserStatusLastMonth': {
            return 'Last seen within a month';
        }

        case 'UserStatusLastWeek': {
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

        default:
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

export default memo(ChatInfo)