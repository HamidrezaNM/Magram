import { memo, useContext, useEffect, useRef, useState } from "react"
import DropdownMenu from "../../UI/DropdownMenu"
import Menu from "../../UI/Menu"
import { Icon, Profile } from "../common"
import { useDispatch, useSelector } from "react-redux"
import FullNameTitle from "../../common/FullNameTitle"
import Transition from "../Transition"
import RLottie from "../../common/RLottie"
import buildClassName from "../../Util/buildClassName"
import TextTransition from "../../common/TextTransition"
import { handleGroupCallActive, handleGroupCallLeft, handleGroupCallParticipants, handleToast } from "../../Stores/UI"
import { client } from "../../../App"
import { Api } from "telegram"
import { getUserFullName } from "../../Helpers/users"
import { UserContext } from "../../Auth/Auth"

function VoiceChat({ }) {
    const [mute, setMute] = useState(true)

    const userMedia = useSelector(state => state.ui.userMedia)
    const groupCall = useSelector(state => state.ui.groupCall)
    const participants = groupCall?.participants

    const User = useContext(UserContext)

    const oldParticipants = useRef(participants)
    const micRef = useRef()

    const dispatch = useDispatch()

    const micSegments = {
        unmute: [21, 42],
        mute: [43, 63]
    }

    const handleClose = () => dispatch(handleGroupCallActive(false))

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

            dispatch(handleGroupCallParticipants([
                new Api.GroupCallParticipant({
                    self: true,
                    left: true,
                    peer: new Api.PeerUser({
                        userId: User.id
                    })
                })]))

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

            // if (micRef.current)
            //     if (mute)
            //         micRef.current.playFrames(micSegments.mute[0], micSegments.mute[1])
            //     else
            //         micRef.current.playFrames(micSegments.unmute[0], micSegments.unmute[1])
        }
    }, [mute])

    function addParticipants(newlyAdded) {
        console.log("Joined Participants:", newlyAdded);
        newlyAdded.forEach(participant => {
            dispatch(handleToast({ profile: participant.user, title: `${getUserFullName(participant.user)} joined the voice chat.` }))
        })
    }

    function removeParticipants(leftParticipants) {
        console.log("Left Participants:", leftParticipants);
    }

    function updateParticipants(newParticipants) {
        if (!Array.isArray(newParticipants)) {
            newParticipants = [];
            console.log('new participants is not array')
        }

        if (!oldParticipants.current?.length) {
            console.log('old participants is empty')
            addParticipants(newParticipants)
            oldParticipants.current = [...newParticipants]
            return;
        }

        const addedParticipants = newParticipants.filter(
            (newP) => !oldParticipants.current.some((oldP) => oldP.id === newP.id || !oldP.left)
        );

        const removedParticipants = oldParticipants.current.filter(
            (oldP) => !newParticipants.some((newP) => newP.id === oldP.id && !newP.left)
        );

        console.log(addedParticipants, removedParticipants)

        if (addedParticipants.length > 0) {
            addParticipants(addedParticipants);
        }

        if (removedParticipants.length > 0) {
            removeParticipants(removedParticipants);
        }

        oldParticipants.current = [...newParticipants];
    }

    useEffect(() => {
        if (participants) {
            console.log('update participants', participants, oldParticipants.current)
            updateParticipants(participants)
        }
    }, [participants])

    return groupCall?.call && <Transition state={groupCall.active} eachElement>
        <div className="bg VoiceChatBG" onClick={handleClose}></div>
        <div className="VoiceChat animate">
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
                    <Icon name="close" onClick={handleClose} />
                </div>
            </div>
            <div className="Content">
                <div className="Participants">
                    {participants.filter(participant => !participant.left).map(participant =>
                        <div className={buildClassName("Participant", !participant.muted && 'live')} key={participant.source}>
                            <Profile size={42} entity={participant.user} id={participant.user?.id} name={participant.user?.firstName} />
                            <div className="body">
                                <div className="title">
                                    <FullNameTitle chat={participant.user} />
                                </div>
                                <div className="subtitle">
                                    <TextTransition text={participant.muted ? 'listening' : 'speaking'} />
                                </div>
                            </div>
                            <div className="meta">
                                <Icon name={participant.muted ? 'mic_off' : 'mic'} />
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