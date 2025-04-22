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
import { handleCall, handleContextMenu, handleEditMessage, handleGoToMessage, handlePinMessage, handlePinnedMessage, handleReplyToMessage, handleThread, handleToast, handleUnpinMessage } from "../Stores/UI";
import MessageContextMenu from "./MessageContextMenu";
import { EmojiConvertor } from "emoji-js";
import MessageText, { getMessageText } from "./MessageText";
import MessageSeen from "./Message/MessageSeen";
import MessageMedia, { calculateMediaDimensions, getMediaPosition } from "./Message/MessageMedia";
import MessageProfileMenu from "./MessageProfileMenu";
import { showUserProfile } from "./Pages/UserProfile";
import MessageCall from "./Message/MessageCall";
import { getMediaDimensions, getMediaType, isDocumentPhoto } from "../Helpers/messages";
import { deleteMessage, retractVote } from "../Util/messages";
import { generateChatWithPeer, getChatType } from "../Helpers/chats";
import MessageReactions from "./Message/MessageReactions";
import MessageMeta from "./Message/MessageMeta";
import FullNameTitle from "../common/FullNameTitle";
import buildClassName from "../Util/buildClassName";
import InlineButtons from "./Message/InlineButtons";
import { formatTime } from "../Util/dateFormat";
import { viewChat } from "./ChatList";

function Message({ data, seen, prevMsgFrom, nextMsgFrom, prevMsgDate, chatType, isThread = false, isiOS, unreadFrom }) {
    const [openDeleteModal, setOpenDeleteModal] = useState(false)

    const [replyToMessage, setReplyToMessage] = useState()

    const isPinned = useRef(data.pin)

    const emoji = new EmojiConvertor()

    const Auth = useContext(AuthContext);
    const User = useContext(UserContext);

    const isAdmin = useSelector((state) => state.ui.activeChat?.isAdmin) ?? false // TODO: Replace it to Permissions

    const MessageEl = useRef()
    const Bubble = useRef()
    const messageText = useRef()
    const messageMedia = useRef()

    const dispatch = useDispatch()

    const isOutMessage = useRef(data.peerId?.userId?.value === User.id.value || data.out);
    const isAction = data.action !== undefined
    const msgTime = new Date(data.date * 1000);
    const mediaPosition = data.media && getMediaPosition(data.media)
    const isMobile = document.body.clientWidth <= 480

    console.log('Message Rerendered')

    useEffect(() => {
        var isLongPressTimeout
        var holdTimeout

        if (isMobile) {
            if (isiOS) {
                MessageEl.current.oncontextmenu = e => e.preventDefault()
                MessageEl.current.ontouchstart = e => {
                    if (
                        e.target.closest('.message-reply') ||
                        e.target.closest('.message-media') ||
                        e.target.closest('.MessageReactions') ||
                        e.target.closest('.Spoiler') ||
                        e.target.closest('.Comments') ||
                        e.target.closest('.InlineButtons') ||
                        e.target.closest('a')
                    ) return

                    isLongPressTimeout = setTimeout(() => {
                        MessageEl.current.classList.add('hold')
                        holdTimeout = setTimeout(() => {
                            MessageEl.current.classList.remove('hold')
                            messageMenu(e)
                        }, 360);
                    }, 40);
                }
                MessageEl.current.ontouchend = MessageEl.current.ontouchmove = () => {
                    MessageEl.current.classList.remove('hold')
                    clearTimeout(isLongPressTimeout)
                    clearTimeout(holdTimeout)
                }
            } else
                MessageEl.current.onclick = messageMenu
        } else {
            MessageEl.current.removeEventListener('contextmenu', messageMenu)
            MessageEl.current.addEventListener('contextmenu', messageMenu)
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
    }, [data])

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
        copyTextToClipboard(data.text);

        handleContextMenuClose()

        dispatch(handleToast({
            icon: 'content_copy',
            title: 'Message copied to clipboard.'
        }))
    }, [data.text])

    const handleSave = useCallback(() => {
        messageMedia.current.onSave(); handleContextMenuClose()
    }, [data.media])

    const handlePin = useCallback(() => {
        // socket.emit('PinMessage', { token: Auth.authJWT, message: data, pin: !isPinned.current ?? true })
        // socket.on('PinMessage', (response) => {
        //     if (response.ok) {
        //         if (!isPinned.current) {
        //             isPinned.current = true
        //             dispatch(handlePinMessage({ title: 'Pinned Message', subtitle: getMessageText(data, User._id), messageId: data._id }))
        //         } else {
        //             isPinned.current = false
        //             dispatch(handleUnpinMessage(data._id))
        //         }
        //         socket.off('PinMessage')
        //     }
        // })
        handleContextMenuClose()
    }, [data, isPinned.current])

    const handleRetractVote = useCallback(async () => {
        retractVote(data.chatId, data.id, dispatch)
        handleContextMenuClose()
    }, [data])

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

        if (!(
            e.target.closest('.message-reply') ||
            e.target.closest('.message-from-profile') ||
            e.target.closest('.message-media') ||
            e.target.closest('.MessageReactions') ||
            e.target.closest('.Spoiler') ||
            e.target.closest('.Comments') ||
            e.target.closest('.InlineButtons') ||
            e.target.closest('a'))
        ) {
            const items = (
                <>
                    <MessageContextMenu
                        canReply={true}
                        canCopy={true}
                        isPhoto={data.type === 'media'}
                        canPin={isAdmin && !isPinned.current}
                        canUnpin={isAdmin && isPinned.current}
                        canRetractVote={data.media?.results?.results}
                        canEdit={User.id.value === data._senderId?.value}
                        canForward={true}
                        canDelete={User.id.value === data._senderId?.value || isAdmin || true}
                        onReply={handleReply}
                        onCopy={handleCopy}
                        onSavePhoto={handleSave}
                        onPin={handlePin}
                        onRetractVote={handleRetractVote}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </>
            )

            if (isMobile && isiOS) {
                const rect = Bubble.current.getBoundingClientRect()

                var top = rect.top + rect.height
                var left = rect.left + rect.width
                var width = rect.width
                var height = MessageEl.current.offsetHeight

                dispatch(handleContextMenu({ items, type: 'message', e, top, left, width, height, activeElement: MessageEl.current }))
            } else
                dispatch(handleContextMenu({ items, type: 'message', e }))
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

            if (isMobile && isiOS) {
                const rect = Bubble.current.getBoundingClientRect()

                var top = rect.top + rect.height
                var left = rect.left + rect.width
                var width = rect.width
                var height = MessageEl.current.offsetHeight

                dispatch(handleContextMenu({ items, type: 'message', e, top, left, width, height, activeElement: MessageEl.current }))
            } else
                dispatch(handleContextMenu({ items, type: 'message', e }))
        }
    }, [data, isPinned.current])

    const renderReactionAndMeta = () => {
        const meta = <MessageMeta
            edited={data.editDate && !data.editHide}
            views={data.views}
            postAuthor={data.postAuthor}
            seen={data.sended === undefined || data.sended === true ? seen : data.sended}
            time={msgTime}
            isOutMessage={isOutMessage} />

        if (data.reactions && data.reactions.results.length > 0)
            return <MessageReactions
                messageId={data.id}
                chatId={data._chatPeer}
                reactions={data.reactions}>
                {meta}
            </MessageReactions>
        else
            return meta
    }

    const renderCommentSection = () => {
        if (data.replies.repliesPts === 0) return;
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
                    return item?.accessHash &&
                        <Profile size={24}
                            entity={item}
                            id={item.id?.value}
                            name={item.firstName} />
                })}
            </div>
            <span>{data.replies.replies} Comments</span>
        </div>
    }

    const renderInlineButtons = () => {
        if (!data.replyMarkup || data.replyMarkup.className !== 'ReplyInlineMarkup') return;

        return <InlineButtons message={data} />
    }

    var isSameFromPrevMsg = prevMsgFrom === data._senderId?.value
    var isSameFromNextMsg = nextMsgFrom === data._senderId?.value

    var _msgDate = new Date(data.date * 1000)
    var _prevMsgDate = new Date(prevMsgDate * 1000)

    const noAvatar = isAction || !isThread && chatType !== 'Group'

    const isTransparent = () => {
        if (data.media) {
            const mediaType = getMediaType(data.media)

            if (
                mediaType === 'Sticker' ||
                mediaType === 'RoundVideo' ||
                ((
                    mediaType === 'Video' ||
                    mediaType === 'Photo' ||
                    mediaType === 'GIF'
                ) &&
                    !isDocumentPhoto(data.media.document) &&
                    data.message == '' &&
                    (
                        !data.reactions ||
                        !data.reactions.results.length
                    )
                ))
                return true
        }
        return false
    }

    let mediaWidth

    if (data.media) {
        mediaWidth = getMediaDimensions(data.media, noAvatar)?.width - 18.4
    }

    return <>
        {
            _msgDate.getFullYear() !== _prevMsgDate.getFullYear() ||
            _msgDate.getMonth() !== _prevMsgDate.getMonth() ||
            _msgDate.getDate() !== _prevMsgDate.getDate() &&
            <div className="sticky-date">
                <span>{getDate(data.date * 1000)}</span>
            </div>
        }
        <div
            className={buildClassName(
                'Message',
                isOutMessage.current ? 'Out' : 'In',
                isTransparent() && 'transparent',
                isAction && 'Action'
            )}
            id={data.id}
            ref={MessageEl}
            onDoubleClick={e => {
                if (!e.target.closest('.bubble'))
                    handleReply()
            }}
        >
            {(!isOutMessage.current && !noAvatar) && (
                <div className={buildClassName(
                    "message-from-profile",
                    isSameFromNextMsg && 'hidden'
                )}>
                    <Profile
                        entity={data._sender ?? data._chat}
                        name={data._sender?.firstName ??
                            data._sender?.title ??
                            data._chat?.title ??
                            'Anonymous'}
                        id={data._sender?.id?.value ??
                            data._chat?.id?.value}
                        size={42}
                    />
                </div>
            )}
            <div
                ref={Bubble}
                className={buildClassName("bubble",
                    noAvatar && 'noAvatar')}
            >
                <div className="bubble-content">
                    <div className="body" style={{ width: mediaWidth ?? '' }}>
                        {(!isOutMessage.current && !noAvatar) &&
                            (!isSameFromPrevMsg && !data.media) &&
                            <div className={buildClassName(
                                "from",
                                getChatColor(data._sender?.id?.value ?? data.chat?.id)
                            )}>
                                <FullNameTitle
                                    chat={data._sender ??
                                        data.chat ??
                                        { title: 'Anonymous' }} />
                            </div>}
                        {data.fwdFrom &&
                            <div className={buildClassName(
                                "message-forward",
                                (data.media && 'withMargin')
                            )}
                                onClick={() =>
                                    viewChat(generateChatWithPeer(data._forward._chat), dispatch)}>
                                <div className="title">
                                    <div>
                                        Forward from - {`${getDate(data.fwdFrom.date * 1000, true, true)} ${formatTime(data.fwdFrom.date * 1000)}`}
                                    </div>
                                    <div>
                                        {data._forward?._chat?.title ?? data._forward?._sender?.firstName}
                                    </div>
                                </div>
                            </div>}
                        {data.replyTo &&
                            (!isThread || data.replyToMessage) &&
                            <div className={
                                buildClassName("message-reply",
                                    getChatColor(data.replyToMessage?._sender?.id?.value ?? 0),
                                    (data.media && 'withMargin'))}
                                onClick={() => dispatch(handleGoToMessage(data.replyToMessage?.id))}
                            >
                                <div className="MessageLine"></div>
                                <div className="body">
                                    <div className="title">
                                        {data.replyToMessage ?
                                            <FullNameTitle chat={data.replyToMessage?._sender ?? { title: 'Anonymous' }} />
                                            : 'Loading...'}
                                    </div>
                                    <div className="subtitle" dir="auto">
                                        <MessageText data={data.replyToMessage ?? ''} />
                                    </div>
                                </div>
                            </div>}
                        <div className="message-text" dir="auto">
                            {data.media &&
                                mediaPosition === 'top' &&
                                <MessageMedia
                                    media={data.media}
                                    data={data}
                                    className={buildClassName(
                                        !data.message &&
                                        (!data.reactions || data.reactions.results?.length == 0) &&
                                        'NoCaption',
                                        'media-position-' + mediaPosition
                                    )}
                                    noAvatar={noAvatar}
                                    ref={messageMedia}
                                />
                            }

                            <MessageText data={data} isInChat="true" />

                            {data.media && mediaPosition === 'bottom' &&
                                <MessageMedia
                                    media={data.media}
                                    data={data}
                                    className={
                                        buildClassName(
                                            !data.message &&
                                            (!data.reactions || data.reactions.results?.length == 0) &&
                                            'NoCaption',
                                            'media-position-' + mediaPosition
                                        )}
                                    noAvatar={noAvatar}
                                    ref={messageMedia}
                                />
                            }
                            {renderReactionAndMeta()}
                        </div>
                    </div>
                    {data.replies?.comments &&
                        renderCommentSection()}
                </div>
                {renderInlineButtons()}
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
        {unreadFrom &&
            <div className="UnreadMessages">Unread Messages</div>}
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
            } else {
                return `${parsedMonth[_date.getMonth()]} ${_date.getDate().toLocaleString('en-US', { minimumIntegerDigits: 2 })}`
            }
        } else {
            return `${parsedMonth[_date.getMonth()]} ${_date.getDate().toLocaleString('en-US', { minimumIntegerDigits: 2 })}`
        }
    } else {
        return `${parsedMonth[_date.getMonth()]} ${_date.getDate().toLocaleString('en-US', { minimumIntegerDigits: 2 })}, ${_date.getFullYear()}`
    }
}


export default memo(Message)