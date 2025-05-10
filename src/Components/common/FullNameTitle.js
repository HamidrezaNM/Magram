import { memo } from "react";
import CustomEmoji from "../App/Message/CustomEmoji";
import { getChatTitle } from "../Helpers/chats";
import { getUserFullName } from "../Helpers/users";

function FullNameTitle({ chat, isSavedMessages }) {
    const isUser = chat?.className === 'User';
    const title = isUser ? getUserFullName(chat) : getChatTitle(chat);
    const fromChat = (chat?.title && chat?.firstName) && getChatTitle(chat)

    const specialTitle = () => {
        if (isSavedMessages) {
            return 'Saved Messages';
        }

        return undefined
    }

    const emojiStatus = () => {
        if (chat?.emojiStatus) {
            return <CustomEmoji documentId={chat.emojiStatus.documentId.value} autoPlay={window.Animations?.AnimatedStickers} />
        }
    }


    return <span>{specialTitle() || title} {emojiStatus()}{fromChat && ` - ${fromChat}`}</span>
}

export default memo(FullNameTitle)