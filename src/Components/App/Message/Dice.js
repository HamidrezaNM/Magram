import { memo, useEffect, useMemo, useState } from "react";
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

            setSticker(new Api.MessageMediaDocument({
                document: result.documents[media.value]
            }))
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
        {media.emoticon === '🎰' ? <SlotMachine value={media.value} /> :
            <>
                {!isLoaded &&
                    <RLottie sticker={loadingSticker} width={128} height={128} autoplay loop />
                }
                {sticker &&
                    <AnimatedSticker
                        media={sticker}
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

const SlotMachine = memo(({ value }) => {
    const [stickerSet, setStickerSet] = useState()
    const [isLoaded, setIsLoaded] = useState(false)
    const [spinning, setSpinning] = useState(true)

    useEffect(() => {
        (async () => {
            const result = await client.invoke(new Api.messages.GetStickerSet({
                stickerset: new Api.InputStickerSetDice({
                    emoticon: '🎰'
                })
            }))

            setStickerSet(result.documents)
        })()
    }, [])

    var spinningTimeout;

    useEffect(() => {
        if (isLoaded)
            spinningTimeout = setTimeout(() => {
                setSpinning(false)
            }, 2000);

        return () => clearTimeout(spinningTimeout)
    }, [isLoaded])

    const stickers = useMemo(() => {
        return stickerSet?.map(doc => new Api.MessageMediaDocument({ document: doc }));
    }, [stickerSet]);

    const slots = useMemo(() => {
        const map = [1, 2, 3, 0]
        return [
            4 + map[(value - 1) & 3],
            10 + map[((value - 1) >> 2) & 3],
            16 + map[((value - 1) >> 4) & 3]
        ]
    }, [stickerSet]);

    return <div className="SlotMachine">

        {/* {!isLoaded &&
                <RLottie sticker={loadingSticker} width={128} height={128} autoplay loop />
            } */}
        {stickerSet && <>
            {/* Background */}
            <AnimatedSticker
                media={stickers[0]}
                _width={128}
                _height={128}
                autoPlay={true}
                loop={false}
                setIsLoaded={setIsLoaded}
            />
            {spinning ? <>
                <AnimatedSticker
                    media={stickers[8]}
                    _width={128}
                    _height={128}
                    autoPlay={true}
                    loop={true}
                    setIsLoaded={setIsLoaded}
                />
                <AnimatedSticker
                    media={stickers[14]}
                    _width={128}
                    _height={128}
                    autoPlay={true}
                    loop={true}
                    setIsLoaded={setIsLoaded}
                />
                <AnimatedSticker
                    media={stickers[20]}
                    _width={128}
                    _height={128}
                    autoPlay={true}
                    loop={true}
                    setIsLoaded={setIsLoaded}
                />
            </> : <>
                <AnimatedSticker
                    media={stickers[slots[0]]}
                    _width={128}
                    _height={128}
                    autoPlay={true}
                    loop={false}
                    setIsLoaded={setIsLoaded}
                />
                <AnimatedSticker
                    media={stickers[slots[1]]}
                    _width={128}
                    _height={128}
                    autoPlay={true}
                    loop={false}
                    setIsLoaded={setIsLoaded}
                />
                <AnimatedSticker
                    media={stickers[slots[2]]}
                    _width={128}
                    _height={128}
                    autoPlay={true}
                    loop={false}
                    setIsLoaded={setIsLoaded}
                />
            </>
            }
            {/* Frame and Handle */}
            <AnimatedSticker
                media={stickers[2]}
                _width={128}
                _height={128}
                autoPlay={true}
                loop={false}
                setIsLoaded={setIsLoaded}
            />
        </>
        }
    </div>
})