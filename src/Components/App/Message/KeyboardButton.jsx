import { memo, useState } from "react";
import buildClassName from "../../Util/buildClassName";
import { client } from "../../../App";
import { Api } from "telegram";
import LoadingButtonBorder from "../../common/LoadingButtonBorder";

function KeyboardButton({ button, messageId, peerId }) {
    const [isLoading, setIsLoading] = useState(false)

    const onButtonClick = async (button) => {
        setIsLoading(true)
        try {
            switch (button.className) {
                case 'KeyboardButtonCallback':
                    await client.invoke(new Api.messages.GetBotCallbackAnswer({
                        data: button.data,
                        msgId: messageId,
                        peer: peerId
                    }))
                    break;
            }
        } catch (error) {
            console.log(error)
        }
        setIsLoading(false)
    }

    return <div className={buildClassName("Button", isLoading && 'Loading')} onClick={() => onButtonClick(button)}>
        {button.text}
        {isLoading && <LoadingButtonBorder />}
    </div>
}

export default memo(KeyboardButton)