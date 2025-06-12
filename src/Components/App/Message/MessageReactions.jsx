import { memo } from "react";
import Reaction from "./Reaction";

function MessageReactions({ messageId, chatId, reactions, children }) {
    const { topReactors, results } = reactions

    return <div className="MessageReactions">
        {results.map((item) =>
            <Reaction key={'reaction-' + item.reaction.emoticon} messageId={messageId} chatId={chatId} emoticon={item.reaction.emoticon} emojiId={item.reaction.documentId} isPaid={item.reaction.className === 'ReactionPaid'} count={item.count} isActive={item.flags} />
        )}
        {children}
    </div>
}

export default memo(MessageReactions)