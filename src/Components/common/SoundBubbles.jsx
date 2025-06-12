import { memo, useEffect, useRef, useState } from "react";
import buildClassName from "../Util/buildClassName";

function SoundBubbles({ stream, children }) {
    const [active, setActive] = useState(false)

    const firstBubble = useRef()
    const secondBubble = useRef()
    const bubbles = useRef()

    const audioCtx = useRef()
    const audioSource = useRef()
    const analyser = useRef()
    const gainNode = useRef()

    const frameLooperRAF = useRef()

    var fbc_array, bar_height
    var dataArray
    var speakingFramesCount, silenceFramesCount = 0;
    var isCurrentlySilent = true

    const SILENCE_THRESHOLD = 5;  // مقداری برای averageVolume که کمتر از آن سکوت تلقی شود (مثلاً بین 1 تا 10)
    const REQUIRED_SILENT_FRAMES = 30; // تعداد فریم‌های متوالی که باید صدا زیر آستانه باشد تا "ساکت" اعلام شود (مثلاً حدود 0.5 ثانیه با 60fps)
    const REQUIRED_SPEAKING_FRAMES = 5;

    function FrameLooper() {
        frameLooperRAF.current = window.requestAnimationFrame(FrameLooper)

        // fbc_array = new Uint8Array(analyser.current.frequencyBinCount);

        // analyser.current.getByteFrequencyData(fbc_array);

        // for (var i = 0; i < 12; i++) {
        //     if (fbc_array[i] != 0) {
        //         bar_height = fbc_array[i] / 1000;
        //         firstBubble.current.style.scale = 1.05 + bar_height / 2
        //         secondBubble.current.style.scale = 1.15 + bar_height
        //         setActive(true)
        //     } else {
        //         firstBubble.current.style.scale = 0
        //         secondBubble.current.style.scale = 0
        //         setActive(false)
        //     }
        // }

        dataArray = new Uint8Array(analyser.current.frequencyBinCount);
        const bufferLength = analyser.current.frequencyBinCount; // اطمینان حاصل کنید bufferLength درست است

        analyser.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const averageVolume = sum / bufferLength;
        // visualizerInfo.audioLevel = averageVolume; // برای استفاده در ویژوالایزر حباب

        // const bubbleElement = visualizerInfo.bubbleElement;

        if (averageVolume < SILENCE_THRESHOLD) {
            speakingFramesCount = 0; // شمارنده صحبت کردن را ریست کن
            silenceFramesCount++;

            if (silenceFramesCount >= REQUIRED_SILENT_FRAMES && !isCurrentlySilent) {
                isCurrentlySilent = true;

                setActive(false)

                // bubbleElement.classList.add('notactive');
                // console.log(`User ${userId} is now silent. Average volume: ${averageVolume.toFixed(2)}`);
                // // می‌توانید اینجا ویژوالایزر حباب را هم به حالت سکون کامل ببرید
                // bubbleElement.style.transform = 'scale(1)'; // مثال: برگرداندن به اندازه پایه
            }
        } else {
            silenceFramesCount = 0; // شمارنده سکوت را ریست کن
            speakingFramesCount++;

            if (speakingFramesCount >= REQUIRED_SPEAKING_FRAMES && isCurrentlySilent) {
                isCurrentlySilent = false;
                setActive(true)
                // bubbleElement.classList.remove('notactive');
                // console.log(`User ${userId} is now speaking. Average volume: ${averageVolume.toFixed(2)}`);
            }

            // اگر کاربر ساکت نیست، ویژوالایزر حباب را بر اساس صدا به‌روز کنید
            // if (!isCurrentlySilent) {
            const scale = 1 + (averageVolume / 64); // مثال: مقیاس‌دهی بر اساس صدا (64 یک مقسوم علیه تجربی است)
            // firstBubble.current.style = `scale(${Math.min(scale * .98, 2.5)})`; // محدود کردن حداکثر اندازه
            bubbles.current.style.transform = `scale(${Math.min(scale, 2.5)})`; // محدود کردن حداکثر اندازه
            // }
        }
    }

    console.log('set active sound bubbles')

    useEffect(() => {
        if (stream) {
            console.log('Sound Bubble Started', stream)

            audioCtx.current = new AudioContext();
            analyser.current = audioCtx.current.createAnalyser();

            audioSource.current = audioCtx.current.createMediaStreamSource(stream);

            // audioSource.current.connect(analyser.current);
            // analyser.current.connect(audioCtx.current.destination);

            gainNode.current = audioCtx.current.createGain();
            gainNode.current.gain.value = 1; // double the volume
            audioSource.current.connect(gainNode.current);

            // connect the gain node to an output destination
            gainNode.current.connect(analyser.current);

            FrameLooper()
        }

        return () => cancelAnimationFrame(frameLooperRAF.current)
    }, [stream])

    return <div className={buildClassName("SoundBubblesContainer", active && 'active')}>
        <div class="SoundBubbles" ref={bubbles}>
            <div class="first" ref={firstBubble}></div>
            <div class="second" ref={secondBubble}></div>
        </div>
        {children}
    </div>
}

export default memo(SoundBubbles)