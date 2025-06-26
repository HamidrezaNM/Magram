import { memo, useEffect, useState } from "react"
import buildClassName from "../../Util/buildClassName"
import { getChatColor } from "../common"
import MessageMedia, { Thumbnail } from "./MessageMedia"
import { Api } from "telegram"
import { getDocumentVideoAttributes, getWebPageStory, isWebPageStory } from "../../Helpers/messages"
import { getStoriesById } from "../../Util/messages"

function WebPage({ media, userId }) {
    const [story, setStory] = useState()

    useEffect(() => {
        (async () => {
            if (isWebPageStory(media.webpage)) {
                const storyAttributes = getWebPageStory(media.webpage)
                console.log(storyAttributes)

                const getStory = await getStoriesById(storyAttributes.peer, [storyAttributes.id])

                setStory(getStory)
                console.log(getStory)
            }
        })()
    }, [media])

    return media.webpage.className !== 'WebPageEmpty' && <div className={buildClassName("WebPage", getChatColor(userId ?? 0))}>
        <div className="MessageLine"></div>
        <div className="body">
            <div className={buildClassName("siteName", getChatColor(userId ?? 0))}>{media.webpage.siteName}</div>
            <div className="title">{media.webpage.title}</div>
            <div className="description">{media.webpage.description}</div>
            {media.webpage.photo &&
                <MessageMedia media={new Api.MessageMediaPhoto({ photo: media.webpage.photo })} />}
            {story &&
                <Thumbnail
                    media={story.stories[0]?.media}
                    visible={true}
                    size={16} noAvatar={true}
                    width={getDocumentVideoAttributes(story.stories[0]?.media.document)?.w} height={getDocumentVideoAttributes(story.stories[0]?.media.document)?.h}
                    setProgress={() => { }}
                />}
        </div>

    </div>
}

// export const MediaImage = memo(({ photo }) => {
//     const [isLoaded, setIsLoaded] = useState(false)

//     const media = new Api.MessageMediaPhoto({ photo })

//     const dimensions = getPhotoDimensions(photo)

//     const downloadButton = <Transition state={!isLoaded}>
//     <div className="MediaDownload" onClick={downloadMedia}>
//         <div className="message-loading-progress">
//             <Icon name={(isDownloading || data.isUploading) ? "close" : "arrow_downward"} size={28} />
//             {(isDownloading || data.isUploading) && <CircularProgress variant="determinate" style={{ color: '#fff', animation: 'spinner 3s linear infinite' }} sx={{ [`& .${circularProgressClasses.circle}`]: { strokeLinecap: 'round' } }} thickness={3} size={isDocumentAudio(media.document) ? 22 : 48} value={progress && progress.loaded / progress.total > .01 ? (progress.loaded / progress.total) * 100 : 1} />}
//         </div>
//     </div>
// </Transition>

//     return <div className="Photo">
//         <Image
//             media={media}
//             visible={true}
//             size={16}
//             _width={dimensions?.w}
//             _height={dimensions?.h}
//             noAvatar={true}
//             isLoaded={isLoaded}
//             setIsLoaded={setIsLoaded}
//             setProgress={() => { }} />
//     </div>
// })

export default memo(WebPage)