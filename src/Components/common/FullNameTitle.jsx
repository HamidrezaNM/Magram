import { memo, useMemo } from "react";
import CustomEmoji from "../App/Message/CustomEmoji";
import { getChatTitle } from "../Helpers/chats";
import { getUserFullName } from "../Helpers/users";

function FullNameTitle({ chat, isSavedMessages, showEmojiStatus = true }) {
    const isUser = chat?.className === 'User';
    const title = isUser ? getUserFullName(chat) : getChatTitle(chat);
    const fromChat = (chat?.title && chat?.firstName) && getChatTitle(chat)

    const specialTitle = () => {
        if (isSavedMessages) {
            return 'Saved Messages';
        }

        return undefined
    }

    const emojiStatus = useMemo(() => {
        if (showEmojiStatus && chat?.emojiStatus) {
            return <CustomEmoji documentId={chat.emojiStatus.documentId.value} autoPlay={window.Animations?.AnimatedStickers} />
        }
    })


    return <span>{specialTitle() || title}{emojiStatus && ' '}{emojiStatus}{fromChat && ` - ${fromChat}`}</span>
}

export default memo(FullNameTitle)