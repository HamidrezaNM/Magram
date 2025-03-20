import { memo } from "react";
import Reaction from "./Reaction";

function MessageReactions({ messageId, chatId, reactions, children }) {
    const { topReactors, results } = reactions

    return <div className="MessageReactions">
        {results.map((item) =>
            <Reaction messageId={messageId} chatId={chatId} emoticon={item.reaction.emoticon} count={item.count} isActive={item.flags} />
        )}
        {children}
    </div>
}

export default memo(MessageReactions)