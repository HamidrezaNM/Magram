import { useEffect, useRef, useState } from "react";
import { Icon, Profile } from "../common";
import './Call.css'
import { useDispatch, useSelector } from "react-redux";
import { handleCallMinimalToggle } from "../../Stores/UI";
import { Tooltip } from "@mui/material";

export default function CallMinimal({ Call, CallStream, CallState }) {
    const [isCallAnswered, setIsCallAnswered] = useState(false)
    const [isIncoming, setIsIncoming] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoDisabled, setIsVideoDisabled] = useState(true)
    const [showTooltip, setShowTooltop] = useState(true)

    const background = useRef()

    const dispatch = useDispatch()

    const call = useSelector((state) => state.ui.value.call)

    useEffect(() => {
        try {
            setIsMuted(!CallStream.current?.getAudioTracks()[0]?.enabled)
        } catch (error) {

        }
    }, [CallStream.current?.getAudioTracks()[0]?.enabled])

    useEffect(() => {
        try {
            setIsVideoDisabled(!CallStream.current?.getVideoTracks()[0]?.enabled)
        } catch (error) {

        }
    }, [CallStream.current?.getVideoTracks()[0]?.enabled])

    const toggleMuteMic = () => {
        Call.current.onToggleMute()
        setIsMuted(!isMuted)
    }

    const toggleDisableVideo = () => {
        Call.current.onToggleVideo()
        setIsVideoDisabled(!isVideoDisabled)
    }

    useEffect(() => {
        setTimeout(() => {
            setShowTooltop(false)
        }, 5000);
    }, [])

    return <div className="Call Minimal animate">
        <div className="background" ref={background}></div>
        <div className="bottom">
            <Tooltip open={showTooltip} title="Click here to go Back to Call" placement="top" arrow slotProps={{
                popper: {
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, -12],
                            },
                        },
                    ],
                }
            }}>
                <div className={"CallOutput" + (showTooltip ? ' hovered' : '')} onClick={() => dispatch(handleCallMinimalToggle())}>
                    <div className="User" id="remoteVideo">
                        <div className="UserInfo">
                            <div className="SoundBubbles">
                                <div className="first"></div>
                                <div className="second"></div>
                            </div>
                            <Profile name={call.firstname} id={call._id} size={36} />
                            <div className="Details">
                                <div className="Name">{call.firstname}</div>
                                <div className="status">{CallState ?? ''}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Tooltip>
            {(isIncoming && !isCallAnswered) ?
                <div className="incoming-buttons">
                    <div>
                        <button id="callAnswer">
                            <Icon name="call" />
                        </button>
                        <span>Answer</span>
                    </div>
                    <div>
                        <button id="callDecline">
                            <Icon name="call_end" />
                        </button>
                        <span>Decline</span>
                    </div>
                </div> :
                <div className="call-buttons">
                    <div>
                        <button id="shareScreen">
                            <Icon name="screen_share" />
                        </button>
                        <span>Share Screen</span>
                    </div>
                    <div className={isVideoDisabled ? "alt" : ""}>
                        <button id="disableVideo" onClick={toggleDisableVideo}>
                            <Icon name={isVideoDisabled ? "videocam_off" : "videocam"} />
                        </button>
                        <span>{isVideoDisabled ? 'Start Video' : 'Disable Video'}</span>
                    </div>
                    <div className={isMuted ? "alt" : ""}>
                        <button id="mute" onClick={toggleMuteMic}>
                            <Icon name={isMuted ? "mic_off" : "mic"} />
                        </button>
                        <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                    </div>
                    <div>
                        <button id="call-disconnect" onClick={() => Call.current.onDisconnect()}>
                            <Icon name="call_end" />
                        </button>
                        <span>End call</span>
                    </div>
                </div>}
        </div>
    </div>
}