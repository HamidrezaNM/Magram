import { memo } from "react";
import { useSelector } from "react-redux";
import { StoryButton } from "./Stories";
import { StoryCircle } from "../common/StoryCircle";
import { Profile } from "./common";

function StoryToggler({ ref }) {
    const stories = useSelector(state => state.ui.stories)

    return <div className="StoryToggler ProfileCompact" ref={ref}>
        {[...stories].slice(0, 3).reverse().map((story, index) => <><div className="Story">
            <div className="StoryAvatar">
                <StoryCircle size={26} stories={story.stories} maxReadId={story.maxReadId} />
                <Profile size={24} entity={story.entity} id={story.entity?.id} name={story.entity?.title || story.entity?.firstName} />
            </div>
        </div>
        </>)}
    </div>
}

export default memo(StoryToggler)