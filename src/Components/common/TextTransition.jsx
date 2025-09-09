import { memo, useEffect, useRef, useState } from "react";
import Transition from "../App/Transition";

function TextTransition({ text, style }) {
    const [prevText, setPrevText] = useState()
    const [currentText, setCurrentText] = useState()
    const [animating, setAnimating] = useState(false)

    // TODO: Update TextTransition Code

    // const prevText = useRef()

    useEffect(() => {
        setCurrentText(text)
        return () => {
            setPrevText(text)
            setAnimating(true)
            // prevText.current = text
        }
    }, [text])

    return <div className="TextTransition" style={style}>
        {currentText && <Transition state={true} key={currentText} alwaysShow>
            <span>{currentText}</span>
        </Transition>}
        {animating && <Transition state={true} alwaysShow activeAction={() => setTimeout(() => setAnimating(false), 300)}>
            <span className="prev">{prevText}</span>
        </Transition>}
    </div>
}

export default memo(TextTransition)