import { memo, useEffect, useRef } from "react";

function RLottie({ sticker, width = 160, height = 160, autoplay = true, loop = false }) {

    const player = useRef()
    const anim = useRef()

    useEffect(() => {
        (async () => {
            const res = await fetch(process.env.PUBLIC_URL + '/tgs/' + sticker + '.json')
            const data = await res.json()

            const options = {
                container: player.current,
                loop,
                autoplay,
                stringData: JSON.stringify(data),
                fileId: sticker,
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
    }, [sticker])

    return <div className="RLottie" ref={player}></div>
}

export default memo(RLottie)