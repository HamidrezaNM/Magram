import { memo } from "react"
import buildClassName from "../../Util/buildClassName"
import { getChatColor } from "../common"

function WebPage({ media, userId }) {
    return media.webpage.className !== 'WebPageEmpty' && <div className={buildClassName("WebPage", getChatColor(userId ?? 0))}>
        <div className="MessageLine"></div>
        <div className="body">
            <div className={buildClassName("siteName", getChatColor(userId ?? 0))}>{media.webpage.siteName}</div>
            <div className="title">{media.webpage.title}</div>
            <div className="description">{media.webpage.description}</div>
        </div>

    </div>
}

export default memo(WebPage)