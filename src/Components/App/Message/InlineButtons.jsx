import { memo } from "react";
import KeyboardButton from "./KeyboardButton";

function InlineButtons({ message }) {

    return <div className="InlineButtons">
        <div className="rows">
            {message.replyMarkup.rows.map(row => {
                return <div className="row">
                    {row.buttons.map(button => {
                        return <KeyboardButton key={message.id + button.text} button={button} messageId={message.id} peerId={message.peerId} />
                    })}
                </div>
            })}
        </div>
    </div>
}

export default memo(InlineButtons)