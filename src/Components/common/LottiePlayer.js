import { memo, useEffect, useRef, useState } from "react"
import '@thorvg/lottie-player';
import Pako from "pako";

function LottiePlayer({ data, fileId, loop, autoPlay, width, height }) {
    const [src, setSrc] = useState()

    const player = useRef()
    const anim = useRef()

    // useEffect(() => {
    //     const reader = new FileReader();
    //     reader.onload = async e => {
    //         try {
    //             const json = Pako.inflate(e.target.result, { to: 'string' });

    //             var blob = new Blob([json]);

    //             setSrc(window.URL.createObjectURL(blob))

    //         } catch (e) {
    //             return console.warn('Invalid blob ' + ' ' + e);
    //         }
    //     }
    //     reader.readAsArrayBuffer(data);
    // }, [])

    useEffect(() => {
        const options = {
            container: player.current,
            loop,
            autoplay: autoPlay,
            animationData: data,
            fileId,
            width,
            height
        };
        window.RLottie.loadAnimation(options, _anim => {
            // setAnim(_anim);
            anim.current = _anim

            // if (window.RLottie.hasFirstFrame(this.anim)) {
            // if (!eventListeners) return;

            // eventListeners.forEach(({ eventName, callback }) => {
            //     if (eventName === 'firstFrame') {
            //         callback && callback();
            //     }
            //     });
            // }
        });
        return () => {
            window.RLottie.destroy(anim.current)
        }
    }, [data])

    return <div className="RLottie" ref={player}></div>
    // return <div className="RLottie">
    //     {src && <lottie-player
    //         autoPlay={autoPlay}
    //         loop={false}
    //         mode="normal"
    //         src={src}
    //         style={{ width, height }}
    //     >
    //     </lottie-player>}
    // </div>
}

export default memo(LottiePlayer)