import { memo, useEffect, useRef, useState } from "react";
import '@thorvg/lottie-player';

function RLottie({ sticker, fileId, width = 160, height = 160, autoplay = true, loop = false, fromFrame, toFrame }) {
    // const [data, setData] = useState()

    const player = useRef()

    const anim = useRef()

    useEffect(() => {
        (async () => {
            const res = await fetch(process.env.PUBLIC_URL + '/tgs/' + sticker + '.json')
            const data = await res.json()

            if (fromFrame) data.ip = fromFrame
            if (toFrame) data.op = toFrame

            console.log(fromFrame, toFrame)
            // const player = document.querySelector('lottie-player');

            // setData(window.URL.createObjectURL(_data))
            // setData("https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json")

            // player.play()

            // player.load("https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json")

            const options = {
                container: player.current,
                loop,
                autoplay,
                stringData: JSON.stringify(data),
                fileId: fileId ?? sticker,
                width,
                height
            };
            window.RLottie.loadAnimation(options, _anim => {
                anim.current = _anim
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
}

export default memo(RLottie)