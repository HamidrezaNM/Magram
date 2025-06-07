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
import { handlePluralization } from "../../Util/text"
import { updateParticipants } from "../../Util/Calls/voiceChat"
import SoundBubbles from "../../common/SoundBubbles"
import VideoParticipant from "./VideoParticipant"
import './VoiceChat.css'
import PositionTransition from "../../common/PositionTransition"
import MenuItem from "../../UI/MenuItem"

function VoiceChat({ }) {
    const [mute, setMute] = useState(true)
    const [screenCast, setScreenCast] = useState(false)
    const [ssrcStream, setSsrcStream] = useState([])
    const [maximized, setMaximized] = useState(false)
    const [count, setCount] = useState(1)

    const userMedia = useSelector(state => state.ui.userMedia)
    const groupCall = useSelector(state => state.ui.groupCall)
    const participants = groupCall?.participants
    const presentParticipants = participants.filter(participant => !participant.left)

    const User = useContext(UserContext)

    const oldParticipants = useRef(participants)

    const voiceChatRef = useRef()
    const micRef = useRef()
    const containerRef = useRef()

    const dispatch = useDispatch()

    const micSegments = {
        unmute: [21, 42],
        mute: [43, 63]
    }

    const handleClose = () => dispatch(handleGroupCallActive(false))

    const leaveGroupCall = async () => {
        // console.log('leave group call', groupCall?.call, groupCall?.connection?.source)

        if (!groupCall?.call || !groupCall.connection?.source) return;

        try {
            const result = await client.invoke(new Api.phone.LeaveGroupCall({
                call: new Api.InputGroupCall({
                    id: groupCall.call.id,
                    accessHash: groupCall.call.accessHash
                }),
                source: parseInt(groupCall.connection.source)
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

    async function handleScreenShare() {

        navigator.mediaDevices.getDisplayMedia({ audio: false, video: true })
            .then(async (stream) => {
                groupCall.connection.tgcalls.toggleStream(stream)

                const result = await client.invoke(new Api.phone.EditGroupCallParticipant({
                    call: new Api.InputGroupCall({
                        id: groupCall.call.id,
                        accessHash: groupCall.call.accessHash
                    }),
                    participant: new Api.InputPeerSelf(),
                    muted: true,
                    videoPaused: false,
                    videoStopped: false,
                }))
                console.log('toggle camera', result)
            })

        setScreenCast(true)
    }

    function handleMaximized() {
        setMaximized(!maximized)
    }

    function getContainerGridLayout(count) {
        if (!containerRef.current) return;

        containerRef.current.style.gridTemplateColumns = '';
        containerRef.current.style.gridTemplateRows = '';
        [...containerRef.current.children].forEach(item => {
            item.style.gridColumn = ''
            item.style.gridRow = ''
        })
        console.log(Math.sqrt(count) % 1)
        if (count === 1) {
            return 'layout-1'
        } else if (count === 3) return 'layout-3'
        else if (Math.sqrt(count) % 1 !== 0) {
            if (Math.sqrt(count + 1) % 1 === 0) {
                const columns = Math.sqrt(count + 1);

                containerRef.current.style.gridTemplateRows = `repeat(${(columns - 1) * columns}, 1fr)`;
                containerRef.current.style.gridTemplateColumns = `repeat(${(columns - 1) * columns}, 1fr)`;

                requestAnimationFrame(() => {
                    [...containerRef.current.children].forEach(item => {
                        item.style.gridColumn = 'span ' + (columns - 1)
                        item.style.gridRow = 'span ' + (columns - 1)
                    })

                    for (let i = 0; i < columns - 1; i++) {
                        containerRef.current.children[i].style.gridColumn = 'span ' + columns
                    }
                })

                return
            } else if (count % 3 === 0) {
                containerRef.current.style.gridTemplateRows = `repeat(${3}, 1fr)`;
                containerRef.current.style.gridTemplateColumns = `repeat(${count / 3}, 1fr)`;
                return
            } else if (count >= 5) {
                const size = count % 3 === 0 ? count : count + (3 - count % 3)
                const n = size / 3
                const columns = n * (n - 1);
                const columnsToBeChanged = count % 3

                requestAnimationFrame(() => {
                    containerRef.current.style.gridTemplateRows = `repeat(${3}, 1fr)`;
                    containerRef.current.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

                    [...containerRef.current.children].forEach(item => {
                        console.log('salam', columns + 1)
                        item.style.gridColumn = 'span ' + (n)
                    })

                    console.log('lengthfor', (3 - count % 3) * (columns + 1))
                    for (let i = 0; i < columnsToBeChanged * n; i++) {
                        if (containerRef.current.children[count - i - 1]) {
                            console.log('bye', columns)
                            containerRef.current.children[count - i - 1].style.gridColumn = 'span ' + (n - 1)

                            console.log(containerRef.current.children[count - i - 1], count - i - 1)
                        }
                    }
                })
            }


            return 'fancy-layout'
        }

        containerRef.current.style.gridTemplateColumns = `repeat(${Math.sqrt(count)}, 1fr)`;
    }

    useEffect(() => {
        if (voiceChatRef.current) {
            voiceChatRef.current.classList.toggle('Maximized', maximized)

            if (maximized) {
                voiceChatRef.current.classList.add('PreparingAnim')

                requestAnimationFrame(() => {
                    voiceChatRef.current.classList.remove('PreparingAnim')
                });
            }
        }
    }, [maximized])

    useEffect(() => {
        if (groupCall?.connection?.tgcalls) {
            const onNewStream = (e) => {
                const { ssrc, stream } = e.detail;
                console.log('NewRemoteStream', ssrc, stream)
                setSsrcStream(prev => [...prev, { ssrc, stream }]);
            };

            const onRemoveStream = (e) => {
                const { ssrc, stream } = e.detail;
                console.log('RemoveRemoteStream', ssrc, stream)
                setSsrcStream(prev => prev.filter(i => i.ssrc.endpoint !== ssrc.endpoint));
            };

            groupCall.connection.tgcalls.addEventListener('new-remote-stream', onNewStream);
            groupCall.connection.tgcalls.addEventListener('remove-remote-stream', onRemoveStream);

            return () => {
                groupCall.connection.tgcalls.removeEventListener('new-remote-stream', onNewStream);
                groupCall.connection.tgcalls.removeEventListener('remove-remote-stream', onRemoveStream);
            };
        }

    }, [groupCall?.connection?.tgcalls])

    useEffect(() => {
        if (userMedia?.stream) {
            (async () => {
                navigator.vibrate(1)

                const audioTrack = userMedia.stream.getAudioTracks()[userMedia.audioDeviceIndex]

                if (audioTrack) {
                    audioTrack.enabled = !mute

                    const toggleMute = await client.invoke(new Api.phone.EditGroupCallParticipant({
                        call: new Api.InputGroupCall({
                            id: groupCall.call.id,
                            accessHash: groupCall.call.accessHash
                        }),
                        participant: new Api.InputPeerSelf(),
                        muted: mute,
                        videoPaused: !screenCast,
                        videoStopped: !screenCast,
                    }))

                    console.log(toggleMute)
                }
            })()
        }
    }, [mute])

    useEffect(() => {
        if (participants) {
            updateParticipants({
                newParticipants: participants,
                oldParticipants: oldParticipants.current,
                onJoined: (participant) => dispatch(handleToast({ profile: participant.user, title: `${getUserFullName(participant.user)} joined the voice chat.` })),
                onLeft: (participant) => dispatch(handleToast({ profile: participant.user, title: `${getUserFullName(participant.user)} left the voice chat.` }))
            })

            if (groupCall?.connection?.tgcalls && participants !== oldParticipants.current) {
                groupCall?.connection?.tgcalls.handleUpdateGroupCallParticipants(participants)
            }

            oldParticipants.current = [...participants];
        }
    }, [participants])

    return groupCall?.call && <Transition state={groupCall.active} eachElement>
        <div className="bg VoiceChatBG" onClick={handleClose}></div>
        <div className="VoiceChat animate" ref={voiceChatRef}>
            <div className="Sidebar">
                <div className="TopBar">
                    <div style={{ position: 'relative' }}>
                        <Menu icon="more_horiz">
                            <DropdownMenu className="top left withoutTitle">
                                <MenuItem icon="graphic_eq" title="Noise Suppression" />
                                <MenuItem icon="screen_share" title="Share Screen" onClick={handleScreenShare} />
                            </DropdownMenu>
                        </Menu>
                    </div>
                    <div className="body">
                        <div className="title">Voice Chat</div>
                        <div className="subtitle">{handlePluralization(presentParticipants?.length, 'participant')}</div>
                    </div>
                    <div className="meta">
                        <Icon name="close" onClick={handleClose} />
                    </div>
                </div>
                <div className="Content">
                    <div className="VideoParticipants">
                        <div className="VideoParticipant" onClick={handleMaximized}></div>
                        {presentParticipants.map(participant =>
                            participant.video && <VideoParticipant
                                onClick={handleMaximized}
                                participant={participant}
                                stream={ssrcStream &&
                                    ssrcStream.find(item =>
                                        Number(item.ssrc.userId) === Number(participant.peer.userId) && item.ssrc.isVideo)?.stream} />
                        )}
                    </div>
                    <div className="Participants">
                        {presentParticipants.map(participant =>
                            <div className={buildClassName("Participant", !participant.muted && 'live')} key={participant.source}>
                                <SoundBubbles
                                    stream={ssrcStream &&
                                        ssrcStream.find(item =>
                                            Number(item.ssrc.userId) === Number(participant.peer.userId) && !item.ssrc.isVideo)?.stream}
                                    key={'sound-bubble-' + participant.source}>
                                    <Profile size={42}
                                        entity={participant.user}
                                        id={participant.user?.id}
                                        name={participant.user?.firstName}
                                        key={'profile-' + participant.source} />
                                </SoundBubbles>
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
                        <Icon name="videocam_off" onClick={() => { }} size={32} />
                        <div className="title">Camera</div>
                    </div>
                    <div className={buildClassName('button', 'mic', !mute && 'live')} onClick={() => setMute(!mute)}>
                        {/* <Icon name="mic_off" size={48} /> */}
                        <SoundBubbles stream={userMedia?.stream}>
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
                        </SoundBubbles>
                        <div className="title">
                            <TextTransition text={mute ? 'Unmute' : "You're Live"} />
                        </div>
                    </div>
                    <div className="button leave" onClick={leaveGroupCall}>
                        <Icon name="call_end" size={32} />
                        <div className="title">Leave</div>
                    </div>
                    <button onClick={() => setCount(count + 1)}>Count +</button>
                    <button onClick={() => setCount(count - 1)}>Count -</button>
                </div>
            </div>
            {maximized && <div ref={containerRef}
                className={buildClassName("ParticipantsContainer",
                    "VideoParticipants",
                    getContainerGridLayout(count))}>
                {Array(count).fill(0).map(() =>
                    <div className="VideoParticipant item" onClick={handleMaximized}></div>)}
            </div>}
        </div>
    </Transition>
}

export default memo(VoiceChat)