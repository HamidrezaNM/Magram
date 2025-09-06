import { memo, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHeader } from "../../Page";
import { BackArrow, Icon, Switch } from "../../common";
import buildClassName from "../../../Util/buildClassName";
import { handleAnimationsOptions } from "../../../Stores/Settings";

export default function SettingsAnimations() {
    const [isLoaded, setIsLoaded] = useState(false)

    const animatedStickers = useSelector((state) => state.settings.animations?.AnimatedStickers)
    const chatAnimations = useSelector((state) => state.settings.animations?.ChatAnimations)
    const autoPlayGIFs = useSelector((state) => state.settings.animations?.AutoPlayGIFs)

    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const dispatch = useDispatch()

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    const setAnimatedStickers = (value) => {
        dispatch(handleAnimationsOptions({ AnimatedStickers: value }))
    }

    const setChatAnimations = (value) => {
        dispatch(handleAnimationsOptions({ ChatAnimations: value }))
    }

    const setAutoPlayGIFs = (value) => {
        dispatch(handleAnimationsOptions({ AutoPlayGIFs: value }))
    }

    return <div className={buildClassName("SettingsAnimations", !isLoaded && 'fadeThrough')}>
        <PageHeader>
            <div><BackArrow index={2} onClick={() => PageClose(dispatch, true)} isiOS={centerTopBar} /></div>
            <div className="Content"><span>Animations</span></div>
            <div className="Meta"></div>
        </PageHeader>
        <div className="section Notifications">
            <span className="title">Control animations</span>
            <div className="Items">
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