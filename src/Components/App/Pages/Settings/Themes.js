import { memo, useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHeader } from "../../Page";
import { BackArrow, Icon, Switch } from "../../common";
import { UserContext } from "../../../Auth/Auth";
import buildClassName from "../../../Util/buildClassName";
import { handleCustomTheme } from "../../../Stores/Settings";

export default function SettingsThemes() {
    const [isLoaded, setIsLoaded] = useState(false)

    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)
    const bottomBar = useSelector((state) => state.settings.customTheme.bottomBar)
    const iOSTheme = useSelector((state) => state.settings.customTheme.iOSTheme)

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
            </div>
        </div>
    </div>
}