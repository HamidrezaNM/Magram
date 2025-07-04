import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import ContentEditable from "../../common/WrappedContentEditable";
import { Icon } from "../common";
import { useDispatch, useSelector } from "react-redux";
import { handleMessageError, messageAdded, updateMessage, updateMessageId, updateMessageMedia, updateMessageMediaUploadProgress } from "../../Stores/Messages";
import { client } from "../../../App";
import { chatAdded, setChat, updateLastMessage } from "../../Stores/Chats";
import { AuthContext, UserContext } from "../../Auth/Auth";
import { handleEditMessage, handleForwardMessage, handleReplyToMessage, handleSendBotCommand } from "../../Stores/UI";
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
import TurndownService from "turndown";
import Picker from "./Composer/Picker";
import Transition from "../Transition";
import { resolveUsername } from "../../Util/username";
import BotInlineResults from "./Composer/BotInlineResults";
import { handleCoolDown } from "../../Util/coolDown";
import buildClassName from "../../Util/buildClassName";

function Composer({ chat, thread, gradientRenderer, scrollToBottom, handleScrollToBottom }) {
    const [messageInput, setMessageInput] = useState("");
    const [messageInputHandled, setMessageInputHandled] = useState("");
    const [forcedPlaceholder, setForcedPlaceholder] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [botStarted, setBotStarted] = useState(false);
    const [muted, setMuted] = useState(false);
    const [joined, setJoined] = useState(false);
    const [botInlineResults, setBotInlineResults] = useState();
    const [botInlineResultsLoading, setBotInlineResultsLoading] = useState(false);

    const User = useContext(UserContext)

    const chats = useSelector((state) => state.chats.value)
    const activeFullChat = useSelector((state) => state.ui.activeFullChat)
    // const activeChat = useSelector((state) => state.ui.activeChat)
    const editMessage = useSelector((state) => state.ui.editMessage)
    const replyToMessage = useSelector((state) => state.ui.replyToMessage)
    const forwardMessage = useSelector((state) => state.ui.forwardMessage)
    const sendBotCommand = useSelector((state) => state.ui.sendBotCommand)
    const darkMode = useSelector((state) => state.settings.darkMode)
    const iOSTheme = useSelector((state) => state.settings.customTheme.iOSTheme)

    const ikUploadRefTest = useRef()
    const messageInputEl = useRef();
    const placeholderRef = useRef();
    const sendButton = useRef();
    const attachButton = useRef();
    const mobileKeyboardFiller = useRef();

    const input = messageInputEl.current?.querySelector('.input')

    const dispatch = useDispatch()
    const emoji = new EmojiConvertor()

    TurndownService.prototype.escape = e => e

    const sendMessage = useCallback(async (text) => {
        if (!text && (!messageInputHandled || messageInputHandled.trim().length === 0) && !forwardMessage?.message) {
            console.log('message is empty', messageInputHandled)
            return false;
        }
        let messageText = text?.trim() ?? messageInputHandled.replace(/&nbsp;/g, ' ').trim()
        messageText = handleInputTurndown(messageText)

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

        let media;

        let isDice = false

        if (messageText === '⚽' ||
            messageText === '🏀' ||
            messageText === '🎲' ||
            messageText === '🎯' ||
            messageText === '🎰') {
            isDice = true

            media = new Api.MessageMediaDice({
                emoticon: messageText,
                value: -1
            })
        }

        let _message;

        if (forwardMessage?.message && forwardMessage?.chat) {
            _message = {
                ...forwardMessage.message,
                chatId: chat.id,
                date: Date.now() / 1000,
                _forward: forwardMessage?.message,
                _sender: User,
                _senderId: User.id,
                fromId: User.id,
                out: true,
                id: messageId,
                fwdFrom: { date: forwardMessage.message.date },
                sended: null,
            }

            dispatch(handleForwardMessage())
        } else {
            _message = {
                chatId: chat.id,
                date: Date.now() / 1000,
                _forward: null,
                _sender: User,
                _senderId: User.id,
                fromId: User.id,
                out: true,
                id: messageId,
                message: !isDice ? messageText : '',
                media,
                fwdFrom: null,
                replyTo: replyToMessage ? replyToMessage.id : null,
                replyToMessage: replyToMessage ?? null,
                sended: null
            }
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
            let result

            if (forwardMessage?.message && forwardMessage?.chat) {
                result = (await client.forwardMessages(chatId, { messages: forwardMessage.message }))[0][0]
            } else if (!isDice)
                result = await client.sendMessage(chatId, message)
            else if (isDice) {
                const dice = await client.invoke(new Api.messages.SendMedia({
                    peer: chatId,
                    message: '',
                    media: new Api.InputMediaDice({
                        emoticon: messageText
                    })
                }))

                result = dice.updates[1].message

                dispatch(updateMessageMedia({ ...result, chatId, id: messageId }))
            }

            console.log('message result', result)

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
    }, [messageInputHandled, forwardMessage]);

    const handlePaste = (e) => {
        e.preventDefault();

        const text = (e.clipboardData || window.clipboardData).getData('text/plain');

        if (document.activeElement !== input) return;

        if (document.queryCommandSupported('insertText')) {
            document.execCommand('insertText', false, text);
        } else {
            input.innerText += text;
        }
    };

    const changeMessageInputHandler = useCallback(e => {
        if (e === null) e = ''
        var value = e.target ? e.target.value : e;
        if (value === '<br>')
            value = ''

        // emoji.replace_mode = 'img';
        // emoji.img_sets.apple.path = 'https://cdnjs.cloudflare.com/ajax/libs/emoji-datasource-apple/15.0.1/img/apple/64/'
        // emoji.allow_native = true;
        // emoji.include_title = true
        // var output = emoji.replace_colons(value);
        // emoji.colons_mode = true
        // var input = emoji.replace_unified(value)
        // input = input.replaceAll(/<img.*?title="(.*?)"(\/?)>/g, ":$1:")
        var output = value
        var input = value

        const sendIcon = iOSTheme ? 'north' : 'send'

        setMessageInputHandled(output)
        setMessageInput(input);

        if (input.startsWith('@')) {
            handleInlineBot(input).then(result => {
                if (!result) {
                    setForcedPlaceholder()
                    setBotInlineResults()
                }
            })
        } else {
            if (forcedPlaceholder)
                setForcedPlaceholder()
            if (botInlineResults)
                setBotInlineResults()
            setBotInlineResultsLoading(false)
        }

        if (value !== "" || forwardMessage) {
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
    }, [messageInput, forwardMessage, botInlineResults, forcedPlaceholder]);

    const handleInlineBot = async (html) => {
        if (!html.startsWith('@')) return

        const input = html.replace(/&nbsp;/g, ' ').trimStart()

        console.log(input)

        const match = input.match(/^(@\w*) (.*)?/)

        if (!match) return

        const username = match[1]
        const query = match[2]

        const resolvedUsername = await resolveUsername(username.substring(1))

        if (!resolvedUsername.bot) return

        if (!query && resolvedUsername.botInlinePlaceholder) {
            setForcedPlaceholder(`${username} ${resolvedUsername.botInlinePlaceholder}`)

            placeholderRef.current
                .classList.remove("hidden");
        } else
            setForcedPlaceholder()

        const action = async () => {
            setBotInlineResultsLoading(true)

            try {
                const results = await client.invoke(new Api.messages.GetInlineBotResults({
                    bot: username,
                    peer: chat.id,
                    query: query || '',
                    offset: ''
                }))

                if (results?.results?.length > 0)
                    setBotInlineResults(results)
                else if (botInlineResults)
                    setBotInlineResults()

                setBotInlineResultsLoading(false)
                console.log('results', results)
            } catch (error) {
                console.log(error)
            }
        }

        handleCoolDown(action)

        return true
    }

    const sendInlineBotResult = async (result, queryId) => {
        const chatId = chat.id.value
        const messageId = Date.now()

        var _message = {
            chatId: chat.id,
            date: Date.now() / 1000,
            _forward: null,
            _sender: User,
            _senderId: User.id,
            fromId: User.id,
            out: true,
            id: messageId,
            message: result.sendMessage.message || '',
            fwdFrom: null,
            replyTo: replyToMessage ? replyToMessage.id : null,
            replyToMessage: replyToMessage ?? null,
            sended: null,
            ...result.sendMessage
        }

        setBotInlineResults()

        dispatch(messageAdded(_message));
        setTimeout(() => {
            handleScrollToBottom()
        }, 40);
        if (replyToMessage) dispatch(handleReplyToMessage());

        handleSendButtonAnimation()

        try {
            let sendResult

            sendResult = await client.invoke(new Api.messages.SendInlineBotResult({
                id: result.id,
                queryId,
                peer: chatId,
                randomId: messageId,
                replyTo: replyToMessage ? replyToMessage.id : thread ? thread.id : null,
            }))

            console.log('message result', sendResult)

            dispatch(updateMessageId({ messageId, chatId, id: sendResult.updates[0].id }))

            if (!chats[chatId]) {
                console.log('Chat not exists')
                // await result.getChat()

                // const chat = {
                //     id: returnBigInt(chatId),
                //     entity: result.chat,
                //     message: result,
                //     title: result.chat.title ?? result.chat.firstName,
                //     date: result.date,
                //     isChannel: result.isChannel,
                //     isGroup: result.isGroup,
                //     isUser: result.isPrivate
                // }

                // dispatch(chatAdded(chat))
            }

            dispatch(updateLastMessage({ id: chat.id.value, message: { ..._message, id: sendResult.id } }))

        } catch (error) {
            console.error(error)
            dispatch(handleMessageError({ messageId: _message.id, chatId }))
        }
    }

    useEffect(() => {
        if (replyToMessage || editMessage || forwardMessage?.chat) {
            setTimeout(() => {
                messageInputEl.current.firstElementChild.focus();
            }, 10);
            setTimeout(() => {
                setTimeout(() => {
                    scrollToBottom.current.classList.add('hidden')
                }, 300);
            }, 0);
        }
        if (forwardMessage?.chat) {
            changeMessageInputHandler('')
        }
        if (editMessage) {
            changeMessageInputHandler(editMessage.message);
        }
    }, [replyToMessage, editMessage, forwardMessage]) // replyToMessage and editMessage transition

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

        if (gradientRenderer)
            gradientRenderer.toNextPosition()
    }

    const handleMessageInput = useCallback(() => {
        var input = messageInput
        // emoji.colons_mode = true
        // var input = emoji.replace_unified(messageInput)
        // input = input.replaceAll(/<img.*?title="(.*?)"(\/?)>/g, ":$1:")
        setMessageInputHandled(input)
    }, [messageInput])

    const handleInputTurndown = (value) => {
        var turndownService = new TurndownService()

        turndownService.addRule('div', {
            filter: ['div'],
            replacement: function (content) {
                return '\n' + content + '\n'
            }
        })

        return turndownService.turndown(value)
    }

    const htmlDecode = (input) => {
        var doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }

    const isMobile = detectMobile()

    const handleKeyDown = (e) => {

        if (!e.shiftKey && e.keyCode == 13 && !isMobile) {
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
        if (!input) return;

        input.addEventListener('paste', handlePaste);
        return () => input.removeEventListener('paste', handlePaste);
    }, [input])

    useEffect(() => {
        const listener = () => {
            const MIN_KEYBOARD_HEIGHT = 200

            const isMobile = window.innerWidth < 768
            const isKeyboardOpen = isMobile
                && window.screen.height - MIN_KEYBOARD_HEIGHT > window.visualViewport.height

            if (isKeyboardOpen) {
                mobileKeyboardFiller.current.classList.add('active')
                mobileKeyboardFiller.current.style.height = window.innerHeight - window.visualViewport.height + 'px'
                setShowEmojiPicker(false)
            } else {
                mobileKeyboardFiller.current.classList.remove('active')
                mobileKeyboardFiller.current.style.height = '0px'
            }
        }

        window.visualViewport.addEventListener('resize', listener)
        return () => window.visualViewport.removeEventListener('resize', listener)
    }, [mobileKeyboardFiller])

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
        <Transition state={!!replyToMessage}>
            <div className="PreviewMessage">
                <Icon name="reply" className="meta" />
                <div className="body">
                    <div className="title">Reply message</div>
                    <div className="subtitle" dir="auto">
                        {replyToMessage && <MessageText data={replyToMessage} includeFrom />}
                    </div>
                </div>
                <div
                    className="close icon"
                    onClick={() => dispatch(handleReplyToMessage())}
                >
                    close
                </div>
            </div>
        </Transition>
        <Transition state={!!editMessage}>
            <div className="PreviewMessage">
                <Icon name="edit" className="meta" />
                <div className="body">
                    <div className="title">Edit message</div>
                    {editMessage && <div className="subtitle" dir="auto"><MessageText data={editMessage} /></div>}
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
        </Transition>
        <Transition state={!!forwardMessage?.chat} onDeactivate={() => changeMessageInputHandler('')}>
            <div className="PreviewMessage">
                <Icon name="forward" className="meta" />
                <div className="body">
                    <div className="title">Forward message</div>
                    {forwardMessage?.message && <div className="subtitle" dir="auto"><MessageText data={forwardMessage?.message} /></div>}
                </div>
                <div
                    className="close icon"
                    onClick={() => {
                        dispatch(handleForwardMessage())
                    }}
                >
                    close
                </div>
            </div>
        </Transition>
        <Transition state={botInlineResults}>
            <BotInlineResults results={botInlineResults} sendInlineBotResult={sendInlineBotResult} />
        </Transition>
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
                <div className={buildClassName("message-input", botInlineResultsLoading && 'Loading')} ref={messageInputEl}>
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
                        <span className="placeholder" ref={placeholderRef}>{forcedPlaceholder || 'Message'}</span>
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
            <div className="MobileKeyboardFiller" ref={mobileKeyboardFiller}></div>
            <Picker
                show={showEmojiPicker}
                onEmojiSelect={e => { changeMessageInputHandler(messageInput + e.native) }}
                onBackspace={() => { changeMessageInputHandler(Array.from(messageInput).slice(0, -1).join('')) }}
            />
        </>}
    </>
}

function detectMobile() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
}

export default memo(Composer)