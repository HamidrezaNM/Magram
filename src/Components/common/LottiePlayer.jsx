import { memo, useEffect, useRef, useState } from "react"
import '@thorvg/lottie-player';
import Pako from "pako";

function LottiePlayer({ data, fileId, loop, autoPlay, width, height, returnData, onLoad }) {
    const [src, setSrc] = useState()

    const player = useRef()
    const anim = useRef()
    const canvasRef = useRef()

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
        const dpr = window.devicePixelRatio;

        const options = {
            container: player.current,
            loop,
            autoplay: autoPlay,
            animationData: data,
            fileId,
            returnData,
            width: width * dpr,
            height: height * dpr
        };
        window.RLottie.loadAnimation(options, _anim => {
            console.log('--------- lottie data :', _anim)
            // setAnim(_anim);
            anim.current = _anim

            if (returnData) {

            } else {
                player.current.querySelector('canvas').style.maxWidth = width + 'px'
                player.current.querySelector('canvas').style.maxHeight = height + 'px'
            }

            if (window.RLottie.hasFirstFrame(_anim.reqId) && onLoad) {
                if (!onLoad) return;

                // if (eventName === 'firstFrame') {
                // onLoad(_anim)
                // }
                // });
            }
        });
        if (onLoad)
            registerEvents([{ eventName: 'load', callback: handleLoad }]);
        return () => {
            window.RLottie.destroy(anim.current?.reqId ?? anim.current)
        }
    }, [data])

    const handleLoad = () => {
        onLoad(anim.current, canvasRef.current)
    }

    function registerEvents(eventListeners) {
        const reqId = anim.current?.reqId ?? anim.current
        console.log('[Rlottie] registerEvents', [reqId, eventListeners]);

        if (!reqId) return;

        if (!eventListeners) return;

        eventListeners.forEach(({ eventName, callback }) => {
            window.RLottie.addEventListener(reqId, eventName, callback);
        });
    }

    function unregisterEvents(eventListeners) {
        if (!anim.current) return;

        const reqId = anim.current?.reqId ?? anim.current

        if (!eventListeners) return;

        eventListeners.forEach(({ eventName, callback }) => {
            window.RLottie.removeEventListener(reqId, eventName, callback);
        });
    }

    return <div className="RLottie" ref={player}>
        {returnData && <canvas width={340} height={180} ref={canvasRef} />}
    </div>
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