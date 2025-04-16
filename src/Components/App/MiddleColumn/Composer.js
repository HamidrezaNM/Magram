import { Picker } from "emoji-mart";
import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import ContentEditable from "../../common/WrappedContentEditable";
import { IKUpload } from "imagekitio-react";
import { Icon } from "../common";
import EmojiData from '@emoji-mart/data/sets/14/apple.json'
import { useDispatch, useSelector } from "react-redux";
import { handleMessageError, messageAdded, updateMessage, updateMessageId, updateMessageMedia, updateMessageMediaUploadProgress, updateMessageText } from "../../Stores/Messages";
import { client, socket } from "../../../App";
import { chatAdded, setChat, updateLastMessage } from "../../Stores/Chats";
import { AuthContext, UserContext } from "../../Auth/Auth";
import { handleEditMessage, handleReplyToMessage, handleSendBotCommand } from "../../Stores/UI";
import MessageText from "../MessageText";
import { EmojiConvertor } from "emoji-js";
import { Api } from "telegram";
import { getChatType } from "../../Helpers/chats";
import Attachment from "./Attachment";
import { CustomFile } from "telegram/client/uploads";
import { returnBigInt } from "telegram/Helpers";
import MenuItem from "../../UI/MenuItem";
import DropdownMenu from "../../UI/DropdownMenu";
import Menu from "../../UI/Menu";

function Composer({ chat, thread, scrollToBottom, handleScrollToBottom }) {
    const [messageInput, setMessageInput] = useState("");
    const [messageInputHandled, setMessageInputHandled] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [botStarted, setBotStarted] = useState(false);
    const [muted, setMuted] = useState(false);
    const [joined, setJoined] = useState(false);

    const Auth = useContext(AuthContext)
    const User = useContext(UserContext)

    const chats = useSelector((state) => state.chats.value)
    const activeFullChat = useSelector((state) => state.ui.activeFullChat)
    // const activeChat = useSelector((state) => state.ui.activeChat)
    const editMessage = useSelector((state) => state.ui.editMessage)
    const replyToMessage = useSelector((state) => state.ui.replyToMessage)
    const sendBotCommand = useSelector((state) => state.ui.sendBotCommand)
    const iOSTheme = useSelector((state) => state.ui.customTheme.iOSTheme)

    const ikUploadRefTest = useRef()
    const messageInputEl = useRef();
    const placeholderRef = useRef();
    const sendButton = useRef();
    const attachButton = useRef();

    const dispatch = useDispatch()
    const emoji = new EmojiConvertor()

    const sendMessage = useCallback(async (text) => {
        if (!text && (!messageInputHandled || messageInputHandled.trim().length === 0)) {
            console.log('message is empty', messageInputHandled)
            return false;
        }
        const messageText = text?.trim() ?? messageInputHandled.replace(/&nbsp;/g, ' ').trim()
        if (editMessage) {
            await client.invoke(new Api.messages.EditMessage({
                id: editMessage.id,
                message: messageText,
                peer: editMessage.chatId.value
            }))
            dispatch(handleEditMessage())
            dispatch(updateMessage({ id: editMessage.id, chatId: editMessage.chatId?.value, message: { ...editMessage, message: messageText, editDate: Date.now() } }))
            changeMessageInputHandler("");

            return true;
        }

        const chatId = chat.id.value
        const messageId = Date.now()

        const _message = {
            chatId: chat.id,
            date: Date.now() / 1000,
            forwardId: null,
            _sender: User,
            _senderId: User.id,
            fromId: User.id,
            out: true,
            id: messageId,
            message: messageText,
            replyTo: replyToMessage ? replyToMessage.id : null,
            replyToMessage: replyToMessage ?? null,
            sended: null,
            type: "text",
            messageType: "message",
        }

        const message = {
            message: messageText,
            replyTo: replyToMessage ? replyToMessage.id : thread ? thread.id : null,
        };

        // if (activeChat._id == 0 && activeChat.type == 'private')
        //     message.toId = activeChat.toId

        dispatch(messageAdded(_message));
        setTimeout(() => {
            handleScrollToBottom()
        }, 40);
        if (replyToMessage) dispatch(handleReplyToMessage());

        handleSendButtonAnimation()

        try {
            const result = await client.sendMessage(chatId, message)

            dispatch(updateMessageId({ messageId, chatId, id: result.id }))

            if (!chats[chatId]) {
                console.log('Chat not exists')
                await result.getChat()

                const chat = {
                    id: returnBigInt(chatId),
                    entity: result.chat,
                    message: result,
                    title: result.chat.title ?? result.chat.firstName,
                    date: result.date,
                    isChannel: result.isChannel,
                    isGroup: result.isGroup,
                    isUser: result.isPrivate
                }

                dispatch(chatAdded(chat))
            }

            dispatch(updateLastMessage({ id: chat.id.value, message: { ..._message, id: result.id } }))

        } catch (error) {
            console.error(error)
            dispatch(handleMessageError({ messageId: _message.id, chatId }))
        }
    }, [messageInputHandled]);

    const changeMessageInputHandler = useCallback(e => {
        if (e === null) e = ''
        var value = e.target ? e.target.value : e;
        if (value === '<br>')
            value = ''

        emoji.replace_mode = 'img';
        emoji.img_sets.apple.path = 'https://cdnjs.cloudflare.com/ajax/libs/emoji-datasource-apple/15.0.1/img/apple/64/'
        emoji.allow_native = true;
        emoji.include_title = true
        var output = emoji.replace_colons(value);
        emoji.colons_mode = true
        var input = emoji.replace_unified(value)
        input = input.replaceAll(/<img.*?title="(.*?)"(\/?)>/g, ":$1:")

        const sendIcon = iOSTheme ? 'north' : 'send'

        setMessageInputHandled(output)
        setMessageInput(input);

        if (value !== "") {
            setIsTyping(true)

            placeholderRef.current
                .classList.add("hidden");

            if (sendButton.current.children[0].innerHTML !== sendIcon) {
                sendButton.current.children[0].classList.add("animate");
                attachButton.current.querySelector('.icon').classList.add("hidden");
                setTimeout(() => {
                    attachButton.current.style.display = "none";
                }, 300);
                setTimeout(() => {
                    sendButton.current.children[0].innerHTML = sendIcon;
                    sendButton.current.children[0].classList.remove("animate");
                    sendButton.current.children[0].classList.add("send");
                }, 150);
            }
        } else {
            placeholderRef.current
                .classList.remove("hidden");
            sendButton.current.children[0].classList.add("animate");
            attachButton.current.style = "";
            setTimeout(() => {
                attachButton.current.querySelector('.icon').classList.remove("hidden");
            }, 0);
            setTimeout(() => {
                sendButton.current.children[0].innerHTML = "mic";
                sendButton.current.children[0].classList.remove("animate");
                sendButton.current.children[0].classList.remove("send");
            }, 150);
        }
    }, [messageInput]);

    useEffect(() => {
        if (replyToMessage || editMessage) {
            setTimeout(() => {
                document.querySelector(".PreviewMessage").classList.remove("animate");
                setTimeout(() => {
                    scrollToBottom.current.classList.add('hidden')
                }, 300);
            }, 0);
        }
        if (editMessage) {
            changeMessageInputHandler(editMessage.message);
            setTimeout(() => {
                messageInputEl.current.firstElementChild.focus();
            }, 10);
        }
    }, [replyToMessage, editMessage]) // replyToMessage and editMessage transition

    const handleSendButtonAnimation = () => {
        if (!sendButton.current) return;
        sendButton.current.firstElementChild.style =
            "transition:all .15s ease-out;";
        sendButton.current.firstElementChild.style.marginRight = "-42px";
        setTimeout(() => {
            changeMessageInputHandler("");
            setTimeout(() => {
                sendButton.current.firstElementChild.style.cssText +=
                    "transition:transform .3s ease;transform:scale(.9)";
                setTimeout(() => {
                    sendButton.current.firstElementChild.style.marginRight = "4px";
                    setTimeout(() => {
                        sendButton.current.firstElementChild.style = "";
                    }, 40);
                }, 100);
            }, 75);
        }, 100);
        messageInputEl.current.children[0].focus();
    }

    const handleMessageInput = useCallback(() => {
        emoji.colons_mode = true
        var input = emoji.replace_unified(messageInput)
        input = input.replaceAll(/<img.*?title="(.*?)"(\/?)>/g, ":$1:")
        setMessageInputHandled(input)
    }, [messageInput])

    const htmlDecode = (input) => {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }

    const handleKeyDown = (e) => {
        setTimeout(() => {
            // changeMessageInputHandler(event);
            // handleMessageInput()
        }, 0);
        if (!e.shiftKey && e.keyCode == 13) {
            e.preventDefault();
            handleMessageInput()
            sendMessage();
        }
    };

    const onJoinGroup = () => {
        dispatch(setChat(chat))
    }

    const handleJoinGroup = useCallback(async () => {
        await client.invoke(new Api.channels.JoinChannel({
            channel: chat.entity?.id.value
        }))
        setJoined(true)
    }, [User, chat])

    const handleToggleMute = useCallback(async () => {
        const result = await client.invoke(new Api.account.UpdateNotifySettings({
            peer: chat.entity?.id,
            settings: new Api.InputPeerNotifySettings({
                muteUntil: muted ? null : 2147483647,
            })
        }))
        console.log(result, chat)
        setMuted(!muted)
    }, [muted, chat])

    const onUploadMedia = async (file, buffer, media) => {
        const messageId = Date.now()
        const messageText = messageInputHandled.replace(/&nbsp;/g, ' ').trim()
        const chatId = chat.id.value

        const fileSize = file.size

        const _message = {
            chatId: chat.id,
            date: Date.now() / 1000,
            _sender: User,
            _senderId: User.id,
            fromId: User.id,
            out: true,
            id: messageId,
            message: messageText,
            media,
            isUploading: true,
            reply: replyToMessage ? replyToMessage : null,
        };

        dispatch(messageAdded(_message));
        handleScrollToBottom()

        const progressCallback = (e) => {
            var progress = { loaded: e * fileSize, total: fileSize }

            dispatch(updateMessageMediaUploadProgress({ id: messageId, chatId, progress }));
        }

        const sendFileParams = {
            caption: messageText,
            file: new CustomFile(file.name, fileSize, undefined, buffer),
            replyTo: replyToMessage ? replyToMessage.id : null,
            progressCallback
        };

        try {
            const result = await client.sendFile(chatId, sendFileParams)

            dispatch(updateMessageMediaUploadProgress({ id: messageId, chatId, progress: { loaded: fileSize, total: fileSize } }));
            dispatch(updateMessageId({ messageId, chatId, id: result.id }))

            handleSendButtonAnimation()
        } catch (error) {
            console.error('Upload Error', error)
        }
    }

    useEffect(() => {
        if (sendBotCommand) {
            sendMessage(sendBotCommand)
            dispatch(handleSendBotCommand())
        }
    }, [sendBotCommand])

    const restartBot = async () => {
        await client.invoke(new Api.contacts.Unblock({
            id: chat.entity.id
        }))
        sendMessage('/start')
        setBotStarted(true)
    }

    const startBot = () => {
        sendMessage('/start')
        setBotStarted(true)
    }

    useEffect(() => {
        if (isTyping) {
            // socket.emit('SendMessageAction', { token: Auth.authJWT, chatId: chat._id, action: 'typing' })

            setTimeout(() => {
                setIsTyping(false)
            }, 5000);
        }

    }, [isTyping])

    const allowSendingText = () => {
        return !(chat.entity?.defaultBannedRights?.sendMessages || chat.entity?.defaultBannedRights?.sendPlain || chat.entity?.bannedRights?.sendMessages || chat.entity?.bannedRights?.sendPlain)
    }

    const renderComposerButton = () => {
        if (chat?.entity?.left && !thread && !joined)
            return <div className="Button" onClick={handleJoinGroup}>Join</div>
        if (getChatType(chat?.entity) === 'Channel')
            return <div className="Button" onClick={handleToggleMute}>{muted ? 'Unmute' : 'Mute'}</div>
        if (getChatType(chat?.entity) === 'Bot' && !botStarted)
            if (activeFullChat?.blocked)
                return <div className="Button" onClick={restartBot}>Restart</div>
            else if (!chat.message)
                return <div className="Button" onClick={startBot}>Start</div>
        return undefined
    }

    const Emoji = <div className="emoji-button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
        <div className="icon">mood</div>
    </div>

    const Attach = <div className="attach-button" ref={attachButton}>
        <Attachment onUpload={onUploadMedia} />
        <Icon name="attachment" size="28" />
    </div>

    return <>
        {replyToMessage && (
            <div key={replyToMessage.id} className="PreviewMessage animate">
                <Icon name="reply" className="meta" />
                <div className="body">
                    <div className="title">Reply message</div>
                    <div className="subtitle" dir="auto">
                        <MessageText data={replyToMessage} includeFrom />
                    </div>
                </div>
                <div
                    className="close icon"
                    onClick={() => dispatch(handleReplyToMessage())}
                >
                    close
                </div>
            </div>
        )}
        {editMessage && (
            <div className="PreviewMessage animate">
                <Icon name="edit" className="meta" />
                <div className="body">
                    <div className="title">Edit message</div>
                    <div className="subtitle" dir="auto"><MessageText data={editMessage} /></div>
                </div>
                <div
                    className="close icon"
                    onClick={() => {
                        dispatch(handleEditMessage())
                        changeMessageInputHandler("");
                    }}
                >
                    close
                </div>
            </div>
        )}
        {renderComposerButton() ?? <>
            <div className="Composer">
                {getChatType(chat?.entity) === 'Bot' &&
                    activeFullChat?.botInfo?.commands && <>
                        <div className="commands">
                            <Menu icon="menu">
                                <DropdownMenu>
                                    <div className="scrollable" style={{
                                        width: '100%',
                                        maxHeight: '320px',
                                        minWidth: '320px'
                                    }}>
                                        {activeFullChat.botInfo.commands.map(
                                            item =>
                                                <MenuItem
                                                    title={'/' + item.command}
                                                    subtitle={item.description}
                                                    onClick={() => sendMessage('/' + item.command)}
                                                />
                                        )}
                                    </div>
                                    <hr />
                                    <MenuItem style={{ height: 33, minHeight: 'auto', paddingLeft: 32 }} title="COMMANDS" onClick={() => { }} />
                                </DropdownMenu>
                            </Menu>
                        </div>
                    </>}
                {
                    iOSTheme ? Attach : Emoji
                }
                {showEmojiPicker && <div style={{ position: 'absolute', bottom: 50 }}>
                    <Picker onEmojiSelect={(e) => { changeMessageInputHandler(messageInput + e.shortcodes) }} theme="dark" set="apple" previewPosition="none" data={EmojiData} />
                </div>}
                <div className="message-input" ref={messageInputEl}>
                    {allowSendingText() ? <>
                        <ContentEditable
                            dir="auto"
                            className="input"
                            html={messageInput} // innerHTML of the editable div
                            disabled={false}       // use true to disable editing
                            onChange={changeMessageInputHandler} // handle innerHTML change
                            onBlur={handleMessageInput}
                            onKeyDown={handleKeyDown}
                            tagName='div' // Use a custom HTML tag (uses a div by default)
                        />
                        <span className="placeholder" ref={placeholderRef}>Message</span>
                    </> : <><Icon name="lock" /><span className="disabled">Text not allowed</span></>}
                    {
                        iOSTheme ? Emoji : Attach
                    }
                </div>
                <div
                    className="send-button"
                    ref={sendButton}
                    onClick={() => {
                        sendMessage();
                    }}
                >
                    <span className="icon">mic</span>
                </div>
            </div>
        </>}
    </>
}

export default memo(Composer)