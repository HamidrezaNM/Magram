import { memo, useEffect } from "react"
import { client } from "../../App"
import { Api } from "telegram"
import { useDispatch, useSelector } from "react-redux"
import { handleStories, handleStoryModal } from "../Stores/UI"
import { getPeerId } from "../Helpers/chats"
import { Profile } from "./common"
import FullNameTitle from "../common/FullNameTitle"
import { StoryCircle } from "../common/StoryCircle"
import Transition from "./Transition"

function Stories() {
    const stories = useSelector(state => state.ui.stories)

    const dispatch = useDispatch()

    useEffect(() => {
        (async () => {
            try {
                const getAllStories = await client.invoke(new Api.stories.GetAllStories({}))

                let stories = getAllStories.peerStories

                const result = stories.map(item => {
                    const id = getPeerId(item.peer)
                    const entity = getAllStories.chats.find(peer => Number(peer.id) === id)

                    return { ...item, entity }
                })

                console.log('get stories', result)
                dispatch(handleStories(result))
            } catch (error) {
                console.log(error)
            }
        })()
    }, [])

    return <Transition state={stories?.length > 0}>
        <div className="Stories">
            {stories.map((story, index) => <StoryButton story={story} stories={stories} index={index} dispatch={dispatch} />)}
        </div>
    </Transition>
}

const StoryButton = memo(({ story, stories, index, dispatch }) => {

    return <div className="Story" onClick={() => dispatch(handleStoryModal({ peerIndex: index, itemIndex: 0, stories }))}>
        <div className="StoryAvatar">
            <StoryCircle size={54} stories={story.stories} maxReadId={story.maxReadId} />
            <Profile entity={story.entity} id={story.entity.id} name={story.entity.title || story.entity.firstName} />
        </div>
        <div className="title"><FullNameTitle chat={story.entity} /></div>
    </div>
})

export default memo(Stories)