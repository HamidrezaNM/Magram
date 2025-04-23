import { useDispatch, useSelector } from "react-redux"
import { Icon, Profile } from "./common"
import { memo, useCallback, useEffect, useRef } from "react"
import { handleMediaPreviewClose } from "../Stores/UI"
import { getDocumentVideoAttributes, getPhotoDimensions, isDocumentVideo } from "../Helpers/messages"
import { formatTime } from "../Util/dateFormat"
import { getDate } from "./Message"
import { handlePlayerVolume } from "../Stores/Settings"

const MediaPreview = () => {
    const data = useSelector((state) => state.ui.mediaPreview)

    const dispatch = useDispatch()

    const getMediaLayout = useCallback(() => {
        switch (data.media.className) {
            case 'MessageMediaPhoto':
                const dimensions = getPhotoDimensions(data.media.photo)

                return <img src={data.mediaSrc} width={calculateMediaDimensions(dimensions?.w, dimensions?.h)?.width} />
            case 'MessageMediaDocument':
                if (isDocumentVideo(data.media?.document)) {
                    const dimensions = getDocumentVideoAttributes(data.media.document)

                    return <VideoPlayer dispatch={dispatch} src={data.mediaSrc} width={calculateMediaDimensions(dimensions?.w, dimensions?.h)?.width} />
                }
            default:
                // if (data.media[0].videoCodec) {
                // }
                return;
            // return <Document ref={image} path={media[0].filePath} isLoaded={isLoaded} setIsLoaded={setIsLoaded} setProgress={setProgress} />
        }
    }, [data])

    const calculateMediaDimensions = (width, height) => {
        const aspectRatio = height / width;
        // console.log(getMaxMessageWidthRem())
        const availableWidthRem = window.innerWidth;
        const calculatedWidth = Math.min(width, availableWidthRem);
        const availableHeight = window.innerHeight - (8 * 16);
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

    return <>
        <div className="bg animate PreviewBG" style={{ backgroundColor: '#000000dd' }} onClick={() => dispatch(handleMediaPreviewClose())}></div>
        <div className="MediaPreview animate">
            <div className="Topbar">
                <div className="SenderInfo">
                    <div className="meta"><Profile entity={data.message._sender} name={data.message._sender?.firstName ?? data.message._sender?.title ?? 'Anonymous'} id={data.message._senderId?.value} /></div>
                    <div className="body">
                        <div className="title">{data.message._sender?.firstName ?? data.message._sender?.title ?? 'Anonymous'}</div>
                        <div className="subtitle">{`${getDate(new Date(data.message.date * 1000))}, ${formatTime(new Date(data.message.date) * 1000)}`}</div>
                    </div>
                </div>
                <div className="Action">
                    <Icon name="close" onClick={() => dispatch(handleMediaPreviewClose())} />
                </div>
            </div>
            <div className="Content" onClick={() => dispatch(handleMediaPreviewClose())}>
                <div className="Media">
                    {getMediaLayout()}
                </div>
            </div>
        </div>
    </>
}

const VideoPlayer = memo(({ src, width, dispatch }) => {
    const playerVolume = useSelector((state) => state.settings.playerVolume)

    const player = useRef()
    const volume = useRef()

    const onVolumeChange = () => {
        volume.current = player.current.volume
    }

    useEffect(() => {
        if (playerVolume)
            player.current.volume = playerVolume

        return () => {
            if (volume.current !== playerVolume) {
                dispatch(handlePlayerVolume(volume.current))
                console.log('volume changed', volume.current)
            }
        }
    }, [])


    return <video
        ref={player}
        src={src}
        width={width}
        autoPlay
        controls
        onVolumeChange={onVolumeChange}
    />
})

export default memo(MediaPreview)