import { parseSdp } from "./parseSdp";
import { SdpBuilder } from "./sdp-builder";

export class TGCalls extends EventTarget {
    constructor(params) {
        super();
        this.connection = null;
        this.params = params;
        this.joinVoiceCall = null;
    }

    async start(audio, video) {
        if (this.connection) {
            throw new Error('Connection already started');
        } else if (!this.joinVoiceCall) {
            throw new Error(
                'Please set the `joinVoiceCall` callback before calling `start()`'
            );
        }

        this.connection = new RTCPeerConnection();
        this.connection.oniceconnectionstatechange = () => {
            this.dispatchEvent(new CustomEvent('iceConnectionState', {
                detail: this.connection.iceConnectionState,
            }));

            switch (this.connection.iceConnectionState) {
                case 'closed':
                case 'failed':
                    this.dispatchEvent(new Event('hangUp'));
                    break;
            }
        };

        if (audio)
            this.connection.addTrack(audio);
        if (video)
            this.connection.addTrack(video);

        console.log('creating offer')

        const offer = await this.connection.createOffer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true,
        });

        console.log('set local description')

        await this.connection.setLocalDescription(offer);

        console.log('set local description finished')

        if (!offer.sdp) {
            console.log('offer does not have sdp')
            return;
        }

        const { ufrag, pwd, hash, fingerprint, source, sourceGroup } = parseSdp(offer.sdp);

        if (!ufrag || !pwd || !hash || !fingerprint || !source) {
            console.log(ufrag, pwd, hash, fingerprint, source, sourceGroup)
            console.log('data is not enough')
            return;
        }

        let joinVoiceCallResult;
        try {
            joinVoiceCallResult = await this.joinVoiceCall({
                ufrag,
                pwd,
                hash,
                setup: 'active',
                fingerprint,
                source,
                sourceGroup,
                params: this.params,
            });
        } catch (error) {
            this.close();
            throw error;
        }

        if (!joinVoiceCallResult || !joinVoiceCallResult.transport) {
            this.close();
            throw new Error('No transport found');
        }

        const sessionId = Date.now();
        const conference = {
            sessionId,
            transport: joinVoiceCallResult.transport,
            ssrcs: [{ ssrc: source, ssrcGroup: sourceGroup }],
        };

        await this.connection.setRemoteDescription({
            type: 'answer',
            sdp: SdpBuilder.fromConference(conference),
        });
    }

    close() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    }
}
