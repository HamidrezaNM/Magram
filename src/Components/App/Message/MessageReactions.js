import { memo } from "react";

function MessageReactions({ reactions, children }) {
    const { topReactors, results } = reactions

    return <div className="MessageReactions">
        {results.map((item) =>
            <div className="reaction"><span className="emoticon">{item.reaction.emoticon}</span> <span>{item.count}</span></div>
        )}
        {children}
    </div>
}

export default memo(MessageReactions)