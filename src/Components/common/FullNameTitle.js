import CustomEmoji from "../App/Message/CustomEmoji";
import { getChatTitle } from "../Helpers/chats";
import { getUserFullName } from "../Helpers/users";

export default function FullNameTitle({ chat, isSavedMessages }) {
    const isUser = chat.className === 'User';
    const title = isUser ? getUserFullName(chat) : getChatTitle(chat);

    const specialTitle = () => {
        if (isSavedMessages) {
            return 'Saved Messages';
        }

        return undefined
    }

    const emojiStatus = () => {
        if (chat.emojiStatus) {
            console.log(chat.emojiStatus)
            return <CustomEmoji documentId={chat.emojiStatus.documentId.value} />
        }
    }


    return <span>{specialTitle() || title}{emojiStatus()}</span>
}