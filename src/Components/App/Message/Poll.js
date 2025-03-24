import { memo, useState } from "react";
import renderTextWithEntities from "../../Helpers/renderTextWithEntities";
import { client } from "../../../App";
import { Api } from "telegram";
import buildClassName from "../../Util/buildClassName";
import { Icon } from "../common";

function Poll({ media, messageId, chatId }) {
    const [results, setResults] = useState(media.results)

    // const results = media.results?.results
    const highestVoters = results?.results && Math.max(...results?.results.map(o => o.voters))

    const onVote = async (e, item) => {
        const result = await client.invoke(new Api.messages.SendVote({
            peer: chatId,
            msgId: messageId,
            options: [item.option]
        }))
        setResults(result.updates[0].results)
    }

    return <div className={buildClassName("Poll", results?.results && 'Results')}>
        <div className="question">
            {media.poll?.question?.text}
        </div>
        <span className="PollType">Anonymous Poll</span>
        <div className="answers">
            <div className="RadioGroup">
                {media.poll.answers.map((item, index) =>
                    <label className={buildClassName("Radio", results?.results && results?.results[index].chosen && 'active')}>
                        <input type="radio" onClick={e => onVote(e, item)} value={index} name={"Poll-" + messageId} />
                        {results?.results && <div className="PollVoters">{Math.round(results?.results[index].voters / results.totalVoters * 100)}%</div>}
                        <div className="RadioMain">{renderTextWithEntities(item.text.text, item.text.entities, false)}</div>
                        {results?.results && <div className="line" style={{ width: `calc(${results.results[index].voters / highestVoters} * (100% - 32px))` }}></div>}
                        {results?.results && results?.results[index].chosen && <Icon size={14} name="done" />}
                    </label>
                )}
            </div>
        </div>
        <span className="totalVoters">{results.totalVoters} votes</span>
    </div>
}

export default memo(Poll)