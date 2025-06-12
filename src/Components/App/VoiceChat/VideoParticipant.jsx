import { memo, useEffect, useRef } from "react"
import FullNameTitle from "../../common/FullNameTitle"

function VideoParticipant({ participant, stream, onClick }) {
    const video = useRef()

    useEffect(() => {
        video.current.srcObject = stream
    }, [stream])

    return <div className="VideoParticipant" onClick={() => onClick()}>
        <video ref={video} autoPlay />
        <div className="info">
            <div className="title">
                <FullNameTitle chat={participant.user} />
            </div>
        </div>
    </div>
}

export default memo(VideoParticipant)