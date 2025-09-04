import { memo, useEffect } from "react"
import AnimatedSticker from "./AnimatedSticker"

function CustomEmoji({ documentId, autoPlay = false, returnData = false, onLoad }) {
    return <div className="CustomEmoji">
        <AnimatedSticker
            isCustomEmoji={true}
            media={{
                document: {
                    id: {
                        value: documentId
                    }
                }
            }}
            _width={20}
            _height={20}
            autoPlay={autoPlay}
            returnData={returnData}
            onLoad={onLoad}
        />
    </div>
}

export default memo(CustomEmoji)