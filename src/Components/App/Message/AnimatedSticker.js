import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from "react";
import { downloadMedia } from "../../Util/media";
import { calculateMediaDimensions } from "./MessageMedia";
import Lottie from "react-lottie";
import { client } from "../../../App";

const AnimatedSticker = forwardRef(({ media, size, _width, _height, noAvatar = false, setProgress, isLoaded, setIsLoaded, setSrc, uploading, setIsDownloading }, ref) => {
    const [width, setWidth] = useState(_width)
    const [height, setHeight] = useState(_height)
    const [anim, setAnim] = useState()

    const aspectRatio = height / width
    const dimensions = calculateMediaDimensions(width, height, noAvatar)
    const img = useRef()
    const isLowQualityLoaded = useRef(false)
    const request = useRef()

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
        if (uploading) {
            img.current.src = uploading

            img.current.onload = () => {
                setWidth(img.current.offsetWidth)
                setHeight(img.current.offsetHeight)
            }
        }
    }, [uploading])

    useEffect(() => {
        if (isLowQualityLoaded.current && size === 16 || uploading || !media)
            return

        (async () => {
            const param = size ? { thumb: media.document.thumbs[0] } : {}
            const buffer = await client.downloadMedia(media, {

            })
            var blob = new Blob([buffer]);
            var url = window.URL.createObjectURL(blob)
            let src = url

            const options = {
                container: img.current,
                loop: true,
                autoplay: true,
                animationData: blob,
                fileId: media.document.id.value,
                width,
                height
            };
            window.RLottie.loadAnimation(options, _anim => {
                setAnim(_anim);

                // if (window.RLottie.hasFirstFrame(this.anim)) {
                // if (!eventListeners) return;

                // eventListeners.forEach(({ eventName, callback }) => {
                //     if (eventName === 'firstFrame') {
                //         callback && callback();
                //     }
                //     });
                // }
            });
            setSrc(src)
            // if (!result.thumbnail)
            //     setIsLoaded(true)
            // else
            //     isLowQualityLoaded.current = true
        })()
    }, [media, size])

    return <>
        {/* <img ref={img} width={width > 0 ? dimensions.width : ''} /> */}
        <div className="RlottiePlayer" ref={img}></div>
    </>
})


export default AnimatedSticker