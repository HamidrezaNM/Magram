import { memo, useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHeader } from "../../Page";
import { BackArrow, Icon, Switch } from "../../common";
import { UserContext } from "../../../Auth/Auth";
import buildClassName from "../../../Util/buildClassName";
import { handleCustomTheme } from "../../../Stores/Settings";
import { ChromePicker, GithubPicker, HuePicker, SketchPicker, SliderPicker } from "react-color";

export default function SettingsThemes() {
    const [isLoaded, setIsLoaded] = useState(false)

    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)
    const bottomBar = useSelector((state) => state.settings.customTheme.bottomBar)
    const iOSTheme = useSelector((state) => state.settings.customTheme.iOSTheme)
    const gradientMessage = useSelector((state) => state.settings.customTheme.gradientMessage)
    const noBlur = useSelector((state) => state.settings.customTheme.noBlur)
    const newSidebar = useSelector((state) => state.settings.customTheme.newSidebar)
    const primaryColor = useSelector((state) => state.settings.customTheme.primaryColor)

    const dispatch = useDispatch()

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    const setCenterTopBar = (value) => {
        dispatch(handleCustomTheme({ centerTopBar: value }))
    }

    const setBottomBar = (value) => {
        dispatch(handleCustomTheme({ bottomBar: value }))
    }

    const setIOSTheme = (value) => {
        dispatch(handleCustomTheme({ iOSTheme: value }))
    }

    const setGradientMessage = (value) => {
        dispatch(handleCustomTheme({ gradientMessage: value }))
    }

    const setNoBlur = (value) => {
        dispatch(handleCustomTheme({ noBlur: value }))
    }

    const setNewSidebar = (value) => {
        dispatch(handleCustomTheme({ newSidebar: value }))
    }

    const setPrimaryColor = (value) => {
        dispatch(handleCustomTheme({ primaryColor: value }))
    }

    return <div className={buildClassName("SettingsThemes", !isLoaded && 'fadeThrough')}>
        <PageHeader key={centerTopBar}>
            <div><BackArrow index={2} onClick={() => PageClose(dispatch, true)} isiOS={centerTopBar} /></div>
            <div className="Title"><span>Themes</span></div>
            <div className="Meta"></div>
        </PageHeader>
        <div className="section Notifications">
            <span className="title">Themes</span>
            <div className="Items">

            </div>
        </div>
        <div className="section Customization">
            <span className="title">Customization</span>
            <div className="Items">
                <div className="Item"><span>Center Top Bar</span>
                    <Switch checked={centerTopBar} setChecked={setCenterTopBar} />
                </div>
                <div className="Item"><span>Bottom Bar</span>
                    <Switch checked={bottomBar} setChecked={setBottomBar} />
                </div>
                <div className="Item"><span>iOS Theme</span> {/*Temporary*/}
                    <Switch checked={iOSTheme} setChecked={setIOSTheme} />
                </div>
                <div className="Item"><span>Gradient Background in Messages</span>
                    <Switch checked={gradientMessage} setChecked={setGradientMessage} />
                </div>
                <div className="Item"><span>No Blur</span>
                    <Switch checked={noBlur} setChecked={setNoBlur} />
                </div>
                <div className="Item"><span>New Sidebar <span className="beta">BETA</span></span>
                    <Switch checked={newSidebar} setChecked={setNewSidebar} />
                </div>
            </div>
        </div>

        <div className="section">
            <div className="Items">
                <div className="Item">
                    <span>Primary Color</span>
                    <div className="meta">
                        <span style={{
                            backgroundColor: primaryColor?.hex,
                            width: '32px',
                            height: '32px',
                            display: 'block',
                            borderRadius: '16px',
                            marginRight: '12px'
                        }}></span>
                    </div>
                    <div className="ColorPicker">
                        <SliderPicker color={primaryColor !== null ? primaryColor : undefined} onChange={setPrimaryColor} />
                    </div>
                </div>
            </div>
        </div>
    </div>
}