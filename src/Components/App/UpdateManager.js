import { memo, useEffect, useRef } from "react";
import { client } from "../../App";
import { Api } from "telegram";
import ChatHandler from "./Handlers/ChatHandler";
import { UpdateConnectionState } from "telegram/network";
import MessagesHandler from "./Handlers/MessagesHandler";

function UpdateManager() {
    const connectionState = useRef(1)
    const state = useRef({})
    const chatHandler = useRef()
    const messagesHandler = useRef()

    const onUpdate = async (update) => {
        switch (update.className) {
            case 'UpdateUserStatus':
                chatHandler.current.onUpdate({
                    type: 'UpdateUserStatus',
                    ...update
                })
                break;
            case 'UpdateChannel':
                chatHandler.current.onUpdate({
                    type: 'UpdateChannel',
                    channel: update._entities.entries().next().value
                })
                break;
            case 'UpdateReadHistoryOutbox':
            case 'UpdateReadHistoryInbox':
                chatHandler.current.onUpdate({
                    type: 'UpdateReadHistory',
                    ...update
                })
                break;
            case 'UpdateReadChannelOutbox':
            case 'UpdateReadChannelInbox':
                chatHandler.current.onUpdate({
                    type: 'UpdateReadHistory',
                    peer: new Api.PeerChannel({ channelId: update.channelId }),
                    ...update
                })
                break;
            case 'UpdateUserTyping':
            case 'UpdateChannelUserTyping':
                chatHandler.current.onUpdate({
                    type: update.className,
                    ...update
                })
                break;
            case 'UpdateEditMessage':
            case 'UpdateEditChannelMessage':
                messagesHandler.current.onUpdate({
                    type: update.className,
                    ...update
                })
                break;
            case 'UpdateDeleteChannelMessages':
            case 'UpdateDeleteMessages':
                messagesHandler.current.onUpdate({
                    type: update.className,
                    ...update
                })
                break;
            default:
                break;
        }

        if (update instanceof UpdateConnectionState) {
            if (connectionState.current !== update.state && update.state === 1) {

                console.log('handle reconnect')

                if (state.current?.pts) {
                    const difference = await client.invoke(new Api.updates.GetDifference({
                        pts: state.current.pts,
                        qts: state.current.qts,
                        date: state.current.date
                    }))

                    if (difference.className === 'updates.Difference') {
                        onDifference(difference)
                    }

                    state.current = difference.state

                    console.log(difference)
                }
            }
            connectionState.current = update.state
        } else {
            const stateResult = await client.invoke(new Api.updates.GetState())

            state.current = stateResult
        }
    }

    const onDifference = async (difference) => {
        if (difference.state?.pts <= state.current?.pts) return

        if (difference.newMessages?.length) {
            difference.newMessages.forEach(message => {
                messagesHandler.current.onUpdate({
                    type: 'NewMessage',
                    message
                })
            })
        }
        if (difference.otherUpdates?.length) {
            difference.otherUpdates.forEach(update => {
                switch (update.className) {
                    case 'UpdateChannel':
                        chatHandler.current.onUpdate({
                            type: 'UpdateChannel',
                            channel: update.chats[0]
                        })
                        break;
                    case 'UpdateReadChannelOutbox':
                        chatHandler.current.onUpdate({
                            type: 'UpdateReadHistoryOutbox',
                            peer: '-100' + update.channelId,
                            ...update
                        })
                        break;
                    case 'UpdateReadHistoryOutbox':
                        chatHandler.current.onUpdate({
                            type: 'UpdateReadHistoryOutbox',
                            ...update
                        })
                        break;
                    case 'UpdateEditMessage':
                    case 'UpdateEditChannelMessage':
                        messagesHandler.current.onUpdate({
                            type: update.className,
                            ...update
                        })
                        break;
                    case 'UpdateDeleteChannelMessages':
                    case 'UpdateDeleteMessages':
                        messagesHandler.current.onUpdate({
                            type: update.className,
                            ...update
                        })
                        break;
                    default:
                        break;
                }
            })
        }
    }

    useEffect(() => {
        (async () => {
            const stateResult = await client.invoke(new Api.updates.GetState())

            state.current = stateResult
        })()

        client.addEventHandler(onUpdate);
        return () => {
            client.removeEventHandler(onUpdate)
        }
    }, [])

    return <>
        <ChatHandler ref={chatHandler} />
        <MessagesHandler ref={messagesHandler} />
    </>
}

export default memo(UpdateManager)