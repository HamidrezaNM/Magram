import { memo, useEffect, useState } from "react"
import DropdownMenu from "../../UI/DropdownMenu"
import Menu from "../../UI/Menu"
import { Icon, Profile } from "../common"
import { useDispatch, useSelector } from "react-redux"
import FullNameTitle from "../../common/FullNameTitle"
import Transition from "../Transition"
import RLottie from "../../common/RLottie"
import buildClassName from "../../Util/buildClassName"
import TextTransition from "../../common/TextTransition"
import { handleGroupCallActive, handleGroupCallLeft } from "../../Stores/UI"
import { client } from "../../../App"
import { Api } from "telegram"
import { returnBigInt } from "telegram/Helpers"

function VoiceChat({ }) {
    const [mute, setMute] = useState(true)

    const userMedia = useSelector(state => state.ui.userMedia)
    const groupCall = useSelector(state => state.ui.groupCall)
    const participants = groupCall?.participants

    const dispatch = useDispatch()

    const micSegments = {
        unmute: [21, 42],
        mute: [43, 63]
    }

    const leaveGroupCall = async () => {
        console.log('leave group call', groupCall?.call, groupCall?.connection?.source)

        if (!groupCall?.call || !groupCall.connection?.source) return;

        try {
            const result = await client.invoke(new Api.phone.LeaveGroupCall({
                call: new Api.InputGroupCall({
                    id: groupCall.call.id,
                    accessHash: groupCall.call.accessHash
                }),
                source: Number(groupCall.connection.source)
            }))

            console.log(result)
        } catch (error) {
            console.log('Failed to LeaveGroupCall', error)
        }

        dispatch(handleGroupCallLeft())
        groupCall.connection.tgcalls.close()
        stopUserMedia(userMedia?.stream)

    }

    function stopUserMedia(stream) {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
        }
    }

    useEffect(() => {
        if (userMedia?.stream) {
            const audioTrack = userMedia.stream.getAudioTracks()[userMedia.audioDeviceIndex]

            if (audioTrack) {
                audioTrack.enabled = !mute
            }
        }
    }, [mute])

    return groupCall?.call && <Transition state={groupCall.active} eachElement>
        <div className="bg VoiceChatBG" onClick={() => dispatch(handleGroupCallActive(false))}></div>
        <div className="VoiceChat">
            <div className="TopBar">
                <div className="">
                    <Menu icon="more_horiz">
                        <DropdownMenu className="top right withoutTitle">

                        </DropdownMenu>
                    </Menu>
                </div>
                <div className="body">
                    <div className="title">Voice Chat</div>
                    <div className="subtitle">{participants.length} participants</div>
                </div>
                <div className="meta">
                    <Icon name="close" />
                </div>
            </div>
            <div className="Content">
                <div className="Participants">
                    {participants.filter(participant => !participant.left).map(participant =>
                        <div className="Participant">
                            <Profile size={42} entity={participant.user} id={participant.user?.id} name={participant.user?.firstName} />
                            <div className="body">
                                <div className="title">
                                    <FullNameTitle chat={participant.user} />
                                </div>
                                <div className="subtitle">listening</div>
                            </div>
                            <div className="meta">
                                <Icon name="mic_off" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="Bottom">
                <div className="button">
                    <Icon name="volume_up" size={32} />
                    <div className="title">audio</div>
                </div>
                <div className={buildClassName('button', 'mic', !mute && 'live')} onClick={() => setMute(!mute)}>
                    {/* <Icon name="mic_off" size={48} /> */}
                    {mute ?
                        <RLottie
                            sticker="voice_outlined"
                            fileId="voice_outlined_mute"
                            width={64}
                            height={64}
                            autoplay={true}
                            fromFrame={micSegments.mute[0]}
                            toFrame={micSegments.mute[1]} />
                        : <RLottie
                            sticker="voice_outlined"
                            fileId="voice_outlined_unmute"
                            width={64}
                            height={64}
                            autoplay={true}
                            fromFrame={micSegments.unmute[0]}
                            toFrame={micSegments.unmute[1]} />}
                    <div className="title">
                        <TextTransition text={mute ? 'Unmute' : "You're Live"} />
                    </div>
                </div>
                <div className="button leave" onClick={leaveGroupCall}>
                    <Icon name="call_end" size={32} />
                    <div className="title">leave</div>
                </div>
            </div>
        </div>
    </Transition>
}

export default memo(VoiceChat)