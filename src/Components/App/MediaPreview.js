import { useDispatch, useSelector } from "react-redux"
import { Icon, Profile } from "./common"
import { memo, useCallback, useEffect, useRef } from "react"
import { handleMediaPreviewClose } from "../Stores/UI"
import { getDocumentVideoAttributes, getPhotoDimensions, isDocumentVideo } from "../Helpers/messages"
import { formatTime } from "../Util/dateFormat"
import { getDate } from "./Message"
import { handlePlayerVolume } from "../Stores/Settings"
import Transition from "./Transition"

const MediaPreview = () => {
    const data = useSelector((state) => state.ui.mediaPreview)

    const dispatch = useDispatch()

    const previewMedia = useRef()
    const mediaEl = useRef()
    const elementRect = useRef()

    const handleShowElementTransition = () => {
        if (!data?.element) return

        elementRect.current = data.element.getBoundingClientRect()
        const mediaRect = mediaEl.current.getBoundingClientRect()

        previewMedia.current.classList.add('zoom')

        mediaEl.current.style.transition = 'none'
        mediaEl.current.style.width = elementRect.current.width + 'px'
        mediaEl.current.style.height = elementRect.current.height + 'px'
        mediaEl.current.style.left = elementRect.current.left + 'px'
        mediaEl.current.style.top = elementRect.current.top + 'px'
        mediaEl.current.style.borderRadius = getComputedStyle(data.element).borderRadius

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                mediaEl.current.style.transition = ''
                mediaEl.current.style.width = mediaRect.width + 'px'
                mediaEl.current.style.height = mediaRect.height + 'px'
                mediaEl.current.style.left = mediaRect.left + 'px'
                mediaEl.current.style.top = mediaRect.top + 'px'
                mediaEl.current.style.borderRadius = ''

                setTimeout(() => {
                    data.element.style.opacity = '0'
                    data.element.style.transition = 'none'
                }, 40)
            });
        })
    }

    const handleHideElementTransition = () => {
        if (!data?.element) return

        previewMedia.current.classList.remove('zoom')

        mediaEl.current.style.width = elementRect.current.width + 'px'
        mediaEl.current.style.height = elementRect.current.height + 'px'
        mediaEl.current.style.left = elementRect.current.left + 'px'
        mediaEl.current.style.top = elementRect.current.top + 'px'
        mediaEl.current.style.borderRadius = getComputedStyle(data.element).borderRadius

        setTimeout(() => {
            data.element.style.opacity = ''
        }, 300);
    }

    const getMediaLayout = useCallback(() => {
        switch (data.media.className) {
            case 'ChatPhoto':
            case 'UserProfilePhoto':
                return <img src={data.mediaSrc} style={{ maxWidth: '640px', width: '100vw' }} />
            case 'MessageMediaPhoto':
                const dimensions = getPhotoDimensions(data.media.photo)

                return <img src={data.mediaSrc} width={calculateMediaDimensions(dimensions?.w, dimensions?.h)?.width} />
            case 'MessageMediaDocument':
                if (isDocumentVideo(data.media?.document)) {
                    const dimensions = getDocumentVideoAttributes(data.media.document)

                    return <VideoPlayer dispatch={dispatch} src={data.mediaSrc} width={calculateMediaDimensions(dimensions?.w, dimensions?.h)?.width} />
                }
            default:
                <div>This media is not supported.</div>
                return;
        }
    }, [data?.media])

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

    return data && <Transition
        state={data?.active}
        activeAction={handleShowElementTransition}
        onDeactivate={handleHideElementTransition}
        eachElement>
        <div className="bg animate PreviewBG" style={{ backgroundColor: '#000000dd' }} onClick={() => dispatch(handleMediaPreviewClose())}></div>
        <div className="MediaPreview animate" ref={previewMedia}>
            <div className="Topbar">
                <div className="SenderInfo">
                    <div className="meta"><Profile entity={data.from} name={data.from?.firstName ?? data.from?.title ?? 'Anonymous'} id={data.from?.id} /></div>
                    <div className="body">
                        <div className="title">{data.from?.firstName ?? data.from?.title ?? 'Anonymous'}</div>
                        <div className="subtitle">{data.date && `${getDate(new Date(data.date * 1000))}, ${formatTime(new Date(data.date) * 1000)}`}</div>
                    </div>
                </div>
                <div className="Action">
                    <Icon name="close" onClick={() => dispatch(handleMediaPreviewClose())} />
                </div>
            </div>
            <div className="Content" onClick={() => dispatch(handleMediaPreviewClose())}>
                <div className="Media" ref={mediaEl}>
                    {getMediaLayout()}
                </div>
            </div>
        </div>
    </Transition>
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