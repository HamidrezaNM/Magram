import { CircularProgress, circularProgressClasses } from "@mui/material";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react"
import { useDispatch } from "react-redux";
import { Icon } from "../common";
import Transition from "../Transition";
import { handleMediaPreview } from "../../Stores/UI";
import { getDocumentFileName, getDocumentImageAttributes, getDocumentVideoAttributes, getMediaDimensions, getPhotoDimensions, isDocumentSticker, isDocumentVideo } from "../../Helpers/messages";
import { downloadMedia } from "../../Util/media";
import AnimatedSticker from "./AnimatedSticker";

const MessageMedia = forwardRef(({ media, data, noAvatar = false }, ref) => {
    const [size, setSize] = useState(16)
    const [progress, setProgress] = useState()
    const [isLoaded, setIsLoaded] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [waitForSave, setWaitForSave] = useState(false)
    const [src, setSrc] = useState(false)
    const [uploading, setUploading] = useState()

    const image = useRef()
    const messageMedia = useRef()
    const type = useRef()

    const dispatch = useDispatch()

    const mediaDimensions = getMediaDimensions(media)

    useEffect(() => {
        if (mediaDimensions) {
            messageMedia.current.style.height = mediaDimensions?.h > 0 ? calculateMediaDimensions(mediaDimensions?.w, mediaDimensions?.h, noAvatar).height + 'px' : ''
        }
    }, [])

    useEffect(() => {
        if (data.progress) {
            setProgress(data.progress)
            if (data.progress.loaded === data.progress.total) {
                setIsLoaded(true)
            }
        }
    }, [data.progress])

    useEffect(() => {
        if (isLoaded && waitForSave) {
            image.current.onSave()
            setWaitForSave(false)
        }
    }, [isLoaded, waitForSave])

    // useEffect(() => {
    //     if (data.isUploading && media) {
    //         var fr = new FileReader();

    //         fr.readAsDataURL(media[0]);

    //         fr.onload = function (e) {
    //             setUploading(this.result)
    //         };
    //     }
    // }, [media])

    const downloadMedia = () => {
        if (isDownloading) {
            image.current.onAbort()
            setSize(16)
            setIsDownloading(false)
        } else {
            // messageMedia.current.querySelector('img').transformation = {}
            setSize()
            setIsDownloading(true)
            try {
                image.current.onDownload()
            } catch (error) {

            }
        }
    }

    const previewMedia = () => {
        if (!isLoaded) {
            return;
        }

        if (type.current !== 'document') {
            const mediaSrc = src

            dispatch(handleMediaPreview({ message: data, media, mediaSrc }))
        } else {
            var link = document.createElement("a");
            link.download = extractFileName(media[0].name);
            link.href = src;
            link.target = '_blank'
            link.click();
        }
    }

    useImperativeHandle(ref, () => ({
        onSave() {
            if (isLoaded) {
                image.current.onSave()
            } else {
                if (!isDownloading) {
                    downloadMedia()
                    setWaitForSave(true)
                }
            }
        }
    }))

    const getMediaLayout = () => {
        const downloadButton = <Transition state={!isLoaded}>
            <div className="message-loading-progress" onClick={downloadMedia}>
                <Icon name={(isDownloading || data.isUploading) ? "close" : "arrow_downward"} size={28} />
                {(isDownloading || data.isUploading) && <CircularProgress variant="determinate" style={{ color: '#fff', animation: 'spinner 3s linear infinite' }} sx={{ [`& .${circularProgressClasses.circle}`]: { strokeLinecap: 'round' } }} thickness={3} size={48} value={progress && progress.loaded / progress.total > .01 ? (progress.loaded / progress.total) * 100 : 1} />}
            </div>
        </Transition>

        switch (media.className) {
            case 'MessageMediaPhoto':
                return <Image ref={image} media={media} size={size} _width={getPhotoDimensions(media.photo)?.w} _height={getPhotoDimensions(media.photo)?.h} noAvatar={noAvatar} isLoaded={isLoaded} setIsLoaded={setIsLoaded} setProgress={setProgress} setSrc={setSrc} uploading={uploading} setIsDownloading={setIsDownloading}>{downloadButton}</Image>
            case 'MessageMediaDocument':
                if (isDocumentVideo(media.document)) {
                    const videoAttributes = getDocumentVideoAttributes(media.document)

                    if (videoAttributes?.roundMessage) {
                        return <RoundVideo ref={image} media={media} details={{ name: getDocumentFileName(media.document), duration: videoAttributes?.duration, size: Number(media.document.size.value) }} size={size} width={videoAttributes?.w} height={videoAttributes?.h} noAvatar={noAvatar} uploading={uploading} isLoaded={isLoaded} setIsLoaded={setIsLoaded} setProgress={setProgress} setSrc={setSrc} setIsDownloading={setIsDownloading} autoplay={videoAttributes?.nosound}>{downloadButton}</RoundVideo>
                    }

                    return <Video ref={image} media={media} details={{ name: getDocumentFileName(media.document), duration: videoAttributes?.duration, size: Number(media.document.size?.value) }} size={size} width={videoAttributes?.w} height={videoAttributes?.h} noAvatar={noAvatar} uploading={uploading} isLoaded={isLoaded} setIsLoaded={setIsLoaded} setProgress={setProgress} setSrc={setSrc} setIsDownloading={setIsDownloading} autoplay={videoAttributes?.nosound}>{downloadButton}</Video>
                }
                if (isDocumentSticker(media.document)) {
                    const attributes = getDocumentImageAttributes(media.document)
                    const dimensions = getStickerDimensions(attributes.w, attributes.h)
                    if (media.document.mimeType === 'application/x-tgsticker')
                        return <AnimatedSticker ref={image} media={media} size={size} _width={dimensions?.width} _height={dimensions?.height} noAvatar={noAvatar} isLoaded={isLoaded} setIsLoaded={setIsLoaded} setProgress={setProgress} setSrc={setSrc} uploading={uploading} setIsDownloading={setIsDownloading} />
                    return <Sticker ref={image} media={media} size={size} _width={dimensions?.width} _height={dimensions?.height} noAvatar={noAvatar} isLoaded={isLoaded} setIsLoaded={setIsLoaded} setProgress={setProgress} setSrc={setSrc} uploading={uploading} setIsDownloading={setIsDownloading}>{downloadButton}</Sticker>
                }
                return <Document ref={image} media={media} details={{ name: getDocumentFileName(media.document), size: Number(media.document.size?.value) }} noAvatar={noAvatar} isLoaded={isLoaded} setIsLoaded={setIsLoaded} setProgress={setProgress} setSrc={setSrc}>{downloadButton}</Document>
            default:
                break;
        }
    }

    return <div className="message-media" ref={messageMedia} onClick={previewMedia}>
        {getMediaLayout()}
    </div>
})

export default memo(MessageMedia)

const Document = forwardRef(({ children, media, details, setProgress, isLoaded, setIsLoaded, setSrc }, ref) => {
    const file = useRef()
    const request = useRef()

    useImperativeHandle(ref, () => ({
        onAbort() {
            console.log('Document aborted')
            request.current.abort()
        },
        onSave() {
            var link = document.createElement("a");
            link.download = details.name && extractFileName(details.name);
            link.href = file;
            link.target = '_blank'
            link.click();
        },
        onDownload() {
            (async () => {
                const result = await downloadMedia(media, {}, (e) => setProgress({ loaded: Number(e.value), total: details.size }))

                var _src = result.data
                file.current = _src;
                setSrc(_src)
                setIsLoaded(true)
            })()
        }
    }))

    return <div className="Document">
        {children}
        <div className="details">
            <div className="title">{details.name && extractFileName(details.name)}</div>
            <div className="subtitle">{formatBytes(details.size)}</div>
        </div>
    </div>
})

const MOBILE_SCREEN_NO_AVATARS_MESSAGE_EXTRA_WIDTH_REM = 4.5;
const MOBILE_SCREEN_MESSAGE_EXTRA_WIDTH_REM = 7;
const MESSAGE_MAX_WIDTH_REM = 29;
const MESSAGE_OWN_MAX_WIDTH_REM = 30;
const REM = 16
const isMobile = window.innerWidth < 480
const STICKER_SIZE_INLINE_MOBILE_FACTOR = 11
const STICKER_SIZE_INLINE_DESKTOP_FACTOR = 13

let cachedMaxWidthOwn;
let cachedMaxWidth;
let cachedMaxWidthNoAvatar;

function getMaxMessageWidthRem(noAvatar = false) {
    const regularMaxWidth = MESSAGE_MAX_WIDTH_REM;
    if (!isMobile) {
        return regularMaxWidth;
    }

    const windowWidth = window.innerWidth

    // @optimization Limitation: changing device screen width not supported
    if (!cachedMaxWidthOwn) {
        cachedMaxWidthOwn = Math.min(
            MESSAGE_OWN_MAX_WIDTH_REM,
            windowWidth / REM - MOBILE_SCREEN_NO_AVATARS_MESSAGE_EXTRA_WIDTH_REM,
        );
    }
    if (!cachedMaxWidth) {
        cachedMaxWidth = Math.min(
            MESSAGE_MAX_WIDTH_REM,
            windowWidth / REM - MOBILE_SCREEN_MESSAGE_EXTRA_WIDTH_REM,
        );
    }
    if (!cachedMaxWidthNoAvatar) {
        cachedMaxWidthNoAvatar = Math.min(
            MESSAGE_MAX_WIDTH_REM,
            windowWidth / REM - MOBILE_SCREEN_NO_AVATARS_MESSAGE_EXTRA_WIDTH_REM,
        );
    }

    return noAvatar ? cachedMaxWidthNoAvatar : cachedMaxWidth
}

export const calculateMediaDimensions = (width, height, noAvatar = false) => {
    const aspectRatio = height / width;
    const availableWidthRem = getMaxMessageWidthRem(noAvatar) * 16;
    const calculatedWidth = Math.min(width, availableWidthRem);
    const availableHeight = 27 * 16;
    const calculatedHeight = Math.round(calculatedWidth * aspectRatio);

    if (calculatedHeight > availableHeight) {
        return {
            width: Math.round(availableHeight / aspectRatio),
            height: availableHeight,
        };
    }

    return {
        height: calculatedHeight,
        width: calculatedWidth,
    };
}

export function getStickerDimensions(width, height) {
    // if (sticker.id === LIKE_STICKER_ID) {
    //   height = width;
    // }

    const aspectRatio = (height && width) && height / width;
    const baseWidth = REM * (
        isMobile
            ? STICKER_SIZE_INLINE_MOBILE_FACTOR
            : STICKER_SIZE_INLINE_DESKTOP_FACTOR
    );
    const calculatedHeight = aspectRatio ? baseWidth * aspectRatio : baseWidth;

    if (aspectRatio && calculatedHeight > baseWidth) {
        return {
            width: Math.round(baseWidth / aspectRatio),
            height: baseWidth,
        };
    }

    return {
        width: baseWidth,
        height: calculatedHeight,
    };
}

const Image = forwardRef(({ children, media, size, _width, _height, noAvatar = false, setProgress, isLoaded, setIsLoaded, setSrc, uploading, setIsDownloading }, ref) => {
    const [width, setWidth] = useState(_width)
    const [height, setHeight] = useState(_height)

    const aspectRatio = height / width
    const dimensions = calculateMediaDimensions(width, height, noAvatar)
    const img = useRef()
    const isLowQualityLoaded = useRef(false)
    const request = useRef()

    const onClick = (e) => {
        const { x, y } = img.current.getBoundingClientRect()
    }

    useImperativeHandle(ref, () => ({
        onAbort() {
            console.log('Image aborted')
            request.current.abort()
        },
        onSave() {
            var link = document.createElement("a");
            link.download = 'image.jpg';
            link.href = img.current.src;
            link.click();
        }
    }))

    // useEffect(() => {
    //     if (uploading) {
    //         img.current.src = uploading

    //         img.current.onload = () => {
    //             setWidth(img.current.offsetWidth)
    //             setHeight(img.current.offsetHeight)
    //         }
    //     }
    // }, [uploading])

    useEffect(() => {
        if (!media.photo?.id && media.photo?.fileReference) {
            const buffer = media.photo.fileReference

            var blob = new Blob([buffer]);
            var data = window.URL.createObjectURL(blob)

            img.current.src = data;
            setSrc(data)

            return
        }

        if (isLowQualityLoaded.current && size === 16 || uploading || !media)
            return

        (async () => {
            const param = size ? { thumb: media.photo.sizes[0] } : {}
            const result = await downloadMedia(media, param, (e) => setProgress({ loaded: Number(e.value), total: getPhotoDimensions(media.photo)?.sizes[4] }), size, true, 'image/jpg')
            if (img.current) {
                let src = result.data
                img.current.src = src;
                setSrc(src)
            }
            if (!result.thumbnail)
                setIsLoaded(true)
            else
                isLowQualityLoaded.current = true
        })()
    }, [media, size])

    return <>
        <img ref={img} width={width > 0 ? dimensions.width : ''} className={isLoaded ? '' : 'blurred'} />
        {children}
    </>
})

const Video = forwardRef(({ children, media, details, size, width, height, noAvatar = false, uploading, setProgress, isLoaded, setIsLoaded, setSrc, setIsDownloading, autoplay = false }, ref) => {
    const [thumb, setThumb] = useState()
    const [content, setContent] = useState()
    const [loaded, setLoaded] = useState()

    const aspectRatio = height / width
    const dimensions = calculateMediaDimensions(width, height, noAvatar)
    const video = useRef()
    const thumbnail = useRef()
    const isLowQualityLoaded = useRef(false)
    const request = useRef()

    const onClick = (e) => {
        const { x, y } = video.current.getBoundingClientRect()


    }

    useImperativeHandle(ref, () => ({
        onAbort() {
            console.log('Image aborted')
            request.current.abort()
        },
        onSave() {
            var link = document.createElement("a");
            link.download = extractFileName(details.name);
            link.href = video.current.src;
            link.click();
        }
    }))

    useEffect(() => {
        if (uploading) {
            video.current.src = uploading

            video.current.onload = () => {
                // setWidth(img.current.offsetWidth)
                // setHeight(img.current.offsetHeight)
            }
        }
    }, [uploading])

    useEffect(() => {
        if (!media.document?.id && media.document?.fileReference) {
            const buffer = media.document.fileReference

            var blob = new Blob([buffer]);
            var data = window.URL.createObjectURL(blob)

            setSrc(data)
            setContent(data)

            return
        }

        if (isLowQualityLoaded.current && size === 16 || uploading || !media)
            return

        (async () => {
            const param = size ? { thumb: media.document.thumbs[0] } : {}
            const result = await downloadMedia(media, param, (e) => { setProgress({ loaded: Number(e.value), total: details.size }); setLoaded(Number(e.value)) }, size)

            setSrc(result.data)
            if (!result.thumbnail) {
                setContent(result.data)
                setIsLoaded(true)
            }
            else {
                setThumb(result.data)
                isLowQualityLoaded.current = true
            }
        })()
    }, [media, size])

    return <>
        {!content ?
            <img ref={thumbnail} src={thumb} width={width > 0 ? dimensions.width : ''} className={'blurred'} />
            :
            <video ref={video} src={content} width={dimensions.width} height={dimensions.height} className={isLoaded ? '' : 'blurred'} autoPlay={isLoaded && autoplay} loop={autoplay} />
        }
        <div className="MediaDetails">
            <div className="FlexColumn">
                <span>{fancyTimeFormat(details?.duration)}</span>
                <Transition state={!isLoaded}>
                    <span>{(loaded ? formatBytes(loaded) + ' / ' : '') + formatBytes(details?.size)}</span>
                </Transition>
            </div>
        </div>
        {children}
    </>
})

const RoundVideo = forwardRef(({ children, media, details, size, noAvatar = false, uploading, setProgress, isLoaded, setIsLoaded, setSrc, setIsDownloading, autoplay = false }, ref) => {
    const [content, setContent] = useState()
    const [loaded, setLoaded] = useState()

    const RoundVideoSize = 240

    const dimensions = { width: RoundVideoSize, height: RoundVideoSize }
    const video = useRef()
    const thumbnail = useRef()
    const isLowQualityLoaded = useRef(false)
    const request = useRef()

    const onClick = (e) => {
        const { x, y } = video.current.getBoundingClientRect()
    }

    useImperativeHandle(ref, () => ({
        onAbort() {
            console.log('Image aborted')
            request.current.abort()
        },
        onSave() {
            var link = document.createElement("a");
            link.download = extractFileName(details.name);
            link.href = video.current.src;
            link.click();
        }
    }))

    useEffect(() => {
        if (uploading) {
            video.current.src = uploading

            video.current.onload = () => {
                // setWidth(img.current.offsetWidth)
                // setHeight(img.current.offsetHeight)
            }
        }
    }, [uploading])

    useEffect(() => {
        if (isLowQualityLoaded.current && size === 16 || uploading || !media)
            return

        (async () => {
            const param = size ? { thumb: media.document.thumbs[0] } : {}
            const result = await downloadMedia(media, param, (e) => { setProgress({ loaded: Number(e.value), total: details.size }); setLoaded(Number(e.value)) }, size)

            setSrc(result.data)
            setContent(result.data)
            if (!result.thumbnail) {
                setIsLoaded(true)
            }
            else {
                isLowQualityLoaded.current = true
            }
        })()
    }, [media, size])

    return <>
        <div className="RoundVideo">
            {!isLoaded ?
                <img ref={thumbnail} src={content} width={dimensions.width} className='blurred' />
                :
                <video ref={video} src={content} width={dimensions.width} height={dimensions.height} className={isLoaded ? '' : 'blurred'} autoPlay={isLoaded && autoplay} loop={autoplay} />
            }
        </div>
        <div className="MediaDetails">
            <div className="FlexColumn">
                <span>{fancyTimeFormat(details?.duration)}</span>
                <Transition state={!isLoaded}>
                    <span>{(loaded ? formatBytes(loaded) + ' / ' : '') + formatBytes(details?.size)}</span>
                </Transition>
            </div>
        </div>
        {children}
    </>
})

const Sticker = forwardRef(({ children, media, size, _width, _height, noAvatar = false, setProgress, isLoaded, setIsLoaded, setSrc, uploading, setIsDownloading }, ref) => {
    const [width, setWidth] = useState(_width)
    const [height, setHeight] = useState(_height)

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
            const result = await downloadMedia(media, param, null, size, true)
            if (img.current) {
                let src = result.data
                img.current.src = src;
                setSrc(src)
            }
            if (!result.thumbnail)
                setIsLoaded(true)
            else
                isLowQualityLoaded.current = true
        })()
    }, [media, size])

    return <>
        <img ref={img} width={width > 0 ? dimensions.width : ''} />
    </>
})

function fancyTimeFormat(duration) {
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    let ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;

    return ret;
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1000
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function extractFileName(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    const namePart = lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex);
    const ext = lastDotIndex === -1 ? '' : fileName.substring(lastDotIndex);

    const parts = namePart.split('_');

    if (parts.length > 1) {
        const newNamePart = parts.slice(0, -1).join('_');
        return newNamePart + ext;
    } else {
        return fileName;
    }
}