import { forwardRef, memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import "./Message.css";
import { AuthContext, UserContext } from "../Auth/Auth";
import { goToMessage, toDoubleDigit } from "./Home";
import { getChatColor, Icon, Profile } from "./common";
import MenuItem from "../UI/MenuItem";
import { socket } from "../../App";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Skeleton, Slide, Zoom } from "@mui/material";
import { ChatContext } from "./ChatContext";
import { useDispatch, useSelector } from "react-redux";
import { handleCall, handleContextMenu, handleEditMessage, handleGoToMessage, handlePinMessage, handlePinnedMessage, handleReplyToMessage, handleThread, handleUnpinMessage } from "../Stores/UI";
import MessageContextMenu from "./MessageContextMenu";
import { EmojiConvertor } from "emoji-js";
import MessageText, { getMessageText } from "./MessageText";
import MessageSeen from "./Message/MessageSeen";
import MessageMedia, { calculateMediaDimensions } from "./Message/MessageMedia";
import MessageProfileMenu from "./MessageProfileMenu";
import { showUserProfile } from "./Pages/UserProfile";
import MessageCall from "./Message/MessageCall";
import { getMediaDimensions, getMediaType } from "../Helpers/messages";
import { deleteMessage } from "../Util/messages";
import { getChatType } from "../Helpers/chats";
import MessageReactions from "./Message/MessageReactions";
import MessageMeta from "./Message/MessageMeta";
import FullNameTitle from "../common/FullNameTitle";

function Message({ data, prevMsgFrom, nextMsgFrom, prevMsgDate, isThread = false }) {
    const [openDeleteModal, setOpenDeleteModal] = useState(false)

    const [replyToMessage, setReplyToMessage] = useState()

    const isPinned = useRef(data.pin)

    const emoji = new EmojiConvertor()

    const Auth = useContext(AuthContext);
    const User = useContext(UserContext);

    const isAdmin = useSelector((state) => state.ui.value.activeChat?.isAdmin) ?? false // TODO: Replace it to Permissions

    const MessageEl = useRef()
    const messageText = useRef()
    const messageMedia = useRef()

    const dispatch = useDispatch()

    const isOutMessage = useRef(data.peerId?.userId?.value === User.id.value || data.out);
    const isAction = data.action !== undefined
    const msgTime = new Date(data.date * 1000);

    console.log('Message Rerendered', isOutMessage.current)

    useEffect(() => {
        MessageEl.current.removeEventListener('contextmenu', messageMenu)
        MessageEl.current.addEventListener('contextmenu', messageMenu)
        if (document.body.clientWidth <= 480) {
            MessageEl.current.onclick = messageMenu
        }
    }, [data.message, isPinned.current])

    useEffect(() => {
        (async () => {
            if (data.replyTo && !data.replyToMessage) {
                const reply = await data.getReplyMessage()
                data.replyToMessage = reply
                setReplyToMessage(reply)
            }
        })()
    }, [])

    // useEffect(() => {
    //     if (isPinned.current) {
    //         dispatch(handlePinMessage({ title: 'Pinned Message', subtitle: getMessageText(data, User._id), messageId: data._id }))
    //     }
    // }, [isPinned.current])

    const handleContextMenuClose = useCallback(() => {
        dispatch(handleContextMenu())
    }, [])

    const handleReply = useCallback(() => {
        console.log(data)
        dispatch(handleReplyToMessage(data)); handleContextMenuClose()
    }, [data])

    const handleCopy = useCallback(() => {
        copyTextToClipboard(data.text); handleContextMenuClose()
    }, [data.text])

    const handleSave = useCallback(() => {
        messageMedia.current.onSave(); handleContextMenuClose()
    }, [data.media])

    const handlePin = useCallback(() => {
        socket.emit('PinMessage', { token: Auth.authJWT, message: data, pin: !isPinned.current ?? true })
        socket.on('PinMessage', (response) => {
            if (response.ok) {
                if (!isPinned.current) {
                    isPinned.current = true
                    dispatch(handlePinMessage({ title: 'Pinned Message', subtitle: getMessageText(data, User._id), messageId: data._id }))
                } else {
                    isPinned.current = false
                    dispatch(handleUnpinMessage(data._id))
                }
                socket.off('PinMessage')
            }
        })
        handleContextMenuClose()
    }, [data, isPinned.current])

    const handleEdit = useCallback(() => {
        dispatch(handleEditMessage(data)); handleContextMenuClose()
    }, [data])

    const handleDelete = useCallback(() => {
        setOpenDeleteModal(true); handleContextMenuClose()
    }, [data])

    const handleViewProfile = useCallback(() => {
        showUserProfile(data._sender, dispatch)
        handleContextMenuClose()
    }, [data])

    const onDeleteMessage = async () => {
        handleClose()

        await deleteMessage(data.chatId, data.id, dispatch)
    }

    const handleClose = () => {
        setOpenDeleteModal(false)
    }

    async function copyTextToClipboard(text) {
        if ('clipboard' in navigator) {
            // messageText.current.select();
            return await navigator.clipboard.writeText(text);
        } else {
            // messageText.current.select();
            // return document.execCommand('copy');
        }
    }

    const messageMenu = useCallback((e) => {
        if (e.target.closest('a'))
            return;
        e.preventDefault()

        if (!(e.target.closest('.message-reply') || e.target.closest('.message-from-profile') || e.target.closest('.message-media') || e.target.closest('.MessageReactions') || e.target.closest('.Spoiler') || e.target.closest('a'))) {
            const items = (
                <>
                    <MessageContextMenu
                        canReply={true}
                        canCopy={true}
                        isPhoto={data.type === 'media'}
                        canPin={isAdmin && !isPinned.current}
                        canUnpin={isAdmin && isPinned.current}
                        canEdit={User.id.value === data._senderId?.value}
                        canDelete={User.id.value === data._senderId?.value || isAdmin}
                        onReply={handleReply}
                        onCopy={handleCopy}
                        onSavePhoto={handleSave}
                        onPin={handlePin}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </>
            )
            dispatch(handleContextMenu({ items, e }))
        } else if (e.target.closest('.message-from-profile')) {
            const items = (
                <>
                    <MessageProfileMenu
                        user={data._sender}
                        canCall={true}
                        onMessage={() => { }}
                        onCall={() => { }}
                        onView={handleViewProfile}
                    />
                </>
            )
            dispatch(handleContextMenu({ items, e }))
        }
    }, [data, isPinned.current])

    const renderReactionAndMeta = () => {
        const meta = <MessageMeta edited={data.edited} seen={data.seen} time={msgTime} isOutMessage={isOutMessage} />

        if (data.reactions && data.reactions.results.length > 0)
            return <MessageReactions messageId={data.id} chatId={data.chatId} reactions={data.reactions}>{meta}</MessageReactions>
        else
            return meta
    }

    const renderCommentSection = () => {
        const recentRepliers = data.replies.recentRepliers ? data.replies.recentRepliers.reverse() : []

        const repliersUsers = recentRepliers.map((item) => {
            return data._entities.get(item.userId?.value.toString())
        })

        const onClick = () => {
            dispatch(handleThread(data))
        }

        return <div className="Comments" onClick={onClick}>
            <div className="RecentRepliers">
                {repliersUsers.map((item) => {
                    return item?.accessHash && <Profile size={24} entity={item} id={item.id?.value} name={item.firstName} />
                })}
            </div>
            <span>{data.replies.replies} Comments</span>
        </div>
    }

    var isSameFromPrevMsg = prevMsgFrom === data._senderId?.value
    var isSameFromNextMsg = nextMsgFrom === data._senderId?.value

    var _msgDate = new Date(data.date * 1000)
    var _prevMsgDate = new Date(prevMsgDate * 1000)

    const noAvatar = getChatType(data._chat) !== 'Group'

    const isTransparent = () => {
        if (data.media) {
            const mediaType = getMediaType(data.media)

            if (mediaType === 'Sticker' || mediaType === 'RoundVideo')
                return true
        }
        return false
    }

    let mediaWidth

    if (data.media) {
        mediaWidth = getMediaDimensions(data.media, noAvatar)?.width - 18.4
    }

    return <>
        {(_msgDate.getFullYear() !== _prevMsgDate.getFullYear() ||
            _msgDate.getMonth() !== _prevMsgDate.getMonth() ||
            _msgDate.getDate() !== _prevMsgDate.getDate()) && <div className="sticky-date">
                <span>{getDate(data.date * 1000)}</span>
            </div>}
        <div className={`Message${isOutMessage.current ? " Out" : " In"}${isTransparent() ? " transparent" : ""}${isAction ? ' Action' : ''}`} id={data.id} ref={MessageEl} onDoubleClick={handleReply}>
            {(!isOutMessage.current && (isThread || !isAction && getChatType(data._chat) === 'Group')) && (
                <div className={"message-from-profile" + (isSameFromNextMsg ? ' hidden' : '')}>
                    <Profile entity={data.sender} name={data.sender?.firstName ?? data.sender?.title} id={data.sender?.id?.value} size={36} />
                </div>
            )}
            <div className={"bubble" + (getChatType(data._chat) !== 'Group' ? ' noAvatar' : '')}>
                <div className="body" style={{ width: mediaWidth ?? '' }}>
                    {(!isOutMessage.current && (isThread || !isAction && getChatType(data._chat) === 'Group')) && (!isSameFromPrevMsg && !data.media) && <div className={"from" + getChatColor(data._sender?.id?.value)}><FullNameTitle chat={data._sender} /></div>}
                    {data.replyTo && (!isThread || data.replyToMessage) && <div className={"message-reply" + getChatColor(data.replyToMessage?._sender?.id?.value ?? 0) + (data.media ? ' withMargin' : '')} onClick={() => dispatch(handleGoToMessage(data.replyToMessage?.id))}>
                        <div className="line"></div>
                        <div className="body">
                            <div className="title">{data.replyToMessage?._sender ? <FullNameTitle chat={data.replyToMessage?._sender} /> : 'Loading...'}</div>
                            <div className="subtitle" dir="auto"><MessageText data={data.replyToMessage ?? ''} /></div>
                        </div>
                    </div>}
                    <div className="message-text" dir="auto">
                        {data.media &&
                            <MessageMedia media={data.media} data={data} noAvatar={noAvatar} ref={messageMedia} />
                        }
                        {data.type === 'call' &&
                            <MessageCall data={data} />
                        }
                        <MessageText data={data} isInChat="true" />
                        {renderReactionAndMeta()}
                    </div>
                </div>
                {data.replies?.comments && renderCommentSection()}
            </div>
            <Dialog
                open={openDeleteModal}
                onClose={handleClose}
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
                <DialogTitle id="alert-dialog-title">
                    {"Do you want to delete this message?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        This will delete it for everyone in this chat.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>CANCEL</Button>
                    <Button color="error" onClick={onDeleteMessage}>
                        DELETE
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    </>;
}

export const getDate = (date, weekday = true, short = false) => {
    const _date = new Date(date)
    const now = new Date()
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const parsedMonth = short ? shortMonths : months

    if (_date.getFullYear() === now.getFullYear() || (_date.getMonth() > now.getMonth() && _date.getFullYear() + 1 === now.getFullYear())) {
        if (weekday && _date.getMonth() === now.getMonth()) {
            if (_date.getDate() === now.getDate()) {
                return 'Today'
            } else if (_date.getDate() + 1 === now.getDate())
                return 'Yesterday'
            else if (_date.getDate() >= now.getDate() - 7) {
                const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                return weekday[_date.getDay()]
            }
        } else {
            return `${parsedMonth[_date.getMonth()]} ${_date.getDate().toLocaleString('en-US', { minimumIntegerDigits: 2 })}`
        }
    } else {
        return `${parsedMonth[_date.getMonth()]} ${_date.getDate().toLocaleString('en-US', { minimumIntegerDigits: 2 })}, ${_date.getFullYear()}`
    }
}


export default memo(Message)