import { memo, useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PageClose, PageHeader } from "../../Page";
import { Icon, Switch } from "../../common";
import { UserContext } from "../../../Auth/Auth";
import buildClassName from "../../../Util/buildClassName";

export default function SettingsAnimations() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [animatedStickers, setAnimatedStickers] = useState(window.Animations?.AnimatedStickers)
    const [chatAnimations, setChatAnimations] = useState(window.Animations?.ChatAnimations)
    const [autoPlayGIFs, setAutoPlayGIFs] = useState(window.Animations?.AutoPlayGIFs)

    const dispatch = useDispatch()

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (!window.Animations) window.Animations = {}
        window.Animations.AnimatedStickers = animatedStickers
    }, [animatedStickers])
    useEffect(() => {
        if (!window.Animations) window.Animations = {}
        window.Animations.ChatAnimations = chatAnimations
    }, [chatAnimations])
    useEffect(() => {
        if (!window.Animations) window.Animations = {}
        window.Animations.AutoPlayGIFs = autoPlayGIFs
    }, [autoPlayGIFs])

    return <div className={buildClassName("SettingsAnimations", !isLoaded && 'fadeThrough')}>
        <PageHeader>
            <div><Icon name="arrow_back" className="backBtn" onClick={() => PageClose(dispatch, true)} /></div>
            <div className="Title"><span>Animations</span></div>
            <div className="Meta"></div>
        </PageHeader>
        <div className="section Notifications">
            <div className="Items">
                <span className="title">Control animations</span>
                <div className="Item"><span>Animated Emoji and Stickers</span>
                    <Switch checked={animatedStickers} setChecked={setAnimatedStickers} />
                </div>
                <div className="Item"><span>Chat Animations</span>
                    <Switch checked={chatAnimations} setChecked={setChatAnimations} />
                </div>
                <div className="Item"><span>Autoplay GIFs</span>
                    <Switch checked={autoPlayGIFs} setChecked={setAutoPlayGIFs} />
                </div>
            </div>
        </div>
    </div>
}