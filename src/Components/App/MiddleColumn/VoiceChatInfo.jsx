import { memo, useContext, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { TGCalls } from "../../Util/Calls/TGCalls";
import { client } from "../../../App";
import { Api } from "telegram";
import { Profile } from "../common";
import { getPeerId } from "../../Helpers/chats";
import Transition from "../Transition";
import { handleGroupCall, handleGroupCallJoined, handleGroupCallParticipants, handleToast, handleUserMediaStream } from "../../Stores/UI";
import { UserContext } from "../../Auth/Auth";
import { black } from "../../Util/Calls/voiceChat";

function VoiceChatInfo({ }) {
    const fullChat = useSelector((state) => state.ui.activeFullChat)
    const groupCall = useSelector((state) => state.ui.groupCall)

    const User = useContext(UserContext)

    const dispatch = useDispatch()

    const tgcalls = useRef()

    const participantsCount = groupCall?.participants.filter(x => !x.left).length;

    const joinVoiceChat = async (payload) => {
        let params;

        try {
            console.log('joining voice chat')

            const { updates } = await client.invoke(
                new Api.phone.JoinGroupCall({
                    call: fullChat?.call,
                    params: new Api.DataJSON({
                        data: JSON.stringify({
                            ufrag: payload.ufrag,
                            pwd: payload.pwd,
                            fingerprints: [
                                {
                                    hash: payload.hash,
                                    setup: payload.setup,
                                    fingerprint: payload.fingerprint,
                                },
                            ],
                            ssrc: payload.source,
                            'ssrc-groups': payload.sourceGroup,
                        }),
                    }),
                    joinAs: params?.joinAs || 'me',
                    muted: params?.muted || true,
                    videoStopped: params?.videoStopped || true,
                    inviteHash: params?.inviteHash,
                }),
            );

            console.log('join voice chat finished')

            for (const update of updates) {
                if (update instanceof Api.UpdateGroupCallConnection) {
                    return JSON.parse(update.params.data);
                }
            }
        } catch (err) {
            dispatch(handleToast({ icon: 'error', title: 'Failed to Join Voice Chat ' + err.errorMessage }))
        }

        throw new Error('Could not get transport');
    }

    const handleJoin = async () => {
        tgcalls.current = new TGCalls();

        tgcalls.current.joinVoiceCall = async payload => {
            // Somehow join voice call and get transport

            return await joinVoiceChat(payload);
        };

        const ssrcs = groupCall.participants.map(participant => { return { ssrc: participant.source } })

        console.log('tgcalls start')
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(async (stream) => {
                console.log('get user media', stream)
                const [audioTrack] = stream.getAudioTracks();
                // const [videoTrack] = stream.getVideoTracks();

                audioTrack.enabled = false; // Mute when Joined

                dispatch(handleUserMediaStream(stream))

                const connection = await tgcalls.current.start(
                    audioTrack,
                    black({ width: 640, height: 480 }),
                    groupCall.participants);

                const date = Date.now()

                dispatch(handleGroupCallJoined({ connection: { ...connection, tgcalls: tgcalls.current } }))
                dispatch(handleGroupCallParticipants([{
                    ...new Api.GroupCallParticipant({
                        self: true,
                        left: false,
                        muted: true,
                        date,
                        source: connection.source,
                        peer: new Api.PeerUser({
                            userId: User.id
                        })
                    }), user: User
                }]))
            });
    }

    useEffect(() => {
        (async () => {
            if (!fullChat?.call || groupCall?.joined) return
            const getGroupCall = await client.invoke(new Api.phone.GetGroupCall({
                call: fullChat?.call,
                // limit: 3
            }))

            const participants = getGroupCall.participants?.map(participant => {
                var user = getGroupCall.users.find(item => Number(item.id) === getPeerId(participant.peer))
                console.log(getPeerId(participant.peer))
                return { ...participant, user }
            })

            const result = { ...getGroupCall, participants }

            dispatch(handleGroupCall(result))
            console.log(result)
        })()
    }, [fullChat?.call])

    return <Transition state={fullChat?.call && participantsCount >= 0 && !groupCall?.joined}>
        <div className="VoiceChatInfo">
            <div className="info">
                <div className="meta ParticipantProfiles">
                    {groupCall && groupCall.participants?.filter(participant => !participant.left).map((participant) => {
                        return <Profile
                            key={Number(participant?.peer?.userId)}
                            size={36}
                            entity={participant?.user}
                            id={participant?.user?.id?.value}
                            name={participant?.user?.firstName} />
                    })}
                </div>
                <div className="FlexColumn">
                    <div className="title">
                        {groupCall?.call?.title ?? 'Voice Chat'}
                    </div>
                    <div className="subtitle">
                        {participantsCount} participants
                    </div>
                </div>
            </div>
            <div className="actions">
                <div className="Join button" onClick={handleJoin}>Join</div>
            </div>
        </div>
    </Transition>
}

export default memo(VoiceChatInfo)