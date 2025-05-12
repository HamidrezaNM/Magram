import { memo, useEffect, useState } from "react";
import { client } from "../../../App";
import { Api } from "telegram";
import AnimatedSticker from "./AnimatedSticker";
import RLottie from "../../common/RLottie";

function Dice({ media, visible }) {
    const [sticker, setSticker] = useState()
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        (async () => {
            const result = await client.invoke(new Api.messages.GetStickerSet({
                stickerset: new Api.InputStickerSetDice({
                    emoticon: media.emoticon
                })
            }))

            setSticker(result.documents[media.value])
        })()
    }, [])

    const getLoadingSticker = () => {
        switch (media.emoticon) {
            case '⚽':
                return 'fball_idle'
            case '🏀':
                return 'bball_idle'
            case '🎲':
                return 'dice_idle'
            case '🎯':
                return 'dart_idle'
            default:
                break;
        }
    }

    const loadingSticker = getLoadingSticker()

    return <div className="Dice">
        {visible && <>
            {!isLoaded &&
                <RLottie sticker={loadingSticker} width={128} height={128} autoplay loop />
            }
            {sticker &&
                <AnimatedSticker
                    media={new Api.MessageMediaDocument({ document: sticker })}
                    _width={128}
                    _height={128}
                    autoPlay={true}
                    loop={false}
                    setIsLoaded={setIsLoaded}
                />
            }
        </>
        }
    </div>
}

export default memo(Dice)