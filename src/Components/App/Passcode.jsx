import { memo } from "react"

function Passcode() {
    return <div className="Passcode">
        <div className="Container">
            <div className="Code"></div>
            <div className="button">Enter</div>
        </div>
    </div>
}

export default memo(Passcode)