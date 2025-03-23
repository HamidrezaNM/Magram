import { memo } from "react"
import { useDispatch } from "react-redux"
import { handleSendBotCommand } from "../../Stores/UI"

function BotCommand({ command, children }) {
    const dispatch = useDispatch()

    return <a onClick={() => dispatch(handleSendBotCommand(command))}>{children}</a>
}

export default memo(BotCommand)