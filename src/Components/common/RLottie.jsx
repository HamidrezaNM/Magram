import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react";
import '@thorvg/lottie-player';
import { PUBLIC_URL } from "../../config";

const RLottie = forwardRef(({ sticker, fileId, width = 160, height = 160, autoplay = true, loop = false, fromFrame, toFrame }, ref) => {
    // const [data, setData] = useState()

    const player = useRef()

    const anim = useRef()
    const data = useRef()

    useImperativeHandle(ref, () => ({
        playFrames(fromFrame, toFrame) {
            window.RLottie.destroy(anim.current)
            console.log('play frames', fromFrame, toFrame)

            if (fromFrame) data.current.ip = fromFrame
            if (toFrame) data.current.op = toFrame

            const dpr = window.devicePixelRatio;

            const options = {
                container: player.current,
                loop,
                autoplay,
                stringData: JSON.stringify(data.current),
                fileId: fileId ?? sticker,
                width: width * dpr,
                height: height * dpr
            };
            window.RLottie.loadAnimation(options, _anim => {
                console.log('play animation', fromFrame, toFrame)
                anim.current = _anim

                player.current.querySelector('canvas').style.maxWidth = width + 'px'
                player.current.querySelector('canvas').style.maxHeight = height + 'px'
            });
        }
    }))

    useEffect(() => {
        (async () => {
            if (!data.current) {
                const res = await fetch(PUBLIC_URL + '/tgs/' + sticker + '.json')
                data.current = await res.json()
            }

            if (fromFrame) data.current.ip = fromFrame
            if (toFrame) data.current.op = toFrame

            // const player = document.querySelector('lottie-player');

            // setData(window.URL.createObjectURL(_data))
            // setData("https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json")

            // player.play()

            // player.load("https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json")

            const dpr = window.devicePixelRatio;

            const options = {
                container: player.current,
                loop,
                autoplay,
                stringData: JSON.stringify(data.current),
                fileId: fileId ?? sticker,
                width: width * dpr,
                height: height * dpr
            };
            window.RLottie.loadAnimation(options, _anim => {
                anim.current = _anim

                player.current.querySelector('canvas').style.maxWidth = width + 'px'
                player.current.querySelector('canvas').style.maxHeight = height + 'px'
            });
            return () => {
                window.RLottie.destroy(anim.current)
            }
        })()
    }, [sticker, fromFrame])

    return <div className="RLottie" ref={player}></div>
    // return <div className="RLottie">
    //     {data && <lottie-player
    //         autoPlay
    //         loop
    //         mode="normal"
    //         src={data}
    //         style={{ width: 128, height: 128 }}
    //     >
    //     </lottie-player>}
    // </div>
})

export default memo(RLottie)