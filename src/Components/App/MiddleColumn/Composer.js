import { Picker } from "emoji-mart";
import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import ContentEditable from "../../common/WrappedContentEditable";
import { IKUpload } from "imagekitio-react";
import { Icon } from "../common";
import EmojiData from '@emoji-mart/data/sets/14/apple.json'
import { useDispatch, useSelector } from "react-redux";
import { handleMessageError, messageAdded, updateMessageId, updateMessageMedia, updateMessageMediaUploadProgress, updateMessageText } from "../../Stores/Messages";
import { client, socket } from "../../../App";
import { chatAdded, setChat, updateLastMessage } from "../../Stores/Chats";
import { AuthContext, UserContext } from "../../Auth/Auth";
import { handleEditMessage, handleReplyToMessage } from "../../Stores/UI";
import MessageText from "../MessageText";
import { EmojiConvertor } from "emoji-js";
import { Api } from "telegram";
import { getChatType } from "../../Helpers/chats";

function Composer({ scrollToBottom, handleScrollToBottom }) {
    const [messageInput, setMessageInput] = useState("");
    const [messageInputHandled, setMessageInputHandled] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const Auth = useContext(AuthContext)
    const User = useContext(UserContext)

    const chats = useSelector((state) => state.chats.value)
    const activeChat = useSelector((state) => state.ui.value.activeChat)
    const editMessage = useSelector((state) => state.ui.value.editMessage)
    const replyToMessage = useSelector((state) => state.ui.value.replyToMessage)

    const ikUploadRefTest = useRef()
    const messageInputEl = useRef();
    const placeholderRef = useRef();
    const sendButton = useRef();
    const attachButton = useRef();

    const dispatch = useDispatch()
    const emoji = new EmojiConvertor()

    const sendMessage = useCallback(async (isMedia) => {
        if (!messageInputHandled || messageInputHandled.trim().length === 0) {
            console.log('message is empty', messageInputHandled)
            return false;
        }
        const messageText = messageInputHandled.replace(/&nbsp;/g, ' ').trim()
        if (editMessage) {
            // socket.emit('UpdateMessage', { token: Auth.authJWT, message: { _id: message._id, chatId: message.chatId, fromId: message.fromId, message: messageInputHandled } })
            socket.emit('UpdateMessage', { token: Auth.authJWT, message: { _id: editMessage._id, chatId: editMessage.chatId, fromId: editMessage.fromId, message: messageText } })
            socket.on('UpdateMessage', (response) => {
                if (response.ok) {
                    dispatch(handleEditMessage())
                    dispatch(updateMessageText({ _id: editMessage._id, chatId: editMessage.chatId, message: messageText }))
                    changeMessageInputHandler("");
                    socket.off('UpdateMessage')
                }
            })
            return true;
        }

        const chatId = activeChat.id.value
        const messageId = Date.now()

        const _message = {
            chatId: activeChat.id,
            date: Date.now() / 1000,
            forwardId: null,
            _sender: User,
            _senderId: User.id,
            fromId: User.id,
            out: true,
            id: messageId,
            message: messageText,
            reply: replyToMessage ? replyToMessage : null,
            seen: null,
            type: "text",
            messageType: "message",
        }

        const message = {
            message: messageText,
            replyTo: replyToMessage ? replyToMessage.id : null,
        };

        // if (activeChat._id == 0 && activeChat.type == 'private')
        //     message.toId = activeChat.toId

        dispatch(messageAdded(_message));
        handleScrollToBottom()
        if (replyToMessage) dispatch(handleReplyToMessage());

        handleSendButtonAnimation()

        try {
            const result = await client.sendMessage(chatId, message)

            dispatch(updateMessageId({ messageId, chatId, id: result.id }))
            dispatch(updateLastMessage({ id: activeChat.id.value, message: { ..._message, id: result.id, seen: [] } }))

            if (!chats[chatId]) {
                await result.getChat()

                const chat = {
                    id: { value: chatId },
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

        } catch (error) {
            dispatch(handleMessageError({ messageId: message.id, chatId }))
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

        setMessageInputHandled(output)
        setMessageInput(input);

        if (value !== "") {
            setIsTyping(true)

            placeholderRef.current
                .classList.add("hidden");

            if (sendButton.current.children[0].innerHTML !== "send") {
                sendButton.current.children[0].classList.add("animate");
                attachButton.current.querySelector('.icon').classList.add("hidden");
                setTimeout(() => {
                    attachButton.current.style.display = "none";
                }, 300);
                setTimeout(() => {
                    sendButton.current.children[0].innerHTML = "send";
                    sendButton.current.children[0].classList.remove("animate");
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
        dispatch(setChat(activeChat))
    }

    const handleJoinGroup = useCallback(() => {
        client.invoke(new Api.channels.JoinChannel({
            channel: activeChat.entity.id.value
        }))
    }, [User, activeChat])

    const onUploadMedia = (e) => {
        const message = {
            chatId: activeChat._id,
            date: Date.now(),
            forwardId: null,
            from: User,
            fromId: User._id,
            id: Date.now(),
            media: e.target.files,
            message: htmlDecode(messageInputHandled),
            reply: replyToMessage ? replyToMessage : 0,
            seen: null,
            isUploading: true,
            type: "media",
            messageType: "message",
        };

        ikUploadRefTest.current.message = message
        dispatch(messageAdded(message));
        handleScrollToBottom()
    }

    const onUploadMediaProgress = (e) => {
        var message = ikUploadRefTest.current.message;
        message.media[0].progress = { loaded: e.loaded, total: e.total }

        dispatch(updateMessageMediaUploadProgress(message));
    }

    const onUploadMediaSuccess = (e) => {
        var message = ikUploadRefTest.current.message

        message = { ...message, media: [e] }

        delete message.isUploading

        handleSendButtonAnimation()

        socket.emit('SendMessage', { token: Auth.authJWT, message })
        socket.on('SendMessage', (response) => {
            if (response.ok) {
                dispatch(updateMessageId({ messageId: message.id, chatId: message.chatId, _id: response.data }))
                dispatch(updateLastMessage({ _id: message.chatId, message: { ...message, _id: response.data, seen: [] } }))
                dispatch(updateMessageMedia(message))

                socket.off('SendMessage')
            }
        })
    }

    useEffect(() => {
        if (isTyping) {
            socket.emit('SendMessageAction', { token: Auth.authJWT, chatId: activeChat._id, action: 'typing' })

            setTimeout(() => {
                setIsTyping(false)
            }, 5000);
        }

    }, [isTyping])

    return <>
        {replyToMessage && (
            <div key={replyToMessage.id} className="PreviewMessage animate">
                <Icon name="reply" className="meta" />
                <div className="body">
                    <div className="title">Reply message</div>
                    <div className="subtitle">
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
                    <div className="subtitle"><MessageText data={editMessage} /></div>
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
        {activeChat?.entity?.left ? <>
            <div className="Button" onClick={handleJoinGroup}>Join</div>
        </> : getChatType(activeChat?.entity) === 'Channel' ? <div className="Button" onClick={() => { }}>Mute</div> : <>
            <div className="Composer">
                <div className="emoji-button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <div className="icon">mood</div>
                </div>
                {showEmojiPicker && <div style={{ position: 'absolute', bottom: 50 }}>
                    <Picker onEmojiSelect={(e) => { changeMessageInputHandler(messageInput + e.shortcodes) }} theme="dark" set="apple" previewPosition="none" data={EmojiData} />
                </div>}
                <div className="message-input" ref={messageInputEl}>
                    {true || activeChat.permissions.sendText ? <>
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
                    <div className="attach-button" ref={attachButton}>
                        <IKUpload
                            isPrivateFile={false}
                            useUniqueFileName={true}
                            validateFile={file => file.size < 20000000}
                            overwriteFile={true}
                            onError={console.log}
                            onSuccess={onUploadMediaSuccess}
                            onUploadProgress={onUploadMediaProgress}
                            onUploadStart={onUploadMedia}
                            // style={{display: 'none'}} // hide the default input and use the custom upload button
                            ref={ikUploadRefTest}
                        />
                        <Icon name="attachment" size="28" />
                    </div>
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