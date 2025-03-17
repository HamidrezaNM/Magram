import { memo, useEffect } from "react"
import AnimatedSticker from "./AnimatedSticker"

function CustomEmoji({ documentId }) {
    return <div className="CustomEmoji">
        <AnimatedSticker isCustomEmoji={true} media={{ document: { id: { value: documentId } } }} _width={20} _height={20} />
    </div>
}

export default memo(CustomEmoji)