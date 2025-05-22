import { memo, useEffect } from "react"
import { useSelector } from "react-redux"
import { TGCalls } from "../../Util/Calls/TGCalls";
import { client } from "../../../App";
import { Api } from "telegram";

function VoiceChatInfo({ }) {
    const fullChat = useSelector((state) => state.ui.activeFullChat)

    // const peer = new RTCPeerConnection()

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
                        'ssrc-groups': [
                            {
                                semantics: 'FID',
                                sources: payload.sourceGroup,
                            },
                        ],
                    }),
                }),
                joinAs: params?.joinAs || 'me',
                muted: params?.muted || false,
                videoStopped: params?.videoStopped || false,
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
        const tgcalls = new TGCalls();

        tgcalls.joinVoiceCall = async payload => {
            // Somehow join voice call and get transport
            console.log('transoirtnmrt')

            return await joinVoiceChat(payload);
        };

        // const audioStream = new Stream(createReadStream('audio.raw'));
        // const videoStream = new Stream(createReadStream('video.raw'), {
        //     video: true,
        // });
        // navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        // .then(stream => {
        //     // localVideo.srcObject = stream;
        //     stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
        // })
        // .catch(error => console.error('Error accessing media devices.', error));

        // audioStream.on('finish', () => {
        //     console.log('Audio finished streaming');
        // });
        console.log('tgcalls start')
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then((stream) => {
                console.log('get user media')
                const [audioTrack] = stream.getAudioTracks();
                // const [videoTrack] = stream.getVideoTracks();
                return tgcalls.start(audioTrack);
            });
    }


    return fullChat?.call && <div className="VoiceChatInfo">
        <div className="Join" onClick={handleJoin}>Join</div>
    </div>
}

export default memo(VoiceChatInfo)