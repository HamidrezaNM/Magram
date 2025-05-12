import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react";
import { downloadMedia } from "../../Util/media";
import { calculateMediaDimensions } from "./MessageMedia";
import Lottie from "react-lottie";
import { client } from "../../../App";
import Transition from "../Transition";

const AnimatedSticker = forwardRef(({ media, size, _width, _height, isCustomEmoji = false, autoPlay = true, loop = true, setProgress, isLoaded, setIsLoaded, uploading, setIsDownloading }, ref) => {
    const [width, setWidth] = useState(_width)
    const [height, setHeight] = useState(_height)
    const [data, setData] = useState()
    const [isWebm, setIsWebm] = useState(false)
    const [isWebp, setIsWebp] = useState(false)

    const aspectRatio = height / width
    // const dimensions = calculateMediaDimensions(width, height, noAvatar)
    const img = useRef()
    const isLowQualityLoaded = useRef(false)
    const request = useRef()
    const anim = useRef()

    const onClick = (e) => {
        const { x, y } = img.current.getBoundingClientRect()
    }

    useImperativeHandle(ref, () => ({
        onSave() {
            var link = document.createElement("a");
            link.download = 'image.jpg';
            link.href = img.current.src;
            link.click();
        }
    }))

    useEffect(() => {
        if (isLowQualityLoaded.current && size === 16 || !media)
            return

        (async () => {
            //     const param = size ? { thumb: media.document.thumbs[0] } : {}
            const result = await downloadMedia(media, {}, null, false, true, null, true, isCustomEmoji)
            let data = result.data

            if (result.mimeType === 'video/webm') {
                setIsWebm(true)
                const src = window.URL.createObjectURL(data)
                setData(src)
            } else if (result.mimeType === 'image/webp') {
                setIsWebp(true)
                const src = window.URL.createObjectURL(data)
                setData(src)
            } else {
                const options = {
                    container: img.current,
                    loop,
                    autoplay: autoPlay,
                    animationData: data,
                    fileId: media.document.id.value,
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
                setData(true)
            }

            if (setIsLoaded)
                setIsLoaded(true)

            // setSrc(data)
            // if (!result.thumbnail)
            //     setIsLoaded(true)
            // else
            //     isLowQualityLoaded.current = true
        })()
        return () => {
            window.RLottie.destroy(anim.current)
        }
    }, [media, size])

    return <Transition state={true}>
        {!data && <span className="Loading"></span>}
        {isWebp ? <img width={20} height={20} src={data} /> :
            isWebm ? <video width={20} height={20} src={data} autoPlay={autoPlay} loop /> :
                <div className="RLottie" ref={img}></div>
        }
    </Transition>
})


export default memo(AnimatedSticker)