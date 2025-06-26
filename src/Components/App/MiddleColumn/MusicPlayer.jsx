import { memo, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDocumentAudioAttributes } from "../../Helpers/messages";
import { handleMusicPlayerTogglePlaying } from "../../Stores/UI";
import { downloadMedia } from "../../Util/media";
import { Api } from "telegram";
import { Icon } from "../common";
import { Tooltip } from "@mui/material";

function MusicPlayer({ }) {
    const [playProgress, setPlayProgress] = useState(0)
    const [src, setSrc] = useState()
    const [cover, setCover] = useState()

    const content = useSelector(state => state.ui.musicPlayer.data[state.ui.musicPlayer.activeMessage])
    const queue = useSelector(state => state.ui.musicPlayer.queue)
    const currentIndex = useSelector(state => state.ui.musicPlayer.currentIndex)
    const playing = useSelector(state => state.ui.musicPlayer.playing)
    const playerVolume = useSelector(state => state.settings.playerVolume)

    const dispatch = useDispatch()

    const player = useRef()

    const { title, performer } = getDocumentAudioAttributes(content)

    console.log('music player rerendered')

    useEffect(() => {
        console.log('Getting Music...');

        (async () => {
            const result = await downloadMedia(new Api.MessageMediaDocument({
                document: content
            }), {}, (e) => { }, false)

            if (!result) return

            setSrc(result.data)
        })()
    }, [content])

    useEffect(() => {
        (async () => {
            const thumbSize = content.thumbs ? content.thumbs[1] : undefined
            if (!thumbSize) {
                setCover()
                return
            }
            const result = await downloadMedia(new Api.MessageMediaDocument({
                document: content
            }), { thumb: thumbSize }, (e) => { }, true, false)

            if (!result) return
            setCover(result.data)

        })()
    }, [content])

    useEffect(() => {
        if (playing)
            player.current.play()
        else
            player.current.pause()
    }, [playing])

    useEffect(() => {
        if (playerVolume)
            player.current.volume = playerVolume

        // return () => {
        //     if (volume.current !== playerVolume) {
        //         dispatch(handlePlayerVolume(volume.current))
        //         console.log('volume changed', volume.current)
        //     }
        // }
    }, [])

    return <div className="MusicPlayer">
        <div className="Cover">
            {cover ?
                <img src={cover} width={90} />
                : <div className="NoCover">
                    <Icon name="music_note" size={36} />
                </div>}
        </div>
        <div className="FlexColumn">
            <div className="title">{title}</div>
            <div className="subtitle">{performer}</div>
        </div>
        <div className="Controls">
            <div className="Play" onClick={() => dispatch(handleMusicPlayerTogglePlaying())}>
                <Icon name={playing ? "pause" : "play_arrow"} size={36} className="IconFill" />
            </div>
            <div className="Next" onClick={() => dispatch(handleMusicPlayerTogglePlaying())}>
                <Icon name="skip_next" size={36} className="IconFill" />
            </div>
        </div>
        <div className="Seek" style={{ width: `calc(${playProgress * 100}% - 24px)` }}></div>

        {/* Player */}
        <audio
            ref={player}
            src={src}
            loop={true}
            autoPlay
            onTimeUpdate={e =>
                setPlayProgress(e.target.currentTime / e.target.duration)}
            onPlay={() =>
                dispatch(handleMusicPlayerTogglePlaying(true))}
            onPause={() =>
                dispatch(handleMusicPlayerTogglePlaying(false))}
        />
    </div>
}

export default memo(MusicPlayer)