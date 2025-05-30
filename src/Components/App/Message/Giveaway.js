import { memo, useEffect, useRef, useState } from "react";
import StarIcon from "../../common/StarIcon";
import buildClassName from "../../Util/buildClassName";
import { getDate } from "../Message";
import { formatTime } from "../../Util/dateFormat";
import { getChatColor, Profile } from "../common";
import { client } from "../../../App";
import { useDispatch } from "react-redux";
import { viewChat } from "../ChatList";
import { generateChatWithPeer } from "../../Helpers/chats";
import { numberWithCommas } from "../../Util/numbers";
import RLottie from "../../common/RLottie";

function Giveaway({ media }) {
    const [channels, setChannels] = useState()

    const dispatch = useDispatch()

    const isStars = !!media.stars

    useEffect(() => {
        (async () => {
            if (media.channels) {
                let data = new Map()

                for (let item of media.channels) {
                    let channel = await client.getEntity(item);
                    data.set(Number(channel.id), channel);
                }

                if (data) {
                    setChannels(data)
                }
            }
        })()
    }, [media])

    const renderStarDescription = () => {
        return <span>
            {numberWithCommas(Number(media.stars))} Stars will be distributed<br />
            among {media.quantity} winners.
        </span>
    }

    const renderPremiumDescription = () => {
        return <span>
            {numberWithCommas(media.quantity)} Telegram Premium<br />
            Subscriptions for {media.months} months.
        </span>
    }

    return <div className={buildClassName("Giveaway", isStars && 'Stars')}>
        <div className="Meta">
            <RLottie sticker={isStars ? 'Gift3' : 'Gift12'} autoplay={false} width={160} height={160} />
            <div className="Reward">
                {isStars && <StarIcon type="" size="adaptive" style={{ width: 14, height: 16 }} />}
                <span className="quantity">{numberWithCommas(isStars ? Number(media.stars) : 'x' + media.quantity)}</span>
            </div>
        </div>
        <div className="Body">
            <div className="Prizes">
                <div className="title">
                    Giveaway Prizes
                </div>
                <span className="subtitle">
                    {isStars ? renderStarDescription() : renderPremiumDescription()}
                </span>
            </div>
            <div className="Participants">
                <div className="title">
                    Participants
                </div>
                <span className="subtitle">
                    All subscribers of the channel:
                </span>
                <div className="Channels">
                    {media.channels.map(item =>
                        <div
                            className={
                                buildClassName("Channel",
                                    getChatColor(Number(item) ?? 0))}
                            onClick={() => viewChat(generateChatWithPeer(channels?.get(Number(item))), dispatch)}>
                            <Profile
                                id={item}
                                name={channels?.get(Number(item))?.title}
                                entity={channels?.get(Number(item))}
                                size={24} />
                            <span className="title">
                                {channels?.get(Number(item))?.title ?? 'Loading...'}
                            </span>
                        </div>)}
                </div>
            </div>
            <div className="SelectionDate">
                <div className="title">
                    Winners Selection Date
                </div>
                <span className="subtitle">
                    {`${getDate(media.untilDate * 1000, true, false)} at ${formatTime(media.untilDate * 1000)}`}
                </span>
            </div>
        </div>
    </div>
}

export default memo(Giveaway)