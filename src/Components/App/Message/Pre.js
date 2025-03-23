import { memo } from "react";

function Pre({ allowClick, children }) {
    return <div className="Code"><pre>{children}</pre></div>
}

export default memo(Pre)