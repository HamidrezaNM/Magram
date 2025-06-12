import { memo, useContext, useEffect, useRef, useState } from "react";
import Transition from "../../Transition";
// import EmojiData from '@emoji-mart/data/sets/14/apple.json'
// import EmojiPicker from "@emoji-mart/react";
import { calculateMediaDimensions, isMobile, Video } from "../../Message/MessageMedia";
import { useDispatch, useSelector } from "react-redux";
import { Icon } from "../../common";
import Tabs from "../../../UI/Tabs";
import buildClassName from "../../../Util/buildClassName";
import TabContent from "../../../UI/TabContent";
import { client } from "../../../../App";
import { Api } from "telegram";
import { getDocumentFileName, getDocumentVideoAttributes } from "../../../Helpers/messages";
import { UserContext } from "../../../Auth/Auth";
import { messageAdded, updateMessageId } from "../../../Stores/Messages";

function Picker({ show, onEmojiSelect, onBackspace }) {
    const [tabIndex, setTabIndex] = useState(0)
    const [GIFs, setGIFs] = useState([])

    const darkMode = useSelector((state) => state.settings.darkMode)

    const emojiPicker = useRef()

    const dispatch = useDispatch()

    const handlePicker = () => {
        if (isMobile) {
            // setTimeout(() => {
            //     const emojiPickerSection = emojiPicker.current.querySelector('em-emoji-picker')
            //         .shadowRoot.querySelector("section")

            //     emojiPickerSection.setAttribute("style", "width: 100%");

            //     emojiPickerSection.children[2].children[0].setAttribute("style", "width: 100%");
            // }, 20);
        }
    }

    useEffect(() => {
        console.log(tabIndex);
        (async () => {
            if (tabIndex === 1 && !GIFs?.length) {
                const getGIFs = await client.invoke(new Api.messages.GetSavedGifs())

                setGIFs(getGIFs.gifs)
                console.log(getGIFs)
            }
        })()
    }, [tabIndex])

    // useEffect(() => {
    //     if (isMobile) {
    //         setTimeout(() => {
    //             const emojiPickerSection = emojiPicker.current.querySelector('em-emoji-picker')
    //                 .shadowRoot.querySelector("section")

    //             emojiPickerSection.setAttribute("style", "width: 100%");

    //             emojiPickerSection.children[2].children[0].setAttribute("style", "width: 100%");

    //             emojiPicker.current.classList.remove('animate')
    //         }, 0);
    //     }
    // }, [])


    return <Transition state={show} activeAction={handlePicker}>
        <div className="EmojiPicker animate" ref={emojiPicker}>
            <Tabs index={tabIndex} setIndex={setTabIndex} bottom tabs={<>
                <div className={buildClassName("Tab", tabIndex === 0 && 'active')} onClick={() => setTabIndex(0)}>
                    <span>Emojis</span>
                </div>
                <div className={buildClassName("Tab", tabIndex === 1 && 'active')} onClick={() => setTabIndex(1)}>
                    <span>GIFs</span>
                </div>
                <div className={buildClassName("Tab", tabIndex === 2 && 'active')} onClick={() => setTabIndex(2)}>
                    <span>Stickers</span>
                </div>
            </>}>
                <TabContent state={true}>
                    {/* <EmojiPicker
                        onEmojiSelect={onEmojiSelect}
                        theme={darkMode ? "dark" : "light"}
                        set="native"
                        previewPosition="none"
                        data={EmojiData} /> */}

                </TabContent>
                <TabContent state={true}>
                    <div className="scrollable" style={{
                        overflowX: 'hidden',
                        overflowY: 'overlay'
                    }}>
                        <div className="GIFs">
                            {tabIndex === 1 && GIFs && GIFs.map(item => <GIF document={item} dispatch={dispatch} />)}
                        </div>
                    </div>
                </TabContent>
                <TabContent state={tabIndex === 2}>
                    <div></div>
                </TabContent>
            </Tabs>
            <div className="Backspace">
                <Icon name="backspace" size={28} onClick={onBackspace} />
            </div>
        </div>
    </Transition>
}

const calculateGIFDimensions = (width, height) => {
    const aspectRatio = height / width;
    const windowWidth = window.innerWidth
    const availableWidthRem = (isMobile ? windowWidth : 22) * 16;
    const calculatedWidth = Math.min(width, availableWidthRem);
    const availableHeight = 120;
    const calculatedHeight = Math.round(calculatedWidth * aspectRatio);

    if (calculatedHeight > availableHeight) {
        return {
            width: Math.round(availableHeight / aspectRatio),
            height: availableHeight,
        };
    }

    return {
        height: calculatedHeight,
        width: calculatedWidth,
    };
}

const sendGIF = async (document, replyToMessage, chat, User, dispatch) => {
    const messageId = Date.now()
    const chatId = chat.id.value

    const _message = {
        chatId: chat.id,
        date: Date.now() / 1000,
        _sender: User,
        _senderId: User.id,
        fromId: User.id,
        out: true,
        id: messageId,
        message: '',
        media: new Api.MessageMediaDocument({ document }),
        isUploading: true,
        replyTo: replyToMessage ? replyToMessage.id : null,
        replyToMessage: replyToMessage ? replyToMessage : null,
    };

    dispatch(messageAdded(_message));

    const sendFileParams = {
        caption: null,
        file: document,
        replyTo: replyToMessage ? replyToMessage.id : null
    };

    try {
        const result = await client.sendFile(chatId, sendFileParams)

        dispatch(updateMessageId({ messageId, chatId, id: result.id }))
    } catch (error) {
        console.error('Send Error', error)
    }
}

export const GIF = memo(({ document, dispatch }) => {
    const [isLoaded, setIsLoaded] = useState(false)

    const User = useContext(UserContext)

    const activeChat = useSelector((state) => state.ui.activeChat)
    const replyToMessage = useSelector((state) => state.ui.replyToMessage)

    const videoAttributes = getDocumentVideoAttributes(document)
    const media = new Api.MessageMediaDocument({ document })

    const dimensions = calculateGIFDimensions(videoAttributes?.w, videoAttributes?.h)

    return <div className="GIF" onClick={() => sendGIF(document, replyToMessage, activeChat, User, dispatch)}>
        <Video
            media={media}
            details={{
                name: getDocumentFileName(document),
                duration: videoAttributes?.duration,
                size: Number(document.size?.value)
            }}
            size={16}
            visible={true}
            dimensions={dimensions}
            width={videoAttributes?.w}
            height={videoAttributes?.h}
            noAvatar={true}
            isLoaded={isLoaded}
            setIsLoaded={setIsLoaded}
            setProgress={() => { }}
            autoplay={true} />
    </div>
})

export default memo(Picker)