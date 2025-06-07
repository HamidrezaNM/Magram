import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHandle, PageHeader, SubPage } from "../../Page";
import { BackArrow, CheckBox, Icon, Switch } from "../../common";
import { UserContext } from "../../../Auth/Auth";
import { Slider } from "@mui/material";
import Message from "../../Message";
import SettingsAnimations from "./Animations";
import Transition from "../../Transition";
import buildClassName from "../../../Util/buildClassName";
import SettingsThemes from "./Themes";
import { handleToggleDarkMode } from "../../../Stores/Settings";
import { pieArcLabelClasses, PieChart } from "@mui/x-charts";
import { formatBytes } from "../../Message/MessageMedia";
import TextTransition from "../../../common/TextTransition";

export default function SettingsStorageUsage() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [data, setData] = useState([])
    const [totalSize, setTotalSize] = useState(0)
    // const [checkedData, setCheckedData] = useState({
    //     photos: { active: true },
    //     videos: { active: true }
    // })

    const subPage = useSelector((state) => state.ui.subPage)
    const darkMode = useSelector((state) => state.settings.darkMode)
    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const dispatch = useDispatch()

    const chart = useRef()

    // const getSubPageLayout = useCallback(() => {
    //     switch (subPage[1]?.page) {
    //         case 'StorageUsage':
    //             return <SettingsAnimations />
    //         default:
    //             break;
    //     }
    // }, [subPage])

    const calculateCacheSize = async () => {
        // returns approximate size of a single cache (in bytes)

        let photoSize = 0
        let videoSize = 0

        function cacheSize(c) {
            var type = ''
            return c.keys().then(a => {
                return Promise.all(
                    a.map(req =>
                        c.match(req).then(res =>
                            res.clone().blob().then(b => {
                                type = req.url.split(`${window.location.origin}/`)[1]
                                if (type.startsWith('Video')) videoSize += b.size
                                if (type.startsWith('Photo')) photoSize += b.size

                                return
                            })

                        ))
                ).then(() => true);
            });
        }

        // returns approximate size of all caches (in bytes)
        function cachesSize() {
            return caches.keys().then(a => {
                return Promise.all(
                    a.map(n => caches.open(n).then(c => cacheSize(c)))
                ).then(() => true);
            });
        }

        const size = await cachesSize()

        console.log('photo cache size', photoSize)
        console.log('video cache size', videoSize)

        return {
            photos: photoSize,
            videos: videoSize
        }
    }

    const finalData = useMemo(() => {
        const final = data.filter(item => item.checked)

        if (final?.length > 1)
            setTotalSize(Object.values(final).reduce((p, c) => p.value + c.value))
        else
            setTotalSize(final[0]?.value)

        return final
    }, [data])

    useEffect(() => {
        setIsLoaded(true);

        (async () => {
            const sizes = await calculateCacheSize()
            const total = Object.values(sizes).reduce((p, c) => p + c)
            console.log('sizes', total)

            setData([{
                label: 'Photos',
                value: sizes.photos,
                color: '#408ACF',
                checked: true,
                percent: Math.round(sizes.photos / total * 100)
            },
            {
                label: 'Videos',
                value: sizes.videos,
                color: '#5CAFFA',
                checked: true,
                percent: Math.round(sizes.videos / total * 100)
            }])
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
                                arcLabel: (item) => `${item.percent}%`,
                                // arcLabelMinAngle: 35,
                                // arcLabelRadius: '60%',
                                innerRadius: 50,
                                paddingAngle: 1,
                                data: finalData,
                            },
                        ]}
                        sx={{
                            [`& .${pieArcLabelClasses.root}`]: {
                                fontWeight: '500',
                            },
                        }}
                        hideLegend
                        width={180}
                        height={180}
                    />
                    <div className="Content">
                        <div className="title"><TextTransition text={formatBytes(totalSize, 2, true).size} /></div>
                        <div className="subtitle">{formatBytes(totalSize, 2, true).type}</div>
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
                    {data.map(item => <div className="Item" key={'storageItem' + item.label} onClick={() => { }}>
                        <CheckBox style={{ '--accent-color': item.color }} checked={item.checked} setChecked={(checked) =>
                            setData(prev => prev.map(i =>
                                i.label === item.label
                                    ? { ...i, checked }
                                    : i
                            ))} />
                        <span>{item.label}</span>
                        <div className="meta">{formatBytes(item.value)}</div>
                    </div>)}
                </div>
            </div>
        </div>
        {/* <Transition state={subPage[1]}><SubPage>{getSubPageLayout()}</SubPage></Transition> */}
    </>
}