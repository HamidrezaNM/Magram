import { memo } from "react"

function Passcode() {
    return <div className="Passcode">
        <div className="Container">
            <div className="Code">1234</div>
            <div className="button">Enter</div>
        </div>
    </div>
}

export default memo(Passcode)