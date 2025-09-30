import { memo, useContext, useEffect, useRef, useState } from "react"
import { client } from "../../App"
import { Api } from "telegram"
import { useDispatch, useSelector } from "react-redux"
import { handleStories, handleStoryModal, handleToast } from "../Stores/UI"
import { getPeerId } from "../Helpers/chats"
import { Profile } from "./common"
import FullNameTitle from "../common/FullNameTitle"
import { StoryCircle } from "../common/StoryCircle"
import Transition from "./Transition"
import { UserContext } from "../Auth/Auth"
import { handleCoolDown } from "../Util/coolDown"
import buildClassName from "../Util/buildClassName"

function Stories({ chatsRef, topBarTitleRef, storyToggler }) {
    const [compacted, setCompacted] = useState(false)

    const stories = useSelector(state => state.ui.stories)

    const User = useContext(UserContext)

    const storiesRef = useRef()

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
                // dispatch(handleStories(result))
                dispatch(handleStories(result))
            } catch (error) {
                console.log(error)
            }
        })()

        handleToggleTransition()
    }, [])

    const handleToggleTransition = () => {
        var elementRect = []
        var storiesRect = []
        var scrollTop = 0

        var scale = 0.5
        var elementDistanceFromCenter = 0
        var storiesDistanceFromCenter = 0

        var isInitialized = false

        var isStillAnimating = window.isStillAnimating
        var isCompletelyOpened = true
        var timeoutHandled = false
        var finishedAnimTimeout

        const init = () => {
            const children = Array.from(storiesRef.current.children)
            const headerChildren = Array.from(storyToggler.current.children)

            isInitialized = false

            children.forEach((element, index) => {
                index--

                elementRect[index] = headerChildren[Math.min(Math.max(index, 0), 2)].getBoundingClientRect()
                storiesRect[index] = element.getBoundingClientRect()

                topBarTitleRef.current.style.setProperty('--stories-width', storyToggler.current.getBoundingClientRect().width / 2 + 'px')

                if (isCompletelyOpened) {
                    element.style.transition = 'none'
                    chatsRef.current.style.transform = `translateY(${78}px)`
                    element.style.transform = `translate3d(${storiesRect[index].left}px, ${storiesRect[index].top}px, 0) scale(${1})`
                }
            })

            storiesRef.current.classList.add('animating')

            elementDistanceFromCenter = elementRect[0].width / 2
            storiesDistanceFromCenter = storiesRect[0].width / 2
            // scale = .5

            console.log(storiesRect, elementRect)

            requestAnimationFrame(() => {
                isInitialized = true

                chatsRef.current.style.transition = ''
            });
        }

        const handleAnimation = (diff, forceClose = false) => {
            const children = Array.from(storiesRef.current.children)

            // scrollTop = chatsRef.current.scrollTop

            let progress = 1 - (diff) / (80);
            // let progress = (diff) / (70);

            var stretchValue

            isCompletelyOpened = false

            if (finishedAnimTimeout)
                clearTimeout(finishedAnimTimeout)

            if (scrollTop > 0 || (scrollTop === 0 && diff > 0 && diff <= 80) || (scrollTop === 0 && diff < 0)) {
                // Closing Stories

                chatsRef.current.style.transform = (scrollTop > 0 || forceClose) ? '' : `translateY(${Math.max(diff, 0) * .2}px)`

                if (!timeoutHandled && isStillAnimating)
                    setTimeout(() => {
                        isStillAnimating = false
                        setCompacted(true)
                        console.log('animation finished')
                    }, 500);
                timeoutHandled = true

                if (isStillAnimating)
                    progress = diff > 20 ? 1 : 1
                else {
                    progress = Math.max(0, Math.min(1, progress));
                }

                if (scrollTop > 0 || forceClose)
                    progress = 1

                topBarTitleRef.current.style.setProperty('--progress', progress)

                storiesRef.current.classList.add('animating', 'ProfileCompact')
                children.forEach((element, index) => {
                    index--
                    if (index < 0 || index > 2) element.classList.add('hidden')
                    stretchValue = (5 * Math.min(index + 1, 3)) * (1 - progress)

                    if (isStillAnimating)
                        element.style.transition = `transform .3s ${Math.min(Math.max(index, 0), 2) * .05}s ease, opacity .3s ease`
                    else if (progress < .2 || forceClose) {
                        element.style.transition = `transform .3s ${Math.min(Math.max(2 - index, 0), 2) * .02}s ease, opacity .3s ease`
                    } else
                        element.style.transition = 'none'

                    element.style.transform = `translate3d(${elementRect[index].left - storiesDistanceFromCenter + elementDistanceFromCenter + stretchValue}px, ${(elementRect[index].top - storiesDistanceFromCenter + elementDistanceFromCenter + stretchValue + ((elementRect[index].top - storiesRect[index].top) * 0 * (1 - progress))) * 1}px, 0) scale(${scale})`
                })
                // setTimeout(() => {
                //     storyToggler.current.classList.remove('hidden')
                //     storiesRef.current.classList.add('hidden')
                // }, 200);
            } else if (diff > 80) {
                // Opening stories

                progress = 0

                if (!isStillAnimating) {
                    navigator.vibrate(1)
                    setCompacted(false)
                }

                isStillAnimating = true
                timeoutHandled = false

                topBarTitleRef.current.style.setProperty('--progress', 2)

                if (forceClose)
                    chatsRef.current.style.transition = ''

                console.log('still animating')

                storiesRef.current.classList.remove('ProfileCompact')
                chatsRef.current.style.transform = `translateY(${78}px)`
                // storyToggler.current.classList.add('hidden')
                // storiesRef.current.classList.remove('hidden')
                children.forEach((element, index) => {
                    index--
                    if (index < 0 || index > 2) element.classList.remove('hidden')
                    // element.style.transition = `transform .3s ${Math.min(index, 2) * .05}s ease, opacity .3s ease`
                    element.style.transform = `translate3d(${storiesRect[index].left}px, ${elementRect[index].top + ((storiesRect[index].top - elementRect[index].top) * 1 * (1 - progress))}px, 0) scale(${1})`
                })

                finishedAnimTimeout = setTimeout(() => {
                    children.forEach((element, index) => {
                        element.style.transition = 'none'
                        element.style.transform = ''
                        chatsRef.current.style.transform = ''
                        chatsRef.current.style.transition = 'none'
                    })
                    storiesRef.current.classList.remove('animating')
                    isCompletelyOpened = true
                }, 500)

                // setTimeout(() => {
                // children.forEach((element, index) => {
                //     element.style.transform = ``
                // })
                // storiesRef.current.classList.remove('animating')
                // }, 300);
            }

            // if (!forceClose) {
            storiesRef.current.style.setProperty('--opacity', Math.ceil(progress))
            storiesRef.current.style.setProperty('--progress', progress)
            // }
        }

        let startY = 0;

        chatsRef.current.addEventListener("touchstart", (e) => {
            startY = e.touches[0].pageY;
            scrollTop = chatsRef.current.scrollTop;
        }, { passive: true });

        chatsRef.current.addEventListener("touchmove", (e) => {
            const currentY = e.touches[0].pageY;
            const diff = scrollTop > 0 ? 0 : currentY - startY;

            if ((storiesRef.current && storyToggler.current) && (elementRect.length === 0 || storiesRect.length === 0) || (isCompletelyOpened && isInitialized)) {
                init()
            }

            if (isInitialized)
                handleAnimation(diff)

            if (chatsRef.current.scrollTop > 0) return

            if (scrollTop === 0 && diff > 0) {
                // chatsRef.current.style.transform = `translate3d(0, ${diff * 0.3}px, 0)`;
            }

            else if (chatsRef.current.scrollHeight - chatsRef.current.clientHeight - scrollTop <= 0 && diff < 0) {
                // handleAnimation(diff)
                // chatsRef.current.style.transform = `translate3d(0, ${diff * 0.3}px, 0)`;
            }
        });

        chatsRef.current.addEventListener("touchend", (e) => {
            const currentY = e.changedTouches[0].pageY;
            const diff = scrollTop > 0 ? 0 : currentY - startY;

            handleAnimation(diff, true)
            // chatsRef.current.style.transition = "transform 0.3s ease";
            // chatsRef.current.style.transform = "translate3d(0, 0, 0)";
            // setTimeout(() => {
            //     chatsRef.current.style.transition = "";
            // }, 300);
        });

        // chatsRef.current.addEventListener('scroll', handleAnimation)
    }

    return <Transition state={stories?.length > 0}>
        <div className="scrollable x">
            <div className="Stories" ref={storiesRef}>
                <StoryButton story={{ entity: User, stories: [] }} disabled={compacted} stories={stories} index={-1} dispatch={dispatch} />
                {[...stories].reverse().map((story, index) => <StoryButton disabled={compacted} story={story} stories={stories} index={index} dispatch={dispatch} />)}
            </div>
        </div>
    </Transition>
}

export const StoryButton = memo(({ story, stories, index, dispatch, disabled = false }) => {

    return <div className="Story" style={{ zIndex: Math.max(3 - index, 0) }} onClick={() => {
        if (disabled) return;
        if (story.entity?.self) {
            dispatch(handleToast({ icon: 'error', title: 'You can cry about it' }))

            return;
        }
        dispatch(handleStoryModal({ peerIndex: index, itemIndex: 0, stories }))
    }}>
        <div className="StoryAvatar">
            <StoryCircle size={54} stories={story.stories} maxReadId={story.maxReadId} />
            <div className="StorySimple"></div>
            <Profile entity={story.entity} id={story.entity?.id} name={story.entity?.title || story.entity?.firstName} />
        </div>
        <div className="title">{story.entity?.self ? 'My Story' : <FullNameTitle chat={story.entity} hideEmojiStatus />}</div>
    </div>
})

export default memo(Stories)