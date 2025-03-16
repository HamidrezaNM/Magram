import { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Icon, Profile } from "../common";
import './Call.css'
import { useDispatch, useSelector } from "react-redux";
import { handleCall, handleCallLeftPanelToggle, handleCallMaximizedToggle, handleCallMinimalToggle, handleCloseCall, setActiveChat } from "../../Stores/UI";
import Peer from "peerjs";
import { socket } from "../../../App";
import { AuthContext } from "../../Auth/Auth";
import { PageHandle } from "../Page";

const Call = forwardRef(({ CallStream, setCallState }, ref) => {
    const [isConnected, setIsConnected] = useState(false)
    const [isCallAnswered, setIsCallAnswered] = useState(false)
    const [isIncoming, setIsIncoming] = useState(false)
    const [peerId, setPeerId] = useState('');
    const [callId, setCallId] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [statusText, setStatusText] = useState('Connecting...')
    const [duration, setDuration] = useState()
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoDisabled, setIsVideoDisabled] = useState(true)
    const [isRemoteVideoDisabled, setIsRemoteVideoDisabled] = useState(true)
    const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
    const [rateCall, setRateCall] = useState(false)
    const [isClosed, setIsClosed] = useState(false)
    const [hasWebcam, setHasWebcam] = useState(true)
    const [starRate, setStarRate] = useState(0)

    const remoteVideoRef = useRef(null);
    const currentUserVideoRef = useRef(null);
    const peerInstance = useRef(null);
    const peerConn = useRef(null);
    const peerCall = useRef(null);
    const myStream = useRef(null);
    const CallDisconnect = useRef(null);
    const CloseButton = useRef(null);
    const Rate = useRef(null);
    const background = useRef()
    const audioCtx = useRef()
    const audioSource = useRef()
    const analyser = useRef()
    const gainNode = useRef()
    const SoundBubblesFirst = useRef()
    const SoundBubblesSecond = useRef()
    const timerInterval = useRef()

    const Auth = useContext(AuthContext);

    const dispatch = useDispatch()

    const ui = useSelector((state) => state.ui.value)
    const chats = useSelector((state) => state.chats.value)

    useEffect(() => {
        if (!ui.call._id)
            return

        const peer = new Peer()

        peer.on('open', (id) => {
            console.log(id)
            setPeerId(id)

            if (!ui.call.incoming) {
                const chatId = Object.values(chats).find((obj) => obj.to?._id === ui.call._id)._id
                console.log('call', chatId)
                socket.emit('MakeCall', { token: Auth.authJWT, ...ui.call, chatId, peerId: id })
                socket.on('MakeCall', (response) => {
                    if (response.ok) {
                        setStatusText('Waiting...')
                        setCallState('Waiting...')
                        setCallId(response.data.callId)
                        socket.off('MakeCall')
                    }
                })
                setIsConnected(true)
                setIsIncoming(false)
            } else {
                setRemotePeerIdValue(ui.call.peerId)
                connect(ui.call.peerId)
                setIsIncoming(true)
                if (ui.callMinimal) {
                    dispatch(handleCallMinimalToggle())
                }
            }
        });


        peer.on('connection', function (conn) {
            console.log('cconnectere', conn)
            // peer.connect(id)


            // Call Connected
            // Host

            // ourVideo.querySelector('.profile').innerHTML = User.firstname.charAt(0)

            setIsHost(true)


            // playSound('/assets/sounds/Connection.wav')
            conn.on('open', function () {
                conn.on('data', function (data) {
                    // document.getElementById("alert").children[0].innerHTML = data;

                    if (data == 'declined') {
                        setStatusText('Call Declined')
                        setCallState('Call Declined')
                        const text = '{"status": "Declined Call"}'
                        socket.emit('UpdateCallStatus', { token: Auth.authJWT, peerId: conn.provider._id, status: 'declined' })
                        socket.on('UpdateCallStatus', (response) => {
                            if (response.ok) {

                            }
                        })

                        // updateCallMessage(text).then((data) => {
                        //     console.log(data);
                        // })
                        setTimeout(() => {
                            handlePeerDisconnect()
                        }, 2000);
                    } else if (data == 'connected') {
                        const text = '{"status": "Call Started"}'
                        // updateCallMessage(text).then((data) => {
                        //     console.log(data);
                        // })
                        setStatusText("Ringing...");
                        setCallState("Ringing...");
                        // changeBackground('green', 1000, true)
                        //     setTimeout(() => {
                        //         changeBackground('blue-green', 4000)
                        //         setTimeout(() => {
                        //             changeBackground('blue-violet', 6000)
                        //         }, 5000);
                        //     }, 2000);

                        // timer()
                    } else if (data == "video disabled") {
                        // document.getElementById("remoteVideo").children[1].style.opacity = "0";
                        setIsRemoteVideoDisabled(true)
                    } else if (data == "video enabled") {
                        // document.getElementById("alert").children[0].innerHTML = '';
                        // document.getElementById("remoteVideo").children[1].style.opacity = "1";
                        setIsRemoteVideoDisabled(false)
                    }
                    console.log('Received', data);
                });
                peerConn.current = conn;
                // status = "host"
                conn.send("connected")
            })
            conn.on('close', function () {
                setIsClosed(true)
                console.log("connection closed")

                // muteMic()
                // disableVideo()
                // document.querySelector(".call-output").style.display = "none"

                // const duration = document.querySelector('.status').innerHTML

                // if (duration != 'Call Declined') {
                //     const text = `{"status": "Incoming Call", "duration": "${duration}"}`
                //     updateCallMessage(text).then((data) => {
                //         if (data == 1) {
                //             // window.close()
                //           RateCall()
                //         }
                //     })
                // } else {
                RateCall()
                //     // window.close()
                // }
            })
        })

        console.log('call rerendered')

        peer.on('call', function (call) {
            var checkHasWebcam

            navigator.mediaDevices.enumerateDevices()
                .then(function (devices) {
                    console.log(devices)
                    const videoDevices = devices.filter(device => device.kind === 'videoinput')
                    checkHasWebcam = videoDevices.length > 0
                    console.log(checkHasWebcam)

                    navigator.mediaDevices.getUserMedia({
                        video: checkHasWebcam ? {
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                        } : false,
                        audio: true
                    })
                        .then((stream) => {
                            handleCall(stream)
                        }).catch((error) => {
                            console.log('aerre', error)
                            navigator.mediaDevices.getUserMedia({ video: false, audio: true })
                                .then((stream) => {
                                    handleCall(stream)
                                }).catch((err) => {
                                    console.log(err)
                                    alert(err + "unable to get media")
                                })
                        })
                })

            function handleCall(stream) {
                if (stream.getVideoTracks().length < 1) {
                    const screenTrack = createEmptyVideoTrack()
                    stream.addTrack(screenTrack)
                    setHasWebcam(false)
                } else {
                    setHasWebcam(true)
                    stream.getVideoTracks()[0].enabled = false
                }

                CallStream.current = stream
                // addOurVideo(stream);
                setIsCallAnswered(true)
                currentUserVideoRef.current.srcObject = stream;
                currentUserVideoRef.current.play();
                currentUserVideoRef.current.muted = true
                console.log(stream.getTracks())
                timer()
                setCallState('')
                call.answer(stream)
                call.on('stream', function (remoteStream) {
                    console.log(remoteStream.getTracks())
                    // if (!peerList.includes(call.peer)) {
                    // addRemoteVideo(remoteStream)
                    remoteVideoRef.current.srcObject = remoteStream
                    var playPromise = remoteVideoRef.current.play();
                    if (playPromise !== undefined) {
                        playPromise.then(_ => {
                            console.log('played')
                            // Automatic playback started!
                            // Show playing UI.
                        })
                            .catch(error => {
                                console.log('not played', error)
                                // Auto-play was prevented
                                // Show paused UI.
                            });
                    }
                    peerCall.current = call.peerConnection
                    // currentPeer = call.peerConnection
                    // peerList.push(call.peer)
                    // let videoTrack = myStream.getVideoTracks()[0]
                    // videoTrack.enabled = false;

                    audioCtx.current = new AudioContext();
                    analyser.current = audioCtx.current.createAnalyser();

                    audioSource.current = audioCtx.current.createMediaStreamSource(remoteStream);

                    audioSource.current.connect(analyser.current);
                    analyser.current.connect(audioCtx.current.destination);

                    gainNode.current = audioCtx.current.createGain();
                    gainNode.current.gain.value = 2 / 100; // double the volume
                    audioSource.current.connect(gainNode.current);

                    // connect the gain node to an output destination
                    gainNode.current.connect(audioCtx.current.destination);

                    FrameLooper()
                    // }
                })
            }
        })

        // peer.on('call', (call) => {
        //     console.log('host called peer')
        //     var getUserMedia = navigator.mediaDevices.getUserMedia

        //     getUserMedia({ video: false, audio: true }, (mediaStream) => {
        //         currentUserVideoRef.current.srcObject = mediaStream;
        //         currentUserVideoRef.current.play();
        //         call.answer(mediaStream)
        //         call.on('stream', function (remoteStream) {
        //             remoteVideoRef.current.srcObject = remoteStream
        //             remoteVideoRef.current.play();
        //         });
        //     });
        // })
        peerInstance.current = peer;
        // let deg = 0
        // let tick = () => {
        //     if (deg >= 360)
        //         deg = 0
        //     background.current.style.background = `linear-gradient(${deg++}deg, #20a4d7, #3f8bea, #8148ec, #b456d8)`
        //     requestAnimationFrame(tick)
        // }
        // requestAnimationFrame(tick)
    }, [])

    function callPeer(id) {
        var checkHasWebcam

        navigator.mediaDevices.enumerateDevices()
            .then(function (devices) {
                console.log(devices)
                const videoDevices = devices.filter(device => device.kind === 'videoinput')
                checkHasWebcam = videoDevices.length > 0

                navigator.mediaDevices.getUserMedia({
                    video: checkHasWebcam ? {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    } : false,
                    audio: true
                })
                    .then((stream) => {
                        handleCall(stream)
                    }).catch((error) => {
                        console.log('aerre', error)
                        navigator.mediaDevices.getUserMedia({ video: false, audio: true })
                            .then((stream) => {
                                handleCall(stream)
                            }).catch((err) => {
                                console.log(err)
                                alert(err + "unable to get media")
                            })
                    })
            })

        function handleCall(stream) {
            if (stream.getVideoTracks().length < 1) {
                const screenTrack = createEmptyVideoTrack()
                stream.addTrack(screenTrack)
                setHasWebcam(false)
            } else {
                setHasWebcam(true)
                stream.getVideoTracks()[0].enabled = false
            }

            CallStream.current = stream
            // addOurVideo(stream);
            // setIsCallAnswered(true)
            currentUserVideoRef.current.srcObject = stream;
            currentUserVideoRef.current.play();
            currentUserVideoRef.current.muted = true

            timer()
            setCallState('')

            let call = peerInstance.current.call(id, stream)
            call.on('stream', function (remoteStream) {
                // if (!peerList.includes(call.peer)) {
                // addRemoteVideo(remoteStream)
                remoteVideoRef.current.srcObject = remoteStream
                var playPromise = remoteVideoRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        console.log('played')
                        // Automatic playback started!
                        // Show playing UI.
                    })
                        .catch(error => {
                            console.log('not played', error)
                            // Auto-play was prevented
                            // Show paused UI.
                        });
                }
                peerCall.current = call.peerConnection
                // currentPeer = call.peerConnection
                // peerList.push(call.peer)
                // let videoTrack = stream.getVideoTracks()[0]
                // videoTrack.enabled = false;

                // context = new AudioContext();
                // analyser = context.createAnalyser();

                // source = context.createMediaStreamSource(remoteStream);

                // source.connect(analyser);
                // analyser.connect(context.destination);

                // FrameLooper()
                audioCtx.current = new AudioContext();
                analyser.current = audioCtx.current.createAnalyser();

                audioSource.current = audioCtx.current.createMediaStreamSource(remoteStream);

                audioSource.current.connect(analyser.current);
                analyser.current.connect(audioCtx.current.destination);

                gainNode.current = audioCtx.current.createGain();
                gainNode.current.gain.value = ui.voiceOutputVolume / 100; // double the volume
                audioSource.current.connect(gainNode.current);

                // connect the gain node to an output destination
                gainNode.current.connect(audioCtx.current.destination);

                FrameLooper()
                // }
            })
        }
    }

    function connect(peerID, decline = false) {
        peerConn.current = peerInstance.current.connect(peerID)
        peerConn.current.on('open', function () {
            // Receive messages
            peerConn.current.on('data', function (data) {
                // document.getElementById("alert").children[0].innerHTML = data;

                console.log(data);

                switch (data) {
                    case "connected":
                        // document.getElementById("alert").style.opacity = 0;
                        setIsConnected(true)
                        setStatusText('')
                        setCallState('')
                        if (!decline) {
                            // timer()
                            // changeBackground('green', 1000, true)
                            // setTimeout(() => {
                            //     changeBackground('blue-green', 4000)
                            //     setTimeout(() => {
                            //         changeBackground('blue-violet', 6000)
                            //     }, 5000);
                            // }, 2100);
                            // document.querySelector('.background').classList.add(ColorTheme)
                        }
                        setTimeout(() => {
                            setTimeout(() => {
                                // document.getElementById("alert").children[0].innerHTML = "";
                                // document.getElementById("alert").style.opacity = 1;
                            }, 500);
                        }, 2000);
                        break;
                    case "video disabled":
                        // document.getElementById("remoteVideo").children[1].style.opacity = 0;
                        // remoteVideoRef.current.classList.add('disabled')
                        setIsRemoteVideoDisabled(true)
                        break;
                    case "video enabled":
                        setIsRemoteVideoDisabled(false)

                        // remoteVideoRef.current.classList.remove('disabled')
                        // document.getElementById("alert").children[0].innerHTML = '';
                        // document.getElementById("remoteVideo").children[1].style.opacity = "1";
                        break;
                    default:
                        break;
                }
            });
            // peerConnected = true

            // Send messages

            if (decline) {
                peerConn.current.send('declined')
                setStatusText('')
            } else {
                peerConn.current.send('connected')
            }

            // conn.send('Hello from phone!');
        });
        peerConn.current.on('close', function () {
            setIsClosed(true)
            //   muteMic()
            //   disableVideo()

            console.log("connection closed")
            // document.querySelector(".call-output").style.display = "none"
            RateCall()
            // window.close()
        })
    }

    function handleDeclineCall() {
        try {
            peerConn.current.send('declined')
            setTimeout(() => {
                dispatch(handleCloseCall())
            }, 1000);
        } catch (error) {
            console.log('error:', error)
        }
    }

    useEffect(() => {
        if (isClosed) {
            if (isCallAnswered && isHost) {
                socket.emit('UpdateCallStatus', { token: Auth.authJWT, peerId, status: 'answered', duration: Math.floor(duration / 1000) })
                socket.on('UpdateCallStatus', (response) => {
                    if (response.ok) {

                    }
                })
            }
            try {
                CallStream.current.getTracks().forEach((track) => {
                    if (track.readyState == 'live') {
                        track.stop();
                    }
                });
            } catch (err) {

            }
        }
    }, [isClosed])

    function createEmptyVideoTrack() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new ImageData(1, 1);
        const data = new Uint32Array(img.data.buffer);
        const track = canvas.captureStream().getVideoTracks()[0];

        anim()

        return track;

        function anim() {
            for (let i = 0; i < data.length; i++) {
                data[i] = 0xFF000000;
            }
            ctx.putImageData(img, 0, 0);
            if (track.readyState === "live") {
                requestAnimationFrame(anim);
            }
        }
    }

    function toggleMuteMic() {
        if (isMuted) {
            CallStream.current.getAudioTracks()[0].enabled = true;
            setIsMuted(false)
        } else {
            CallStream.current.getAudioTracks()[0].enabled = false;
            setIsMuted(true)
        }
        // playSound('/assets/sounds/TurnOff.wav')
    }

    function toggleDisableVideo() {
        if (!hasWebcam) return
        if (isVideoDisabled) {
            CallStream.current.getVideoTracks()[0].enabled = true
            peerConn.current.send('video enabled')
            setIsVideoDisabled(false)
        } else {
            CallStream.current.getVideoTracks()[0].enabled = false
            peerConn.current.send('video disabled')
            setIsVideoDisabled(true)
        }
        // playSound('/assets/sounds/TurnOff.wav')
    }

    function startScreenShare() {
        navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: "always"
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            }
        }).then((stream) => {
            let videoTrack = stream.getVideoTracks()[0];
            videoTrack.onended = function () {
                console.log('screen ended')
                stopScreenShare();
            }
            let sender = peerCall.current.getSenders().find(function (s) {
                return s.track.kind == videoTrack.kind
            })
            sender.replaceTrack(videoTrack)
            peerConn.current.send('video enabled')
            // document.getElementById("shareScreen").parentElement.classList.add("alt")
        }).catch((err) => {
            console.log("unable to get display media. " + err)
        })
    }

    function stopScreenShare() {
        let videoTrack = CallStream.current.getVideoTracks()[0]
        var sender = peerCall.current.getSenders().find(function (s) {
            return s.track.kind == videoTrack.kind;
        })
        sender.replaceTrack(videoTrack)
        peerConn.current.send('video disabled')
        // document.getElementById("shareScreen").parentElement.classList.remove("alt")
    }

    function handlePeerDisconnect() {
        // manually close the peer connections
        for (let conns in peerInstance.current.connections) {
            peerInstance.current.connections[conns].forEach((conn, index, array) => {
                conn.peerConnection.close();
                // close it using peerjs methods
                if (conn.close)
                    conn.close();
            });
        }

        if (Object.keys(peerInstance.current.connections).length === 0) {
            console.log('peer nadashtim')
            RateCall()
        }
    }

    var fbc_array, bar_height

    function FrameLooper() {
        window.RequestAnimationFrame =
            window.requestAnimationFrame(FrameLooper) ||
            window.msRequestAnimationFrame(FrameLooper) ||
            window.mozRequestAnimationFrame(FrameLooper) ||
            window.webkitRequestAnimationFrame(FrameLooper);

        fbc_array = new Uint8Array(analyser.current.frequencyBinCount);

        analyser.current.getByteFrequencyData(fbc_array);

        for (var i = 0; i < 12; i++) {
            if (fbc_array[i] != 0) {
                bar_height = fbc_array[i] / 1000;
                SoundBubblesFirst.current.style.scale = 1.05 + bar_height / 2
                SoundBubblesSecond.current.style.scale = 1.15 + bar_height
            }
        }
    }

    function timer() {
        var initialTime = Date.now();

        function checkTime() {
            var timeDifference = Date.now() - initialTime;
            var formatted = convertTime(timeDifference);
            setDuration(timeDifference)
            setStatusText('' + formatted);
        }

        function convertTime(miliseconds) {
            var totalSeconds = Math.floor(miliseconds / 1000);
            var minutes = Math.floor(totalSeconds / 60);
            minutes = ("0" + minutes).slice(-2);
            var seconds = totalSeconds - minutes * 60;
            seconds = ("0" + seconds).slice(-2);
            return minutes + ':' + seconds;
        }
        timerInterval.current = setInterval(checkTime, 100);
    }

    function RateCall() {
        setRateCall(true)
    }

    function handleVoiceVideoSettings() {
        PageHandle(dispatch, 'VoiceVideo', 'Voice & Video', true, null, 'Settings')
    }

    useEffect(() => {
        if (isConnected && isCallAnswered && isIncoming && peerId) {
            callPeer(remotePeerIdValue)
        }
    }, [isConnected, isCallAnswered, isIncoming, peerId])

    useEffect(() => {
        if (rateCall && isCallAnswered && isConnected && !ui.callMinimal) {
            CloseButton.current.style.right = `calc(100% - 108px - ${CallDisconnect.current.offsetLeft}px + 24px)`

            setTimeout(() => {
                CloseButton.current.classList.remove('animate')
                CloseButton.current.style.width = `calc(100% - (100% - 68px - ${CallDisconnect.current.offsetLeft}px) * 2 - 24px * 2 + 16px)`
                Rate.current.classList.remove('animate')
                // starsAnimation()
                setTimeout(() => {
                    // remoteVideo.querySelector('.name').innerHTML = 'Call Ended'
                    CloseButton.current.innerHTML = '<span>Close</span>'
                }, 150);
            }, 120);
        } else if (rateCall) {
            console.log('call is not answered')
            dispatch(handleCloseCall())
        } else if (rateCall && ui.callMinimal) {
            dispatch(handleCloseCall())
        }

        clearInterval(timerInterval.current)

        cancelAnimationFrame(window.RequestAnimationFrame)
    }, [rateCall])

    useEffect(() => {
        if (gainNode.current) {
            console.log('volume:', ui.voiceOutputVolume / 100)
            gainNode.current.gain.value = ui.voiceOutputVolume / 100

            audioSource.current.connect(gainNode.current);

            // connect the gain node to an output destination
            gainNode.current.connect(audioCtx.current.destination);
        }
    }, [ui.voiceOutputVolume])

    useImperativeHandle(ref, () => ({
        onToggleMute() {
            console.log('Muted mic')
            toggleMuteMic()
        },
        onToggleVideo() {
            toggleDisableVideo()
        },
        onDisconnect() {
            handlePeerDisconnect()
        }
    }))

    let stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(<Icon onClick={(e) => {
            setStarRate(i);
            if (i >= 4)
                setTimeout(() => {
                    e.target.classList.add('animated')
                }, (i - 1) * 60);
        }} name="star" className={"animate particles" + ((starRate >= i) ? ' active' : '')} />)
    }

    return <div className={"Column" + (ui.callMinimal ? ' hidden' : '') + (ui.callMaximized ? ' Maximized' : '')}>
        <div className={"Call" + (rateCall ? ' RateCall' : '')}>
            <div className="TopBar">
                <Icon className="LeftPanelClose" name={ui.callLeftPanelClose ? "left_panel_open" : "left_panel_close"} onClick={() => dispatch(handleCallLeftPanelToggle())} />
                <span></span>
                <div>
                    <Icon className="CallSettings" name="settings" onClick={() => handleVoiceVideoSettings()} />
                    {(isCallAnswered || !isIncoming) && <Icon name={rateCall ? "close" : "south_west"} onClick={() => {
                        if (rateCall)
                            dispatch(handleCloseCall())
                        else
                            dispatch(handleCallMinimalToggle())
                    }} />}
                </div>
            </div>
            <div class={"background" + ((isConnected && isCallAnswered) ? ' connected' : '')} ref={background}></div>
            <div class="CallOutput">
                <div class={"User" + (isVideoDisabled ? ' hidden' : '')} id="ourVideo">
                    <video ref={currentUserVideoRef}></video>
                </div>
                <div class="User" id="remoteVideo">
                    <div class="UserInfo">
                        <div class="SoundBubbles">
                            <div class="first" ref={SoundBubblesFirst}></div>
                            <div class="second" ref={SoundBubblesSecond}></div>
                        </div>
                        <Profile name={ui.call?.firstname} id={ui.call?._id} size={116} />
                        <div class="Name">{rateCall ? 'Call Ended' : ui.call?.firstname}</div>
                        <div class="status">{rateCall && <Icon name="call_end" />}{statusText}</div>
                        {rateCall &&
                            <div class="rate animate" ref={Rate}>
                                <div class="title">Rate this call</div>
                                <div class="subtitle">Please rate the quality of this call</div>
                                <div class="stars animate">
                                    {stars}
                                </div>
                            </div>}
                    </div>
                    {!rateCall && <video ref={remoteVideoRef} className={isRemoteVideoDisabled ? 'disabled' : ''}></video>}
                </div>
            </div>
            <div class="bottom">
                {rateCall && <button className="close animate" ref={CloseButton} onClick={() => dispatch(handleCloseCall())}>
                    <Icon name="call_end" />
                </button>}
                {(ui.call?.incoming && !isCallAnswered) ?
                    <div class="incoming-buttons">
                        <div>
                            <button id="callAnswer" onClick={() => setIsCallAnswered(true)}>
                                <Icon name="call" />
                            </button>
                            <span>Answer</span>
                        </div>
                        <div>
                            <button id="callDecline" onClick={handleDeclineCall}>
                                <Icon name="call_end" />
                            </button>
                            <span>Decline</span>
                        </div>
                    </div> :
                    <div class="call-buttons">
                        <div>
                            <button id="shareScreen" onClick={startScreenShare}>
                                <Icon name="screen_share" />
                            </button>
                            <span>Share Screen</span>
                        </div>
                        <div className={(isVideoDisabled ? "alt" : "") + (hasWebcam ? '' : ' disabled')}>
                            <button id="disableVideo" onClick={toggleDisableVideo} className={hasWebcam ? '' : 'disabled'}>
                                <Icon name={isVideoDisabled ? "videocam" : "videocam_off"} />
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
                            <button id="call-disconnect" ref={CallDisconnect} onClick={handlePeerDisconnect}>
                                <Icon name="call_end" />
                            </button>
                            <span>End call</span>
                        </div>
                    </div>}
            </div>
            <div className="maximize" onClick={() => dispatch(handleCallMaximizedToggle())}>
                <Icon name={ui.callMaximized ? "keyboard_arrow_left" : "keyboard_arrow_right"} />
            </div>
        </div>
    </div>
})

export default Call