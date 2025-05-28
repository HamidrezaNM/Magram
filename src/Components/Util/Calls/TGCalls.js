import { parseSdp } from "./parseSdp";
import sdpbuilder from "./sdpbuilder";

export class TGCalls extends EventTarget {
    constructor(params) {
        super();
        this.connection = null;
        this.params = params;
        this.joinVoiceCall = null;
        this.remoteSsrcs = [];
        this.conference = null;
        this.remoteStreams = new Map();
        this.ssrcMap = new Map();
        this.streamMap = new Map();
        this.ssrcStreams = new Map();
        this.audioElements = new Map();

        this.ssrcs = []
        this.lastMid = 0
    }

    createDataChannel(connection) {
        const dataChannel = connection.createDataChannel('data', {
            id: 0,
        });

        dataChannel.onopen = () => {
            // console.log('Data channel open!');
        };

        dataChannel.onmessage = (e) => {
            // console.log('onmessage');
            const data = JSON.parse(e.data);
            // console.log(data);
            switch (data.colibriClass) {
                case 'DominantSpeakerEndpointChangeEvent':
                    break;
                case 'SenderVideoConstraints':

                    break;
                case 'EndpointConnectivityStatusChangeEvent':

                    break;
            }
        };

        dataChannel.onerror = (e) => {
            console.log('%conerror', 'background: green; font-size: 5em');
            console.error(e);
        };

        return dataChannel;
    }


    async start(audio, video, ssrcs) {
        if (this.connection) {
            throw new Error('Connection already started');
        } else if (!this.joinVoiceCall) {
            throw new Error(
                'Please set the `joinVoiceCall` callback before calling `start()`'
            );
        }

        this.connection = new RTCPeerConnection();

        const isPresentation = false; // TODO: It's Temporary

        // const dataChannel = isPresentation ? undefined : this.createDataChannel(this.connection);

        this.connection.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', this.connection.iceConnectionState);
            this.dispatchEvent(new CustomEvent('iceConnectionState', {
                detail: this.connection.iceConnectionState,
            }));

            switch (this.connection.iceConnectionState) {
                case 'closed':
                case 'failed':
                    this.dispatchEvent(new Event('hangUp'));
                    break;
                case 'connected':
                    console.log('Successfully connected to voice chat');
                    break;
            }
        };

        this.connection.ontrack = (event) => {
            console.log('📡 New track received:', event.track.kind, 'SSRC:', event.track.id, event);

            const stream = event.streams[0];
            if (!stream) {
                console.warn('No stream found for track');
                return;
            }

            const streamId = stream.id;

            if (!this.remoteStreams.has(streamId)) {
                this.remoteStreams.set(streamId, stream);

                if (event.track.kind === 'audio') {
                    const audio = new Audio();
                    audio.srcObject = stream;
                    audio.autoplay = true;
                    audio.volume = 1.0;

                    audio.id = streamId

                    audio.style.display = 'none';
                    document.body.appendChild(audio);

                    this.dispatchEvent(new CustomEvent('new-remote-stream', {
                        detail: { ssrc: streamId.split('audio')[1], stream }
                    }));

                    this.audioElements.set(streamId, audio);

                    console.log('🔊 Audio element created for stream:', streamId);

                    // Event listeners for debugging
                    audio.oncanplay = () => console.log('Audio can play:', streamId);
                    audio.onplay = () => console.log('Audio started playing:', streamId);
                    audio.onerror = (e) => console.error('Audio error:', e, streamId);
                }
            }
        };

        this.connection.onnegotiationneeded = () => {
            console.log('Conenction OnNegirapkletyion')
        }

        // Add Input Tracks
        if (audio) {
            console.log('Adding audio track');
            this.connection.addTrack(audio);
        }
        if (video) {
            console.log('Adding video track');
            this.connection.addTrack(video);
        }

        console.log('Creating offer...');

        const offer = await this.connection.createOffer({
            offerToReceiveVideo: false,
            offerToReceiveAudio: true,
        });

        console.log('Setting local description...');
        await this.connection.setLocalDescription(offer);

        if (!offer.sdp) {
            console.error('Offer does not have SDP');
            return;
        }

        const { ufrag, pwd, hash, fingerprint, source, sourceGroup } = parseSdp(offer.sdp);

        if (!ufrag || !pwd || !hash || !fingerprint || !source) {
            console.error('Missing required SDP parameters:', { ufrag, pwd, hash, fingerprint, source, sourceGroup });
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
            console.error('Join voice call failed:', error);
            this.close();
            throw error;
        }

        if (!joinVoiceCallResult || !joinVoiceCallResult.transport) {
            this.close();
            throw new Error('No transport found');
        }

        console.log('Join result:', joinVoiceCallResult);

        // this.connection.addTransceiver('audio', { direction: 'recvonly' });

        const audioSsrc = !isPresentation ? {
            userId: '',
            sourceGroups: [
                {
                    sources: [source || 0],
                },
            ],
            isRemoved: isPresentation,
            isMain: true,
            isVideo: false,
            isPresentation,
            endpoint: isPresentation ? '1' : '0',
            mid: isPresentation ? '1' : '0'
        } : undefined;

        const videoSsrc = sourceGroup && {
            isPresentation,
            userId: '',
            sourceGroups: sourceGroup,
            isMain: true,
            isVideo: true,
            endpoint: false ? '0' : '1',
            mid: isPresentation ? '0' : '1'
        };

        if (isPresentation) {
            if (videoSsrc) this.ssrcs.push(videoSsrc);
            if (audioSsrc) this.ssrcs.push(audioSsrc);
        } else {
            if (audioSsrc) this.ssrcs.push(audioSsrc);
            if (videoSsrc) this.ssrcs.push(videoSsrc);
        }


        // ssrcs.forEach(participant => {
        //     this.lastMid = this.lastMid + 1;
        //     this.ssrcs.push({
        //         userId: participant.id,
        //         isMain: false,
        //         endpoint: `audio${participant.source}`,
        //         isVideo: false,
        //         sourceGroups: [{
        //             sources: [participant.source],
        //         }],
        //         mid: this.lastMid.toString()
        //     });
        // })

        const sessionId = Date.now();
        this.conference = {
            sessionId,
            transport: joinVoiceCallResult.transport,
            audioExtensions: joinVoiceCallResult.audio?.['rtp-hdrexts'],
            audioPayloadTypes: joinVoiceCallResult.audio?.['payload-types'],
            videoExtensions: joinVoiceCallResult.video?.['rtp-hdrexts'],
            videoPayloadTypes: joinVoiceCallResult.video?.['payload-types'],
            ssrcs: [...this.ssrcs],
        };

        // Setting remoteSdp
        const remoteSdp = sdpbuilder(this.conference, true);
        console.log('Setting remote SDP:', remoteSdp);

        await this.connection.setRemoteDescription({
            type: 'answer',
            sdp: remoteSdp,
        });

        this.handleUpdateGroupCallParticipants(ssrcs)

        // For debugging
        setInterval(async () => {
            await this.checkStats();
        }, 3000);

        setInterval(() => {
            this.updateSsrcMapFromStats();
        }, 1000);

        return { source }
    }

    async checkStats() {
        if (!this.connection) return;

        const stats = await this.connection.getStats();
        console.log('=== Connection Stats ===');

        for (const report of stats.values()) {
            if (report.type === 'inbound-rtp') {
                console.log(`📡 Inbound ${report.mediaType} - SSRC: ${report.ssrc}, Packets: ${report.packetsReceived}, Bytes: ${report.bytesReceived}`, report);
            } else if (report.type === 'outbound-rtp') {
                console.log(`📤 Outbound ${report.mediaType} - SSRC: ${report.ssrc}, Packets: ${report.packetsSent}, Bytes: ${report.bytesSent}`);
            } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                console.log('🔗 Active candidate pair:', report.localCandidateId, '->', report.remoteCandidateId);
            }
        }
    }

    // Add ssrc for new participant
    async addRemoteParticipant(ssrc, ssrcGroup) {
        if (!this.conference) {
            console.warn('Conference not initialized');
            return;
        }

        if (!this.conference.ssrcs.includes(ssrc)) {
            this.conference.ssrcs.push(ssrc);

            const updatedSdp = sdpbuilder(this.conference);
            console.log('Updating remote SDP with new participant:', ssrc);

            await this.connection.setRemoteDescription({
                type: 'answer',
                sdp: updatedSdp,
            });
        }

    }

    async removeRemoteParticipant(ssrc) {
        if (!this.conference) return;

        this.conference.ssrcs = this.conference.ssrcs.filter(s => s.ssrc !== ssrc);

        // const updatedSdp = SdpBuilder.fromConference(this.conference);
        const updatedSdp = sdpbuilder(this.conference);
        await this.connection.setRemoteDescription({
            type: 'answer',
            sdp: updatedSdp,
        });
    }

    async updateSsrcMapFromStats() {
        if (!this.connection) return;

        const stats = await this.connection.getStats();
        for (const report of stats.values()) {
            if (report.type !== 'inbound-rtp' || !report.ssrc) continue;

            const ssrc = report.ssrc;
            if (this.ssrcMap.has(ssrc)) continue;

            const receivers = this.connection.getReceivers();
            for (const receiver of receivers) {
                const track = receiver.track;
                if (!track) continue;

                if (track.kind !== 'audio') continue;

                const stream = new MediaStream([track]);
                this.ssrcMap.set(ssrc, track);
                this.streamMap.set(ssrc, stream);

                // this.dispatchEvent(new CustomEvent('new-remote-stream', {
                //     detail: { ssrc, stream }
                // }));

                break;
            }
        }
    }

    async handleUpdateGroupCallParticipants(updatedParticipants) {
        updatedParticipants.forEach(participant => {
            if (participant.self || participant.left) return

            this.lastMid = this.lastMid + 1;
            this.conference.ssrcs.push({
                userId: participant.peer.userId,
                isMain: false,
                endpoint: `audio${participant.source}`,
                isVideo: false,
                sourceGroups: [{
                    sources: [participant.source],
                }],
                mid: this.lastMid.toString()
            });
        })

        console.log(this.conference.ssrcs)


        const sdp = sdpbuilder(this.conference);
        console.log('updated sdp', sdp)
        await this.connection.setRemoteDescription({
            type: 'offer',
            sdp,
        });

        const answerNew = await this.connection.createAnswer();
        await this.connection.setLocalDescription(answerNew);
    }

    close() {
        console.log('Closing TGCalls connection');

        // Removing Audio Elements
        for (const audio of this.audioElements.values()) {
            audio.pause();
            audio.srcObject = null;
            if (audio.parentNode) {
                audio.parentNode.removeChild(audio);
            }
        }
        this.audioElements.clear();
        this.remoteStreams.clear();

        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    }
}