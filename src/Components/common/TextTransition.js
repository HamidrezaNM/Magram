import { memo, useEffect, useState } from "react";
import Transition from "../App/Transition";

function TextTransition({ text }) {
    const [prevText, setPrevText] = useState()
    const [animating, setAnimating] = useState(false)

    useEffect(() => {
        return () => {
            setPrevText(text)
            setAnimating(true)
        }
    }, [text])

    return <div className="TextTransition">
        {text && <Transition state={true} key={text}>
            <span>{text}</span>
        </Transition>}
        {animating && <Transition state={true} activeAction={() => setTimeout(() => setAnimating(false), 300)}>
            <span className="prev">{prevText}</span>
        </Transition>}
    </div>
}

export default memo(TextTransition)