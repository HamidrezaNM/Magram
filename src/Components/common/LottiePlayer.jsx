import { memo, useEffect, useRef, useState } from "react"
import '@thorvg/lottie-player';
import Pako from "pako";

function LottiePlayer({ data, fileId, loop, autoPlay, width, height, returnData }) {
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
                const ctx = canvasRef.current.getContext('2d')

                const MIN_SIZE = 18;
                const MIDDLE_SIZE = 20;
                const MAX_SIZE = 24;
                const MIN_OPACITY = .16;
                const MIDDLE_OPACITY = .2;

                const canvasWidth = 340
                const canvasHeight = 180

                const positions = [
                    [307, 155, MIN_SIZE, MIN_OPACITY],
                    [68, 155, MIN_SIZE, MIN_OPACITY],
                    [317, 95, MIN_SIZE, MIN_OPACITY],
                    [58, 95, MIN_SIZE, MIN_OPACITY],
                    [292, 52, MIN_SIZE, MIN_OPACITY],
                    [83, 52, MIN_SIZE, MIN_OPACITY],
                    [213, 195, MIN_SIZE, MIDDLE_OPACITY],
                    [162, 195, MIN_SIZE, MIDDLE_OPACITY],
                    [273, 204, MIN_SIZE, MIN_OPACITY],
                    [102, 204, MIN_SIZE, MIN_OPACITY],
                    [253, 163, MIDDLE_SIZE, MIDDLE_OPACITY],
                    [120, 163, MIDDLE_SIZE, MIDDLE_OPACITY],
                    [258, 75, MIN_SIZE, MIDDLE_OPACITY],
                    [117, 75, MIN_SIZE, MIDDLE_OPACITY],
                    [269, 113, MAX_SIZE, MIDDLE_OPACITY],
                    [100, 113, MAX_SIZE, MIDDLE_OPACITY],
                    [230, 44, MIDDLE_SIZE, MIDDLE_OPACITY],
                    [143, 44, MIDDLE_SIZE, MIDDLE_OPACITY],
                    [187.5, 34, MIN_SIZE, MIDDLE_OPACITY]
                ]

                const dpr = canvasRef.current.dpr = window.devicePixelRatio;
                canvasRef.current.width = canvasWidth * dpr;
                canvasRef.current.height = canvasHeight * dpr;

                setTimeout(() => {
                    const frame = _anim.frameQueue.queue[0].frame
                    _anim.imageData.data.set(frame);

                    const image = imagedata_to_image(_anim.imageData)
                    image.onload = (() => {
                        positions.forEach(([x, y, size, alpha]) => {
                            ctx.globalAlpha = alpha;
                            ctx.drawImage(image, x * dpr, y * dpr, size * dpr, size * dpr)
                            // ctx.putImageData(_anim.imageData, x * dpr, y * dpr)
                        })

                        ctx.globalAlpha = 1;
                    })
                }, 2000);
            } else {
                player.current.querySelector('canvas').style.maxWidth = width + 'px'
                player.current.querySelector('canvas').style.maxHeight = height + 'px'
            }

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

    function imagedata_to_image(imagedata) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = imagedata.width;
        canvas.height = imagedata.height;
        ctx.putImageData(imagedata, 0, 0);

        var image = new Image();
        image.src = canvas.toDataURL();
        return image;
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