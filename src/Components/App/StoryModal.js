import { memo, useState } from "react";
import Transition from "./Transition";
import { Icon, Profile } from "./common";
import FullNameTitle from "../common/FullNameTitle";
import { getDate } from "./Message";
import { Image, Video } from "./Message/MessageMedia";
import { getDocumentVideoAttributes, getPhotoDimensions, isDocumentVideo } from "../Helpers/messages";
import { useDispatch, useSelector } from "react-redux";
import { formatTime } from "../Util/dateFormat";
import { handleStoryModal } from "../Stores/UI";

function StoryModal({ peerIndex = 0, itemIndex = 0, stories }) {
    const [activePeerIndex, setActivePeerIndex] = useState(peerIndex)
    const [activeItemIndex, setItemIndex] = useState(itemIndex)
    const [open, setOpen] = useState(true)

    const dispatch = useDispatch()

    return <Transition state={open} onDeactivate={() => dispatch(handleStoryModal())}>
        <div className="StoryModal">
            <div className="bg" style={{ backgroundColor: '#000c' }} onClick={() => setOpen(false)}></div>
            <Story story={stories[activePeerIndex].stories[activeItemIndex]} peer={stories[activePeerIndex].entity} />
        </div>
    </Transition>
}

const Story = memo(({ story, peer }) => {
    const renderMedia = (media) => {
        switch (media.className) {
            case 'MessageMediaPhoto':
                return <MediaImage media={media} />
            case 'MessageMediaDocument':
                if (isDocumentVideo(media.document))
                    return <MediaVideo media={media} />
                break;
            default:
                break;
        }
    }

    return <div className="Story">
        <div className="TopBar">
            <Profile size={32} entity={peer} id={peer.id} name={peer.firstName || peer.title} />
            <div className="body">
                <div className="title"><FullNameTitle chat={peer} /></div>
                <div className="subtitle">{getDate(story.date * 1000, true, true)} at {formatTime(story.date * 1000)}</div>
            </div>
        </div>
        <div className="Content">
            {renderMedia(story.media)}
        </div>
        <div className="BottomBar">
            <div className="views">
                <Icon name="visibility" />
                <span>{story.views.viewsCount}</span>
            </div>
        </div>
    </div>
})

const MediaImage = memo(({ media }) => {
    const [isLoaded, setIsLoaded] = useState(false)

    const photoDimensions = getPhotoDimensions(media.photo)

    return <Image
        media={media}
        visible={true}
        size={null}
        _width={photoDimensions?.w}
        _height={photoDimensions?.h}
        noAvatar={true}
        isLoaded={isLoaded}
        setIsLoaded={setIsLoaded}
        setProgress={() => { }} />
})

const MediaVideo = memo(({ media }) => {
    const [isLoaded, setIsLoaded] = useState(false)

    const videoAttributes = getDocumentVideoAttributes(media.document)

    return <Video
        media={media}
        visible={true}
        details={{
            duration: videoAttributes?.duration,
            size: Number(media.document.size?.value)
        }}
        size={null} width={videoAttributes?.w} height={videoAttributes?.h} noAvatar={true}
        isLoaded={isLoaded}
        setIsLoaded={setIsLoaded}
        setProgress={() => { }}
        autoplay={true} />
})

export default memo(StoryModal)