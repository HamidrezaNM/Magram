import { memo } from "react";

function Link({ url, allowClick, children }) {
    return <a href={allowClick && url}>{children}</a>
}

export default memo(Link)