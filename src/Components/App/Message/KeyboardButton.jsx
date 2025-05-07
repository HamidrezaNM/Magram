import { memo, useState } from "react";
import buildClassName from "../../Util/buildClassName";
import { client } from "../../../App";
import { Api } from "telegram";
import LoadingButtonBorder from "../../common/LoadingButtonBorder";
import { openUrl } from "../../Util/url";
import { useDispatch } from "react-redux";
import { handleToast } from "../../Stores/UI";

function KeyboardButton({ button, messageId, peerId }) {
    const [isLoading, setIsLoading] = useState(false)

    const dispatch = useDispatch()

    const onButtonClick = async (button) => {
        setIsLoading(true)
        try {
            switch (button.className) {
                case 'KeyboardButtonCallback':
                    const result = await client.invoke(new Api.messages.GetBotCallbackAnswer({
                        data: button.data,
                        msgId: messageId,
                        peer: peerId
                    }))

                    if (result.message)
                        dispatch(handleToast({ icon: 'error', title: result.message }))
                    break;
                case 'KeyboardButtonUrl':
                    await openUrl(button.url, dispatch)
                    break;
                default:
                    dispatch(handleToast({ icon: 'error', title: 'This button is not currently supported.' }))
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