import parseSdp from "./parseSdp";
import sdpbuilder from "./sdpbuilder";

export class TGCalls extends EventTarget {
    constructor(params) {
        super();
        this.connection = null;
        this.dataChannel = null;
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
        this.lastMid = 2
    }

    createDataChannel(connection) {
        const dataChannel = connection.createDataChannel('data', {
            id: 0,
        });

        dataChannel.onopen = () => {
            this.maybeUpdateRemoteVideoConstraints()
            // console.log('Data channel open!');
        };

        dataChannel.onmessage = (e) => {
            // console.log('onmessage');
            const data = JSON.parse(e.data);
            // console.log(data);
            console.log(e)
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

    sendDataChannelData(data) {
        if (this.dataChannel.readyState !== 'open') {
            return;
        }

        this.dataChannel.send(JSON.stringify(data));
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

        this.dataChannel = isPresentation ? undefined : this.createDataChannel(this.connection);

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

                    const ssrc = this.conference.ssrcs.find(item => item.endpoint === streamId)

                    this.dispatchEvent(new CustomEvent('new-remote-stream', {
                        detail: { ssrc, stream }
                    }));

                    this.audioElements.set(streamId, audio);

                    console.log('🔊 Audio element created for stream:', streamId);

                    // Event listeners for debugging
                    audio.oncanplay = () => console.log('Audio can play:', streamId);
                    audio.onplay = () => console.log('Audio started playing:', streamId);
                    audio.onerror = (e) => console.error('Audio error:', e, streamId);
                } else if (event.track.kind === 'video') {
                    // const audio = document.createElement('video');
                    // audio.srcObject = stream;
                    // audio.autoplay = true;
                    // audio.volume = 1.0;

                    // audio.id = streamId

                    // // audio.style.display = 'none';
                    // document.body.appendChild(audio);

                    const ssrc = this.conference.ssrcs.find(item => item.endpoint === streamId)

                    this.dispatchEvent(new CustomEvent('new-remote-stream', {
                        detail: { ssrc, stream }
                    }));

                    // this.audioElements.set(streamId, audio);

                    console.log('🔊 Video element created for stream:', streamId);

                    // Event listeners for debugging
                    // audio.oncanplay = () => console.log('Audio can play:', streamId);
                    // audio.onplay = () => console.log('Audio started playing:', streamId);
                    // audio.onerror = (e) => console.error('Audio error:', e, streamId);
                }
            } else {
                this.remoteStreams.set(streamId, stream);

                if (event.track.kind === 'audio') {
                    const audio = this.audioElements.get(streamId)
                    audio.srcObject = stream;

                }

                const ssrc = this.conference.ssrcs.find(item => item.endpoint === streamId)

                this.dispatchEvent(new CustomEvent('remove-remote-stream', {
                    detail: { ssrc }
                }));

                this.dispatchEvent(new CustomEvent('new-remote-stream', {
                    detail: { ssrc, stream }
                }));
            }
        };

        this.connection.onnegotiationneeded = () => {
            console.log('connection negotiationneeded')
        }

        // this.connection.addTransceiver('video', { direction: 'recvonly' });

        // Add Input Tracks
        if (audio) {
            console.log('Adding audio track');
            this.connection.addTrack(audio);
        }
        if (video) {
            console.log('Adding video track');
            video.getTracks().forEach((track) => {
                this.connection.addTrack(track, video);
            });
        }

        console.log('Creating offer...');

        // const offer = await this.connection.createOffer({
        //     offerToReceiveVideo: true,
        //     offerToReceiveAudio: true,
        // });
        const offer = await this.connection.createOffer({ iceRestart: false });

        console.log('Setting local description...');
        await this.connection.setLocalDescription(offer);

        if (!offer.sdp) {
            console.error('Offer does not have SDP');
            return;
        }

        console.log(offer)

        const { ufrag, pwd, hash, fingerprint, source, sourceGroup } = parseSdp(offer);

        console.error('Missing required SDP parameters:', { ufrag, pwd, hash, fingerprint, source, sourceGroup });
        if (!ufrag || !pwd || !hash || !fingerprint || !source) {
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
            endpoint: isPresentation ? '0' : '1',
            mid: isPresentation ? '0' : '1'
        };

        if (isPresentation) {
            if (videoSsrc) this.ssrcs.push(videoSsrc);
            if (audioSsrc) this.ssrcs.push(audioSsrc);
        } else {
            if (audioSsrc) this.ssrcs.push(audioSsrc);
            if (videoSsrc) this.ssrcs.push(videoSsrc);
        }

        const sessionId = Date.now();
        this.conference = {
            sessionId,
            transport: joinVoiceCallResult.transport,
            audioExtensions: joinVoiceCallResult.audio?.['rtp-hdrexts'],
            audioPayloadTypes: joinVoiceCallResult.audio?.['payload-types'],
            videoExtensions: joinVoiceCallResult.video?.['rtp-hdrexts'],
            videoPayloadTypes: joinVoiceCallResult.video?.['payload-types'],
            ssrcs: this.ssrcs,
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
        // setInterval(async () => {
        //     await this.checkStats();
        // }, 3000);

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
                console.log(`📤 Outbound ${report.mediaType} - SSRC: ${report.ssrc}, Packets: ${report.packetsSent}, Bytes: ${report.bytesSent}`, report);
            } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                console.log('🔗 Active candidate pair:', report.localCandidateId, '->', report.remoteCandidateId);
            }
        }
    }

    async handleUpdateGroupCallParticipants(updatedParticipants) {
        updatedParticipants.forEach(participant => {
            if (participant.self) return

            const isLeft = participant.left;
            const isAudioLeft = participant.muted || participant.mutedByYou;
            const isVideoLeft = !participant.videoJoined || !participant.video || isLeft;
            const isPresentationLeft = !participant.presentation || isLeft;

            let hasVideo = false;
            let hasAudio = false;
            let hasPresentation = false;

            this.conference.ssrcs.filter((l) => Number(l.userId) === Number(participant.peer.userId)).forEach((ssrc) => {
                if (!ssrc.isVideo) {
                    if (ssrc.sourceGroups[0].sources[0] === participant.source) {
                        hasAudio = true;
                    }
                    console.log('has audio, removed=', isAudioLeft);
                    ssrc.isRemoved = isAudioLeft;
                }

                if (ssrc.isVideo) {
                    if (!ssrc.isPresentation) {
                        if (!!participant.video && ssrc.endpoint === participant.video.endpoint) {
                            hasVideo = true;
                        }
                        console.log('has video = ', hasVideo, ' removed=', isVideoLeft);
                        ssrc.isRemoved = isVideoLeft;
                    }

                    if (ssrc.isPresentation) {
                        if (!!participant.presentation && ssrc.endpoint === participant.presentation.endpoint) {
                            hasPresentation = true;
                        }
                        console.log('has presentation, removed=', isPresentationLeft);
                        ssrc.isRemoved = isPresentationLeft;
                    }
                }
            });

            if (!isAudioLeft && !hasAudio) {
                console.log('add audio');
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
            }

            if (!isVideoLeft && !hasVideo && participant.video) {
                // console.log('add video', participant.video);
                this.lastMid = this.lastMid + 1;

                // newEndpoints.push(participant.video.endpoint);
                this.conference.ssrcs.push({
                    userId: participant.peer.userId,
                    isMain: false,
                    endpoint: participant.video.endpoint,
                    isVideo: true,
                    sourceGroups: participant.video.sourceGroups,
                    mid: this.lastMid.toString()
                });

                this.maybeUpdateRemoteVideoConstraints()

                // this.connection.addTransceiver("video", { direction: "recvonly" });
            }

            if (!isPresentationLeft && !hasPresentation && participant.presentation) {
                // console.log('add presentation');
                this.lastMid = this.lastMid + 1;
                this.conference.ssrcs.push({
                    isPresentation: true,
                    userId: participant.peer.userId,
                    isMain: false,
                    endpoint: participant.presentation.endpoint,
                    isVideo: true,
                    sourceGroups: participant.presentation.sourceGroups,
                    mid: this.lastMid.toString()
                });
            }
        })

        const sdp = sdpbuilder(this.conference);
        console.log('updated sdp', sdp)
        await this.connection.setRemoteDescription({
            type: 'offer',
            sdp,
        });

        const answerNew = await this.connection.createAnswer();
        await this.connection.setLocalDescription(answerNew);
    }

    async toggleStream(stream) {
        const sender = this.connection.getSenders()[1]

        await sender.replaceTrack(stream.getTracks()[0]);

        console.log('sender', sender)
    }

    maybeUpdateRemoteVideoConstraints() {
        if (this.dataChannel.readyState !== 'open') {
            return;
        }

        console.log('maybeUpdateRemoteVideoConstraints');

        const obj = {
            colibriClass: 'ReceiverVideoConstraints',
            constraints: {},
            defaultConstraints: { maxHeight: 0 },
            onStageEndpoints: []
        };

        for (const entry of this.conference.ssrcs) {
            if (entry.isMain || !entry.isVideo) {
                continue;
            }

            const { endpoint } = entry;
            obj.onStageEndpoints.push(endpoint);
            obj.constraints[endpoint] = {
                minHeight: 180,
                maxHeight: 720
            };
        }

        this.sendDataChannelData(obj);

        // if(!obj.onStageEndpoints.length) {
        //   if(this.updateConstraintsInterval) {
        //     clearInterval(this.updateConstraintsInterval);
        //     this.updateConstraintsInterval = undefined;
        //   }
        // } else if(!this.updateConstraintsInterval) {
        //   this.updateConstraintsInterval = window.setInterval(this.maybeUpdateRemoteVideoConstraints.bind(this), 5000);
        // }
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