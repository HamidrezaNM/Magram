import { memo } from "react"
import DynamicPositionTransition from "../../../common/DynamicPositionTransition"

function BotInlineResults({ results, sendInlineBotResult }) {
    return <DynamicPositionTransition
        state={results?.results?.length}
        height
    >
        <div className="InlineResults scrollable">
            {results?.results && results.results.map(item =>
                <div className="item" key={item.id} onClick={() => sendInlineBotResult(item, results.queryId)}>
                    <div className="meta"></div>
                    <div className="FlexColumn">
                        <div className="title">{item.title}</div>
                        <div className="subtitle">{item.description}</div>
                    </div>
                </div>
            )}
        </div>
    </DynamicPositionTransition>
}

export default memo(BotInlineResults)