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


    return <span>{specialTitle() || title}</span>
}