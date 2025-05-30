import { forwardRef, memo, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react"
import { fancyTimeFormat, formatBytes, isMobile } from "./MessageMedia"
import { abortDownload, downloadMedia } from "../../Util/media"
import { Icon } from "../common"
import { MAX_EMPTY_WAVEFORM_POINTS, renderWaveform } from "../../Helpers/waveform"
import { decodeWaveform, interpolateArray } from "../../Util/waveform"
import { getDocumentAudioAttributes } from "../../Helpers/messages"
import { Api } from "telegram"
import { useDispatch, useSelector } from "react-redux"
import { handleMusicPlayer, handleMusicPlayerTogglePlaying } from "../../Stores/UI"

export const TINY_SCREEN_WIDTH_MQL = window.matchMedia('(max-width: 375px)');
export const WITH_AVATAR_TINY_SCREEN_WIDTH_MQL = window.matchMedia('(max-width: 410px)');
const AVG_VOICE_DURATION = 10;

const Audio = forwardRef(({ children, messageId, chatId, media, isVoice = false, details, size, noAvatar = false, uploading, setProgress, isLoaded, setIsLoaded, setSrc, setIsDownloading, autoplay = false }, ref) => {
    const [content, setContent] = useState()
    const [thumb, setThumb] = useState()
    const [loaded, setLoaded] = useState()
    const [playProgress, setPlayProgress] = useState(0)

    const isPlaying = useSelector(state => state.ui.musicPlayer.activeMessage === messageId && state.ui.musicPlayer.playing === true)

    const dispatch = useDispatch()

    const audio = useRef()
    const seekerRef = useRef()
    const isLowQualityLoaded = useRef(false)

    const waveformCanvasRef = useWaveformCanvas(
        'dark',
        getDocumentAudioAttributes(media.document),
        (false && true && true) ? 1 : playProgress,
        false,
        !noAvatar,
        isMobile
    );

    useImperativeHandle(ref, () => ({
        onAbort() {
            abortDownload(media.document?.id?.value)
        },
        onSave() {
            var link = document.createElement("a");
            link.download = 'audio.mp3';
            link.href = audio.current.src;
            link.click();
        }
    }))

    useEffect(() => {
        if (uploading) {
            audio.current.src = uploading

            audio.current.onload = () => {
                // setWidth(img.current.offsetWidth)
                // setHeight(img.current.offsetHeight)
            }
        }
    }, [uploading])

    useEffect(() => {
        if (thumb) return

        (async () => {
            const thumbSize = media.document.thumbs ? media.document.thumbs[1] : undefined
            if (!thumbSize) return
            const result = await downloadMedia(media, { thumb: thumbSize }, (e) => { }, true, false)

            if (!result) return
            setThumb(result.data)
        })()
    }, [media])

    useEffect(() => {
        if (!media.document?.id && media.document?.fileReference) {
            const buffer = media.document.fileReference

            var blob = new Blob([buffer]);
            var data = window.URL.createObjectURL(blob)

            setSrc(data)
            setContent(data)

            return
        }

        if (size === 16 || uploading || !media)
            return

        (async () => {
            const result = await downloadMedia(media, {}, (e) => { setProgress({ loaded: Number(e.value), total: details.size }); setLoaded(Number(e.value)) }, size)

            if (!result) return
            setSrc(result.data)
            setContent(result.data)
            setIsLoaded(true)

        })()
    }, [media, size])

    const handlePlay = () => {
        if (isPlaying) {
            dispatch(handleMusicPlayerTogglePlaying())
        } else {
            dispatch(handleMusicPlayer({
                messageId,
                chatId,
                document: media.document
            }))
        }
    }

    return <>
        <div className="Document">
            <div className="StreamAudio">
                <div className="Play" onClick={handlePlay}>
                    {thumb && <img src={thumb} width={90} />}
                    <Icon name={isPlaying ? "pause" : "play_arrow"} size={28} className="IconFill" />
                </div>
                {children}
            </div>
            {isVoice ? <div className="details">
                <div
                    className="waveform"
                    draggable={false}
                    ref={seekerRef}
                >
                    <canvas ref={waveformCanvasRef} />
                </div>
                <div className="subtitle"><span>{fancyTimeFormat(details?.duration)}</span>{!isLoaded && ' - ' + (loaded ? formatBytes(loaded) + ' / ' : '') + formatBytes(details?.size)}</div>
            </div>
                : <div className="details">
                    <div className="title">{details.title}</div>
                    <div className="subtitle">{details.performer}</div>
                    <div className="subtitle secondary"><span>{fancyTimeFormat(details?.duration)}</span>{!isLoaded && ' - ' + (loaded ? formatBytes(loaded) + ' / ' : '') + formatBytes(details?.size)}</div>
                </div>
            }
        </div>
    </>
})

function useWaveformCanvas(
    theme,
    media,
    playProgress = 0,
    isOwn = false,
    withAvatar = false,
    isMobile = false,
    isReverse = false,
) {
    const canvasRef = useRef();

    const { data: spikes, peak } = useMemo(() => {
        if (!media) {
            return undefined;
        }

        const { waveform, duration } = media;
        if (!waveform) {
            return {
                data: new Array(Math.min(duration, MAX_EMPTY_WAVEFORM_POINTS)).fill(0),
                peak: 0,
            };
        }

        const { MIN_SPIKES, MAX_SPIKES } = getSeeklineSpikeAmounts(isMobile, withAvatar);
        const durationFactor = Math.min(duration / AVG_VOICE_DURATION, 1);
        const spikesCount = Math.round(MIN_SPIKES + (MAX_SPIKES - MIN_SPIKES) * durationFactor);
        const decodedWaveform = decodeWaveform(new Uint8Array(waveform));

        return interpolateArray(decodedWaveform, spikesCount);
    }, [isMobile, media, withAvatar]) || {};

    useLayoutEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas || !spikes || peak === undefined) {
            return;
        }

        const fillColor = theme === 'dark' ? '#494A78' : '#ADD3F7';
        const fillOwnColor = theme === 'dark' ? '#B7ABED' : '#AEDFA4';
        const progressFillColor = theme === 'dark' ? '#8774E1' : '#3390EC';
        const progressFillOwnColor = theme === 'dark' ? '#FFFFFF' : '#4FAE4E';

        const fillStyle = isOwn ? fillOwnColor : fillColor;
        const progressFillStyle = isOwn ? progressFillOwnColor : progressFillColor;

        renderWaveform(canvas, spikes, isReverse ? 1 - playProgress : playProgress, {
            peak,
            fillStyle,
            progressFillStyle,
        });
    }, [isOwn, peak, playProgress, spikes, theme, isReverse]);

    return canvasRef;
}

function getSeeklineSpikeAmounts(isMobile, withAvatar) {
    return {
        MIN_SPIKES: isMobile ? (TINY_SCREEN_WIDTH_MQL.matches ? 16 : 20) : 25,
        MAX_SPIKES: isMobile
            ? (TINY_SCREEN_WIDTH_MQL.matches
                ? 35
                : (withAvatar && WITH_AVATAR_TINY_SCREEN_WIDTH_MQL.matches ? 40 : 45))
            : 75,
    };
}

export default memo(Audio)