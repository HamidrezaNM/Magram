import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import "./Message.css";
import { UserContext } from "../Auth/Auth";
import { getChatColor, Icon, Profile } from "./common";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { handleContextMenu, handleDeleteMessageEffect, handleDialog, handleEditMessage, handleGoToMessage, handlePinMessage, handlePinnedMessage, handleReplyToMessage, handleThread, handleToast, handleUnpinMessage } from "../Stores/UI";
import MessageContextMenu from "./MessageContextMenu";
import MessageText from "./MessageText";
import MessageMedia, { getMediaPosition } from "./Message/MessageMedia";
import MessageProfileMenu from "./MessageProfileMenu";
import { showUserProfile } from "./Pages/UserProfile";
import { getMediaDimensions, getMediaType, isDocumentGIF, isDocumentPhoto } from "../Helpers/messages";
import { deleteMessage, getMessageReadDate, getMessageReadParticipants, retractVote, saveGIF, sendReaction } from "../Util/messages";
import { generateChatWithPeer, getChatEntity, getChatIdFromPeer } from "../Helpers/chats";
import MessageReactions from "./Message/MessageReactions";
import MessageMeta from "./Message/MessageMeta";
import FullNameTitle from "../common/FullNameTitle";
import buildClassName from "../Util/buildClassName";
import InlineButtons from "./Message/InlineButtons";
import { formatTime } from "../Util/dateFormat";
import { viewChat } from "./ChatList";
import { calculateAlbumLayout } from "../Helpers/calculateAlbumLayout";
import Transition from "./Transition";
import { showForwardMessage } from "./Pages/Forward";

function Message({
    data,
    seen,
    prevMsgFrom,
    nextMsgFrom,
    prevMsgDate,
    groupedMessages,
    chatType,
    isThread = false,
    isiOS,
    unreadFrom
}) {
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [quickReply, setQuickReply] = useState(false)

    const [replyToMessage, setReplyToMessage] = useState()

    const isPinned = data.pinned

    // const emoji = new EmojiConvertor()

    const User = useContext(UserContext);

    const isAdmin = useSelector((state) => state.ui.activeChat?.isAdmin) ?? false // TODO: Replace it to Permissions

    const MessageEl = useRef()
    const Bubble = useRef()
    const BubbleContent = useRef()
    const messageMedia = useRef()
    const bubbleDimensions = useRef({})

    const dispatch = useDispatch()

    const isOutMessage = useRef(data.peerId?.userId?.value === User.id.value || data.out);
    const isAction = data.action !== undefined
    const msgTime = new Date(data.date * 1000);
    const mediaPosition = data.media && getMediaPosition(data.media)
    const isMobile = document.body.clientWidth <= 480

    const isAlbum = data.groupedId && !!groupedMessages

    const albumLayout = isAlbum ? calculateAlbumLayout(isOutMessage.current, true, [data, ...groupedMessages]) : undefined;

    console.log('Message Rerendered')

    useEffect(() => {
        bubbleDimensions.current = BubbleContent.current.getBoundingClientRect()

        dragElement(MessageEl.current)
    }, [])

    const handleDeleteEffect = () => {
        dispatch(handleDeleteMessageEffect(MessageEl.current))
    }

    useEffect(() => {
        if (data.deleted) {
            handleDeleteEffect()
        }
    }, [data])

    useEffect(() => {
        var isLongPressTimeout
        var holdTimeout

        const ontouchstart = e => {
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

        const ontouchmove = () => {
            MessageEl.current.classList.remove('hold')
            clearTimeout(isLongPressTimeout)
            clearTimeout(holdTimeout)
        }

        if (isMobile) {
            if (isiOS) {
                MessageEl.current.oncontextmenu = e => e.preventDefault()
                MessageEl.current.addEventListener('touchstart', ontouchstart)
                MessageEl.current.addEventListener('touchmove', ontouchmove)
                MessageEl.current.addEventListener('touchend', ontouchmove)
            } else
                MessageEl.current.onclick = messageMenu
        } else {
            MessageEl.current.removeEventListener('contextmenu', messageMenu)
            MessageEl.current.addEventListener('contextmenu', messageMenu)
        }

        return () => {
            MessageEl.current?.removeEventListener('touchstart', ontouchstart)
            MessageEl.current?.removeEventListener('touchmove', ontouchmove)
            MessageEl.current?.removeEventListener('touchend', ontouchmove)
        }
    }, [data.message, isPinned])

    useEffect(() => {
        const dimensions = BubbleContent.current.getBoundingClientRect()

        if (BubbleContent.current &&
            (
                dimensions.width !== bubbleDimensions.current?.width ||
                dimensions.height !== bubbleDimensions.current?.height
            )) {

            BubbleContent.current.style.width = bubbleDimensions.current.width + 'px'
            BubbleContent.current.style.height = bubbleDimensions.current.height + 'px'

            requestAnimationFrame(() => {
                BubbleContent.current.classList.add('sizeAnimating')
                requestAnimationFrame(() => {
                    BubbleContent.current.style.width = dimensions.width + 'px'
                    BubbleContent.current.style.height = dimensions.height + 'px'
                })
            })

            setTimeout(() => {
                BubbleContent.current.current?.classList.remove('sizeAnimating')

                BubbleContent.current.style.width = ''
                BubbleContent.current.style.height = ''
            }, 300);

            bubbleDimensions.current = dimensions

            console.log('Message Update Transition');
        }


        (async () => {
            if (data.replyTo && !data.replyToMessage) {
                if (!data.replyTo.replyFrom) {
                    var reply
                    if (data._replyMessage)
                        reply = data._replyMessage
                    else
                        reply = await data.getReplyMessage()


                    if (data.replyTo.quoteText)
                        reply.message = data.replyTo.quoteText

                    data.replyToMessage = reply
                    setReplyToMessage(reply)
                } else {
                    let replyChat

                    if (data.replyTo.replyToPeerId) {
                        replyChat = data._entities.get(getChatIdFromPeer(data.replyTo.replyToPeerId))

                        if (!replyChat)
                            replyChat = await getChatEntity(data.replyTo.replyToPeerId)
                    }

                    const replyData = {
                        id: data.replyTo.replyToMsgId,
                        chat: replyChat,
                        _sender: {
                            title: replyChat?.title,
                            firstName: data.replyTo.replyFrom.fromName ?? data.replyTo.replyFrom.postAuthor,
                            className: (data.replyTo.replyFrom.fromName || data.replyTo.replyFrom.postAuthor) ? 'User' : 'Channel'
                        },
                        message: data.replyTo.quoteText,
                        media: data.replyTo.replyMedia
                    }

                    data.replyToMessage = replyData
                    setReplyToMessage(replyData)
                }

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

    const handleCopyLink = useCallback(() => {
        copyTextToClipboard(`https://t.me/${data._chat.username}/${data.id}`);

        handleContextMenuClose()

        dispatch(handleToast({
            icon: 'content_copy',
            title: 'Message copied to clipboard.'
        }))
    }, [data.text])

    const handleSave = useCallback(() => {
        messageMedia.current.onSave(); handleContextMenuClose()
    }, [data.media])


    const handleSaveGif = useCallback(() => {
        try {
            saveGIF(data.media.document)
            dispatch(handleToast({ icon: 'gif_box', title: 'Added to Favorite GIFs' }))
        } catch (error) {
            dispatch(handleToast({ icon: 'error', title: error.errorMessage }))
        }
        handleContextMenuClose()
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

    const handleForward = useCallback(() => {
        showForwardMessage(data, dispatch); handleContextMenuClose()
    }, [data])

    const handleDelete = useCallback(() => {
        dispatch(handleDialog({
            type: 'deleteMessage',
            message: data,
            onDeleteMessage
        }))
        handleContextMenuClose()
        // setOpenDeleteModal(true); handleContextMenuClose()
    }, [data])

    const handleReaction = useCallback((reaction, rect, element) => {
        handleContextMenuClose()
        return sendReaction(data.chatId, data.id, reaction, data.reactions?.results, rect, element, dispatch)
    }, [data])

    const handleGetReadParticipants = useCallback(() => {
        return getMessageReadParticipants(data.chatId, data.id)
    }, [data])

    const handleGetReadDate = useCallback(() => {
        return getMessageReadDate(data.chatId, data.id)
    }, [data])

    const handleViewProfile = useCallback(() => {
        showUserProfile(data._sender, dispatch)
        handleContextMenuClose()
    }, [data])

    const onDeleteMessage = async (revoke = true) => {
        handleClose()

        await deleteMessage(data.chatId, data.id, dispatch, revoke)
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
            const items =
                <MessageContextMenu
                    canReply={true}
                    canCopy={true}
                    canCopyLink={data._chat?.username}
                    isPhoto={data.type === 'media'}
                    canPin={!isPinned}
                    canUnpin={isPinned}
                    canRetractVote={data.media?.results?.results}
                    canSaveGif={data.media && isDocumentGIF(data.media.document)}
                    canEdit={Number(User.id) === Number(data._senderId)}
                    canForward={true}
                    canDelete={
                        User.id.value === data._senderId?.value ||
                        chatType === 'User' ||
                        chatType === 'Bot'}
                    canReaction={true}
                    canReadParticipants={chatType === 'Group' && isOutMessage.current && seen}
                    canReadDate={chatType === 'User' && isOutMessage.current && seen}
                    onReply={handleReply}
                    onCopy={handleCopy}
                    onCopyLink={handleCopyLink}
                    onSavePhoto={handleSave}
                    onSaveGif={handleSaveGif}
                    onPin={handlePin}
                    onRetractVote={handleRetractVote}
                    onEdit={handleEdit}
                    onForward={handleForward}
                    onDelete={handleDelete}
                    onReaction={handleReaction}
                    readParticipants={handleGetReadParticipants}
                    readDate={handleGetReadDate}

                    isPrivate={chatType === 'User' ||
                        chatType === 'Bot'}
                />

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
    }, [data])

    const dragElement = (element) => {
        var originX = 0, originY, x = 0, y = 0, firstTouch = true, vibrate = false;
        const max = 80;

        element.ontouchstart = dragMouseDown;

        function dragMouseDown(e) {
            let touch = e.touches[0] || e.changedTouches[0];

            originX = touch.pageX;
            originY = touch.pageY;

            document.ontouchend = closeDragElement;
            document.ontouchmove = elementDrag;
        }

        function elementDrag(e) {
            let touch = e.touches[0] || e.changedTouches[0];

            x = touch.pageX - originX;
            y = touch.pageY - originY;

            // Prevent Move Element When Scrolling
            if (firstTouch) {
                if (Math.abs(y) > 3) {
                    closeDragElement()
                    return
                }
                firstTouch = false
            }

            if (!element.classList.contains('Dragging'))
                element.classList.add('Dragging')

            if (x > 0) x = 0
            if (x > max) x = max
            if (x < -max) x = -max

            if (x < -10) {
                setQuickReply(true)
            }

            if (x > -10) {
                setQuickReply(false)
                vibrate = false
            }

            if (x < -60 && !vibrate) {
                navigator.vibrate(1)
                vibrate = true
            }

            element.style.left = x + "px";
        }

        function closeDragElement() {
            element.classList.remove('Dragging')
            element.style.left = '';

            if (x < -60) handleReply()

            setQuickReply(false)

            firstTouch = true
            vibrate = false

            document.ontouchend = null;
            document.ontouchmove = null;
        }
    }

    const renderAlbum = () => {
        if (!data.groupedId || !groupedMessages) return

        const mediaType = getMediaType(data.media)

        if (mediaType !== 'Photo' && mediaType !== 'Video') {
            return <>
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
                {groupedMessages.map((item) =>
                    <div key={item.id} id={item.id}>
                        <MessageMedia
                            media={item.media}
                            data={item}
                            key={item.id}
                            className={buildClassName(
                                !data.message &&
                                (!data.reactions || data.reactions.results?.length == 0) &&
                                'NoCaption',
                                'media-position-' + mediaPosition
                            )}
                            noAvatar={noAvatar}
                            ref={messageMedia}
                        />
                        <MessageText data={item} isInChat />
                    </div>)}
            </>
        }

        return <div className="Album" style={{ height: albumLayout.containerStyle.height + 'px' }}>
            <MessageMedia
                media={data.media}
                data={data}
                dimensions={albumLayout.layout[0].dimensions}
                className={buildClassName(
                    !data.message &&
                    (!data.reactions || data.reactions.results?.length == 0) &&
                    'NoCaption',
                    'media-position-' + mediaPosition
                )}
                noAvatar={noAvatar}
                ref={messageMedia}
            />
            {groupedMessages.map((item, index) =>
                <div style={{
                    position: 'absolute',
                    top: albumLayout.layout[index + 1].dimensions.y,
                    left: albumLayout.layout[index + 1].dimensions.x
                }}>
                    <MessageMedia
                        media={item.media}
                        data={item}
                        dimensions={albumLayout.layout[index + 1].dimensions}
                        className={buildClassName(
                            !data.message &&
                            (!data.reactions || data.reactions.results?.length == 0) &&
                            'NoCaption',
                            'media-position-' + mediaPosition
                        )}
                        noAvatar={noAvatar}
                        ref={messageMedia}
                    />
                </div>)}
        </div>
    }

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
            <div className="RecentRepliers ParticipantProfiles">
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
                mediaType === 'Dice' ||
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
        if (isAlbum && albumLayout)
            mediaWidth = albumLayout.containerStyle.width - 18.4
        else
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
                if (!e.target.closest('.bubble') && !isMobile)
                    handleReply()
            }}
        >
            <Transition state={quickReply}>
                <div className="QuickReply">
                    <div className="Container">
                        <Icon name="reply" size={24} />
                    </div>
                </div>
            </Transition>
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
                <div className="bubble-content" ref={BubbleContent}>
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
                                {data._viaBot && <span className="viaBot">via @{data._viaBot.username}</span>}
                            </div>}
                        {data.fwdFrom &&
                            <div className={buildClassName(
                                "message-forward",
                                (data.media && 'withMargin')
                            )}
                                onClick={() => {
                                    if (data._forward._chat || data._forward._sender)
                                        viewChat(generateChatWithPeer(data._forward._chat ?? data._forward._sender), dispatch)
                                    else
                                        dispatch(handleToast({ icon: 'error', title: 'The account was hidden by the user.' }))
                                }}>
                                <div className="title">
                                    <div>
                                        Forward from - {`${getDate(data.fwdFrom.date * 1000, true, true)} ${formatTime(data.fwdFrom.date * 1000)}`}
                                    </div>
                                    <div>
                                        {data.fwdFrom.fromName ?? data._forward?._chat?.title ?? data._forward?._sender?.firstName}
                                    </div>
                                </div>
                            </div>}
                        {data.replyTo &&
                            (!isThread || data.replyToMessage) &&
                            <div className={
                                buildClassName("message-reply",
                                    getChatColor(data.replyToMessage?._sender?.id?.value ?? 0),
                                    (data.media && 'withMargin'))}
                                onClick={() => {
                                    if (data.replyToMessage.chat) viewChat(generateChatWithPeer(data.replyToMessage.chat), dispatch);
                                    dispatch(handleGoToMessage(data.replyToMessage?.id))
                                }}
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
                            {data.media && mediaPosition === 'top' &&
                                (data.groupedId && groupedMessages ? renderAlbum() :
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
                                    />)
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

export function isElementInViewport(el) {
    if (!el) return;

    const AddedSize = 200

    var rect = el.getBoundingClientRect();

    return (
        rect.top + rect.height + AddedSize >= 0 &&
        // rect.left >= 0 &&
        rect.bottom - rect.height - AddedSize <= (window.innerHeight || document.documentElement.clientHeight) /* or $(window).height() */
        // rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
}

export default memo(Message)