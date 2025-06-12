import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHandle, PageHeader, SubPage } from "../../Page";
import { BackArrow, CheckBox, Icon, Item, Switch } from "../../common";
import { UserContext } from "../../../Auth/Auth";
import { Slider } from "@mui/material";
import Message from "../../Message";
import SettingsAnimations from "./Animations";
import Transition from "../../Transition";
import buildClassName from "../../../Util/buildClassName";
import SettingsThemes from "./Themes";
import { handleToggleDarkMode } from "../../../Stores/Settings";
import { chartsToolbarClasses, pieArcLabelClasses, PieChart } from "@mui/x-charts";
import { formatBytes } from "../../Message/MessageMedia";
import TextTransition from "../../../common/TextTransition";
import { handleDialog } from "../../../Stores/UI";

export default function SettingsStorageUsage() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [data, setData] = useState([])
    const [totalSize, setTotalSize] = useState(0)

    const subPage = useSelector((state) => state.ui.subPage)
    const darkMode = useSelector((state) => state.settings.darkMode)
    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const dispatch = useDispatch()

    const entireTotalSize = useRef()

    // const getSubPageLayout = useCallback(() => {
    //     switch (subPage[1]?.page) {
    //         case 'StorageUsage':
    //             return <SettingsAnimations />
    //         default:
    //             break;
    //     }
    // }, [subPage])

    const calculateCacheSize = async () => {
        let photoSize = 0
        let videoSize = 0
        let documentSize = 0
        let avatarSize = 0
        let stickerSize = 0
        let musicSize = 0
        let miscellaneousSize = 0

        function cacheSize(c) {
            var type = ''
            return c.keys().then(a => {
                return Promise.all(
                    a.map(req =>
                        c.match(req).then(res =>
                            res.clone().blob().then(b => {
                                type = req.url.split(`${window.location.origin}/`)[1]
                                if (type.startsWith('Video')) videoSize += b.size
                                else if (type.startsWith('Photo')) photoSize += b.size
                                else if (type.startsWith('Document')) documentSize += b.size
                                else if (type.startsWith('avatar')) avatarSize += b.size
                                else if (type.startsWith('Sticker') ||
                                    type.startsWith('CustomEmoji')) stickerSize += b.size
                                else if (type.startsWith('Music')) musicSize += b.size
                                else miscellaneousSize += b.size

                                return
                            })

                        ))
                ).then(() => true);
            });
        }

        function cachesSize() {
            return caches.keys().then(a => {
                return Promise.all(
                    a.map(n => caches.open(n).then(c => cacheSize(c)))
                ).then(() => true);
            });
        }

        await cachesSize()

        return {
            photos: photoSize,
            videos: videoSize,
            document: documentSize,
            avatar: avatarSize,
            sticker: stickerSize,
            music: musicSize,
            miscellaneous: miscellaneousSize,
        }
    }

    const finalData = useMemo(() => {
        const final = data.filter(item => item.checked && item.value > 0)

        if (final?.length > 1)
            setTotalSize(final.reduce((p, c) => p + c.value, 0))
        else
            setTotalSize(final[0]?.value)

        return final
    }, [data])

    useEffect(() => {
        setIsLoaded(true);

        (async () => {
            const sizes = await calculateCacheSize()

            entireTotalSize.current = Object.values(sizes).reduce((p, c) => p + c, 0)

            let cache = [{
                label: 'Photos',
                value: sizes.photos,
                color: '#5CAFFA',
                checked: true
            },
            {
                label: 'Videos',
                value: sizes.videos,
                color: '#408ACF',
                checked: true
            },
            {
                label: 'Documents',
                value: sizes.document,
                color: '#46BA43',
                checked: true
            },
            {
                label: 'Profile Photos',
                value: sizes.avatar,
                color: '#3A005E',
                checked: true
            },
            {
                label: 'Stickers & Emoji',
                value: sizes.sticker,
                color: '#F68136',
                checked: true
            },
            {
                label: 'Music',
                value: sizes.music,
                color: '#6C61DF',
                checked: true
            },
            {
                label: 'Miscellaneous',
                value: sizes.miscellaneous,
                color: '#6C61DF',
                checked: true
            }]

            cache = cache.filter(item => item.value > 0).sort((a, b) => b.value - a.value)

            setData(cache)
        })()
    }, [])

    return <>
        <div className={buildClassName("SettingsStorageUsage", !isLoaded && 'fadeThrough', subPage[2] && 'pushUp')}>
            <PageHeader>
                <div><BackArrow index={2} onClick={() => PageClose(dispatch, true)} isiOS={centerTopBar} /></div>
                <div className="Title"><span>Storage Usage</span></div>
                <div className="Meta"></div>
            </PageHeader>
            <div className="section StorageUsage">
                <div className="Chart">
                    <PieChart
                        series={[
                            {
                                arcLabel: (item) => `${Math.round(item.value / totalSize * 100)}%`,
                                arcLabelMinAngle: 25,
                                innerRadius: 50,
                                paddingAngle: 1,
                                highlightScope: { highlight: 'item', fade: 'global' },
                                data: finalData,
                                valueFormatter: (item) => formatBytes(item.value, 1)
                            },
                        ]}
                        sx={{
                            [`& .${pieArcLabelClasses.root}`]: {
                                fontWeight: '500',
                            }
                        }}
                        hideLegend
                        width={180}
                        height={180}
                    />
                    <div className="Content">
                        <div className="title"><TextTransition text={formatBytes(totalSize, 1, true).size} /></div>
                        <div className="subtitle">{formatBytes(totalSize, 1, true).type}</div>
                    </div>
                </div>
                <div className="title" style={{
                    color: 'var(--dyn-text-color)',
                    fontSize: 20,
                    fontWeight: '500',
                    textAlign: 'center',
                    marginBlock: 8,
                    textTransform: 'none'
                }}>Storage Usage</div>
                <div className="Items">
                    {data.map(item => <Item key={'storageItem' + item.label} unchangeable={finalData.length <= 1 && item.checked} onClick={() =>
                        setData(prev => prev.map(i =>
                            i.label === item.label
                                ? { ...i, checked: !item.checked }
                                : i
                        ))}>
                        <CheckBox style={{ '--accent-color': item.color }} checked={item.checked} />
                        <span>{item.label} <span style={{ fontSize: 14 }}>{Math.round(item.value / entireTotalSize.current * 100)}%</span></span>
                        <div className="meta">{formatBytes(item.value, 1)}</div>
                    </Item>)}
                    <div className="Button" onClick={() => dispatch(handleDialog({ type: 'clearCache', onClearCache: () => { } }))}>
                        <div className="title">Clear Cache <TextTransition text={formatBytes(totalSize, 1)} style={{ fontSize: 14, color: '#fffa' }} /></div>
                    </div>
                </div>
            </div>
        </div>
        {/* <Transition state={subPage[1]}><SubPage>{getSubPageLayout()}</SubPage></Transition> */}
    </>
}