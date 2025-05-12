import { memo, useContext, useEffect, useRef, useState } from "react";
import { viewChat } from "./ChatList";
import { ChatContext } from "./ChatContext";
import { Icon, Profile } from "./common";
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
import { deleteChat, getChatType, getDeleteChatText } from "../Helpers/chats";
import buildClassName from "../Util/buildClassName";

function Chat({ info, isActive, onClick }) {
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const Auth = useContext(AuthContext);
    const User = useContext(UserContext);

    const ChatEl = useRef()

    const isMobile = document.body.clientWidth <= 480

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

    const handleArchive = async (turn) => {
        handleContextMenuClose()
        const result = await client.invoke(new Api.folders.EditPeerFolders({
            folderPeers: [new Api.InputFolderPeer({
                folderId: Number(turn),
                peer: info.inputEntity
            })]
        }))

        console.log(result)
    }

    const onLeaveGroup = () => {
        dispatch(removeChat(info.id.value))
        setOpenDeleteModal(false)
    }

    const leaveGroup = () => {
        (async () => {
            await deleteChat(info, User.id.value)
            onLeaveGroup()
        })()

    }

    const chatMenu = e => {
        e.preventDefault()

        const items = (
            <>
                <ChatContextMenu
                    canMute={true}
                    canMarkAsRead={true}
                    canArchive={!info.archived}
                    canUnarchive={info.archived}
                    canPin={true}
                    canDelete={true}
                    onArchive={() => handleArchive(true)}
                    onUnarchive={() => handleArchive(false)}
                    onDelete={handleDelete}
                />
            </>
        )

        dispatch(handleContextMenu({ items, type: 'chat', e, activeElement: ChatEl.current }))
    }

    return <><div ref={ChatEl} className={buildClassName("Chat", isActive && 'active')} onClick={() => { viewChat(info, dispatch); if (onClick) onClick(info) }}>
        <div className="meta"><Profile entity={info.entity} name={info.title} id={info.entity?.id.value} isSavedMessages={info.id.value === User.id.value} /></div>
        <div className="body">
            <div className="info">
                <div className="title"><FullNameTitle chat={info.entity} isSavedMessages={info.id.value === User.id.value} /></div>
                <div className="message-details">
                    {info.message?.out && (
                        <MessageSeen seen={info.dialog?.readOutboxMaxId >= info.message?.id} />
                    )}
                    <div className="message-time">{getDateText(info.message?.date)}</div>
                </div>
            </div>
            <div className="subtitle">
                <div className="last-message" dir="auto">{info.message ? <MessageText data={info.message} includeFrom={info.isGroup} /> : 'Loading...'}</div>
                {info.unreadMentionsCount ? info.unreadMentionsCount > 0 &&
                    <div className="unread" style={{ padding: 0 }}>
                        <Icon name="alternate_email" size={16} />
                    </div> : null}
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
                {getDeleteChatText(info.entity)}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to leave {info?.title}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenDeleteModal(false)}>CANCEL</Button>
                <Button color="error" onClick={leaveGroup}>
                    {getDeleteChatText(info.entity).toUpperCase()}
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