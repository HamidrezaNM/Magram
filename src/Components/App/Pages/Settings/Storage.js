import { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHandle, PageHeader, SubPage } from "../../Page";
import { BackArrow, Icon, Switch } from "../../common";
import { UserContext } from "../../../Auth/Auth";
import { Slider } from "@mui/material";
import Message from "../../Message";
import SettingsAnimations from "./Animations";
import Transition from "../../Transition";
import buildClassName from "../../../Util/buildClassName";
import SettingsThemes from "./Themes";
import { handleToggleDarkMode } from "../../../Stores/Settings";
import SettingsStorageUsage from "./StorageUsage";

export default function SettingsStorage() {
    const [isLoaded, setIsLoaded] = useState(false)

    const User = useContext(UserContext)

    const subPage = useSelector((state) => state.ui.subPage)
    const darkMode = useSelector((state) => state.settings.darkMode)
    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const dispatch = useDispatch()

    const getSubPageLayout = useCallback(() => {
        switch (subPage[1]?.page) {
            case 'StorageUsage':
                return <SettingsStorageUsage />
            default:
                break;
        }
    }, [subPage])

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    return <>
        <div className={buildClassName("SettingsStorage", !isLoaded && 'fadeThrough', subPage[1] && 'pushUp')}>
            <PageHeader>
                <div><BackArrow index={1} onClick={() => PageClose(dispatch, true)} isiOS={centerTopBar} /></div>
                <div className="Title"><span>Storage</span></div>
                <div className="Meta"></div>
            </PageHeader>
            <div className="section">
                <div className="Items">
                    <div className="Item" onClick={() => PageHandle(dispatch, 'StorageUsage', 'Storage Usage', true)}><Icon name="data_usage" /><span>Storage Usage</span></div>
                </div>
            </div>
        </div>
        <Transition state={subPage[1]}><SubPage>{getSubPageLayout()}</SubPage></Transition>
    </>
}