import { memo, useContext, useEffect, useRef, useState } from "react";
import { viewChat } from "./ChatList";
import { ChatContext } from "./ChatContext";
import { Profile } from "./common";
import MessageText from "./MessageText";
import { AuthContext, UserContext } from "../Auth/Auth";
import MessageSeen from "./Message/MessageSeen";
import { useDispatch, useSelector } from "react-redux";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Skeleton } from "@mui/material";
import ChatContextMenu from "./ChatContextMenu";
import { handleContextMenu } from "../Stores/UI";
import { removeChat, updateLastMessage } from "../Stores/Chats";
import { client, socket } from "../../App";
import FullNameTitle from "../common/FullNameTitle";
import { Api } from "telegram";
import { getChatType } from "../Helpers/chats";
import buildClassName from "../Util/buildClassName";

function Chat({ info, isActive }) {
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const Auth = useContext(AuthContext);
    const User = useContext(UserContext);

    const ChatEl = useRef()

    const dispatch = useDispatch()

    console.log('Chat Rerendered')

    useEffect(() => {
        if (!info.message) {
            (async () => {
                try {
                    const lastMessage = await client.getMessages(info.id.value, {
                        limit: 1
                    })

                    dispatch(updateLastMessage({ id: info.id.value, message: lastMessage[0] }))
                } catch (error) {

                }
            })()
        }
    }, [info.id])

    useEffect(() => {
        ChatEl.current.removeEventListener('contextmenu', chatMenu)
        ChatEl.current.addEventListener('contextmenu', chatMenu)
    }, [])

    const handleContextMenuClose = () => dispatch(handleContextMenu())

    const handleDelete = () => {
        handleContextMenuClose()
        setOpenDeleteModal(true)
    }

    const onLeaveGroup = () => {
        dispatch(removeChat(info.id.value))
        setOpenDeleteModal(false)
    }

    const leaveGroup = () => {
        (async () => {
            if (info.isChannel) {
                await client.invoke(new Api.channels.LeaveChannel({ channel: info.entity }))
                onLeaveGroup()
                return true
            }
            if (info.isGroup) {
                await client.invoke(new Api.messages.DeleteChatUser({
                    chatId: info.id.value,
                    userId: User.id.value,
                    revokeHistory: false
                }))
                onLeaveGroup()
                return true;
            }
            await client.invoke(new Api.messages.DeleteHistory({
                peer: info.entity,
                revoke: false
            }))
            onLeaveGroup()
            return true;
        })()

    }

    const getDeleteText = () => {
        switch (getChatType(info.entity)) {
            case 'Group':
                return 'Leave Group'
            case 'Channel':
                return 'Leave Channel'
            default:
                return 'Delete Chat'
        }
    }

    const chatMenu = e => {
        e.preventDefault()

        const items = (
            <>
                <ChatContextMenu
                    canMute={true}
                    canMarkAsRead={true}
                    canPin={true}
                    canDelete={true}
                    onDelete={handleDelete}
                />
            </>
        )
        dispatch(handleContextMenu({ items, e }))
    }

    return <><div ref={ChatEl} className={"Chat" + (isActive ? ' active' : '')} onClick={() => viewChat(info, dispatch)}>
        <div className="meta"><Profile entity={info.entity} name={info.title} id={info.entity?.id.value} isSavedMessages={info.id.value === User.id.value} /></div>
        <div className="body">
            <div className="info">
                <div className="title"><FullNameTitle chat={info.entity} isSavedMessages={info.id.value === User.id.value} /></div>
                <div className="message-details">
                    {/* {isOutMessage && (
                        // <MessageSeen data={info.message} />
                    )} */}
                    <div className="message-time">{getDateText(info.message?.date)}</div>
                </div>
            </div>
            <div className="subtitle">
                <div className="last-message" dir="auto">{info.message ? <MessageText data={info.message} includeFrom={info.isGroup} /> : 'Loading...'}</div>
                {info.unreadCount ? info.unreadCount > 0 && <div className={buildClassName('unread', info.dialog?.notifySettings?.muteUntil && 'muted')}>{info.unreadCount}</div> : null}
            </div>
        </div>
    </div>
        <Dialog
            open={openDeleteModal}
            onClose={() => setOpenDeleteModal(false)}
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
                <Profile entity={info.entity} name={info?.title} id={info.entity?.id.value} />
                {getDeleteText()}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to leave {info?.title}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenDeleteModal(false)}>CANCEL</Button>
                <Button color="error" onClick={leaveGroup}>
                    {getDeleteText().toUpperCase()}
                </Button>
            </DialogActions>
        </Dialog>
    </>
}

export const ChatsLoading = memo(function () {
    var divs = []
    for (let i = 0; i < 20; i++) {
        divs.push(
            <div className="Chat" key={i}>
                <div className="meta">
                    <Skeleton variant="circular" animation={false} width={48} height={48}></Skeleton>
                </div>
                <div className="body">
                    <div className="info">
                        <div className="title">
                            <Skeleton variant="rounded" animation="wave" sx={{ borderRadius: '10px' }} width={Math.round(Math.random() * 50 + 50)} height={18} />
                        </div>
                        <div className="message-details">
                            <div className="message-time">
                                <Skeleton variant="rounded" animation="wave" sx={{ borderRadius: '10px' }} width={Math.round(Math.random() * 10 + 40)} height={10} />
                            </div>
                        </div>
                    </div>
                    <div className="subtitle">
                        <Skeleton variant="rounded" animation="wave" sx={{ borderRadius: '10px' }} width={Math.round(Math.random() * 200 + 100)} height={18} />
                    </div>
                </div>
            </div>)
    }
    return <>{divs}</>
})

export function getChatData(data) {
    if (data?.type === 'private') {
        return data.to
    } else {
        return data
    }
}

function getDateText(date) {
    if (!date)
        return ''
    const _date = new Date(date * 1000)
    const now = new Date()
    if (_date.getFullYear() === now.getFullYear() || (_date.getMonth() > now.getMonth() && _date.getFullYear() + 1 === now.getFullYear())) {
        if (_date.getMonth() === now.getMonth()) {
            if (_date.getDate() === now.getDate() || (_date.getDate() + 1 === now.getDate() && _date.getHours() + 6 >= now.getHours())) {
                return `${_date.getHours().toLocaleString('en-US', { minimumIntegerDigits: 2 })}:${_date.getMinutes().toLocaleString('en-US', { minimumIntegerDigits: 2 })}`
            } else if (_date.getDate() >= now.getDate() - 7) {
                const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                return weekday[_date.getDay()]
            }
        } else {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${months[_date.getMonth()]} ${_date.getDate().toLocaleString('en-US', { minimumIntegerDigits: 2 })}`
        }
    } else {
        return `${_date.getDate().toLocaleString('en-US', { minimumIntegerDigits: 2 })}.${(_date.getMonth() + 1).toLocaleString('en-US', { minimumIntegerDigits: 2 })}.${_date.getFullYear().toString().slice(2, 4)}`
    }
}

export default memo(Chat)