import { memo, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { TGCalls } from "../../Util/Calls/TGCalls";
import { client } from "../../../App";
import { Api } from "telegram";
import { Profile } from "../common";
import { getPeerId } from "../../Helpers/chats";
import Transition from "../Transition";
import { handleGroupCall, handleGroupCallJoined, handleUserMedia, handleUserMediaStream } from "../../Stores/UI";

function VoiceChatInfo({ }) {
    const fullChat = useSelector((state) => state.ui.activeFullChat)
    const groupCall = useSelector((state) => state.ui.groupCall)

    const dispatch = useDispatch()

    const tgcalls = useRef()

    const joinVoiceChat = async (payload) => {
        let params;

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
                        // 'ssrc-groups': [
                        //     {
                        //         semantics: 'FID',
                        //         sources: payload.sourceGroup,
                        //     },
                        // ],
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
                console.log('get user media')
                const [audioTrack] = stream.getAudioTracks();
                // const [videoTrack] = stream.getVideoTracks();

                dispatch(handleUserMediaStream(stream))

                const connection = await tgcalls.current.start(audioTrack, undefined, ssrcs);

                dispatch(handleGroupCallJoined({ connection: { ...connection, tgcalls: tgcalls.current } }))
            });
    }

    useEffect(() => {
        (async () => {
            if (!fullChat?.call) return
            const groupCall = await client.invoke(new Api.phone.GetGroupCall({
                call: fullChat?.call,
                // limit: 3
            }))

            const participants = groupCall.participants?.map(participant => {
                var user = groupCall.users.find(item => Number(item.id) === getPeerId(participant.peer))
                console.log(getPeerId(participant.peer))
                return { ...participant, user }
            })

            const result = { ...groupCall, participants }

            dispatch(handleGroupCall(result))
            console.log(result)
        })()
    }, [fullChat?.call])

    return <Transition state={fullChat?.call && groupCall?.participants.length >= 0}>
        <div className="VoiceChatInfo">
            <div className="info">
                <div className="meta ParticipantProfiles">
                    {groupCall && groupCall.participants?.map((participant) => {
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
                        {groupCall?.participants.length} participants
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