import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHeader } from "../Page";
import { BackArrow, Profile } from "../common";
import ContentEditable from "../../common/WrappedContentEditable";
import { client } from "../../../App";
import { viewChat } from "../ChatList";
import { Api } from "telegram";
import { generateChatWithPeer, getChatSubtitle } from "../../Helpers/chats";
import { handleCoolDown } from "../../Util/coolDown";
import Tabs from "../../UI/Tabs";
import TabContent from "../../UI/TabContent";
import buildClassName from "../../Util/buildClassName";
import { handleTopPeers } from "../../Stores/Settings";


export default function Search() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [input, setInput] = useState('')
    // const [topPeers, setTopPeers] = useState([])
    const [chats, setChats] = useState([])
    const [tabIndex, setTabIndex] = useState(0)

    const dispatch = useDispatch()

    const page = useRef()
    const inputRef = useRef()
    const placeholderRef = useRef()

    const subPage = useSelector((state) => state.ui.subPage)
    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)
    const topPeers = useSelector((state) => state.settings.topPeers)

    useEffect(() => {
        setIsLoaded(true)
        setTimeout(() => {
            inputRef.current.querySelector('.InputField').focus()
        }, 200);

        (async () => {
            const now = Date.now();
            const diff = now - topPeers?.date;

            if (!topPeers?.users?.length || (diff > 0 && diff > 60 * 60 * 1000)) {
                console.log('GetTopPeers')

                const result = await client.invoke(new Api.contacts.GetTopPeers({
                    correspondents: true,
                    botsApp: false,
                    botsInline: false,
                    botsPm: false,
                    channels: false,
                    forwardChats: false,
                    forwardUsers: false,
                    groups: false,
                    limit: 5
                }))

                dispatch(handleTopPeers(result.users))
            }
        })()
    }, [topPeers])

    const changeInputHandler = useCallback(async e => {
        var value = e.target ? e.target.value : e;

        setInput(value);

        if (value !== "") {
            if (value.length >= 3) {
                const action = async () => {
                    const result = await client.invoke(new Api.contacts.Search({
                        q: value,
                        limit: 6
                    }))
                    console.log(result)
                    setChats([...result.chats, ...result.users])
                }

                handleCoolDown(action)
            }

            placeholderRef.current
                .classList.add("hidden");
        } else {
            placeholderRef.current
                .classList.remove("hidden");
        }
    }, [input]);

    const handleMessageInput = useCallback(() => {
        // setMessageInputHandled(input)
    }, [input])

    return <>
        <div className={"Search" + (!isLoaded ? ' fadeThrough' : '') + (subPage[0] ? ' pushUp' : '')} ref={page}>
            <PageHeader>
                <div><BackArrow index={0} onClick={() => PageClose(dispatch)} isiOS={centerTopBar} /></div>
                <div className="Content"><span>Search</span></div>
                <div className="Meta"></div>
            </PageHeader>
            <div className="section">
                <div className="Item Input" ref={inputRef}>
                    <ContentEditable
                        dir="auto"
                        className="InputField"
                        html={input} // innerHTML of the editable div
                        disabled={false}       // use true to disable editing
                        onChange={changeInputHandler} // handle innerHTML change
                        onBlur={handleMessageInput}
                        tagName='span' // Use a custom HTML tag (uses a div by default)
                    />
                    <span className="placeholder" style={{ paddingLeft: 28 }} ref={placeholderRef}>Search</span>
                </div>
                <div className="topPeers">
                    {topPeers?.users?.length > 0 && Object.values(topPeers.users).map((item) => (
                        !item.self && <div key={item.id?.value} className="Item" onClick={() => { viewChat(generateChatWithPeer(item), dispatch); PageClose(dispatch) }}>
                            <Profile entity={item} size={54} name={item?.title ?? item?.firstName} id={Number(item.id)} />
                            <div className="title">{item?.title ?? item.firstName ?? 'Deleted Account'}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="section TabSection">
                <Tabs index={tabIndex} setIndex={setTabIndex} tabs={<div
                    className={buildClassName("Tab", tabIndex === 0 && 'active')}
                    onClick={() => setTabIndex(0)}>
                    <span>Chats</span>
                </div>
                }>
                    <TabContent state={true}>
                        <div className="Items">
                            {/* TODO: Search History */}
                            {chats.length > 0 && Object.values(chats).map((item) => (
                                !item.self && <div key={item.id?.value} className="Item" onClick={() => { viewChat(generateChatWithPeer(item), dispatch); PageClose(dispatch) }}>
                                    <Profile entity={item} size={44} name={item?.title ?? item?.firstName} id={item.id?.value} />
                                    <div className="UserDetails">
                                        <div className="title">{item?.title ?? item.firstName}</div>
                                        <div className="subtitle">{getChatSubtitle(item)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabContent>
                </Tabs>
            </div>
        </div >
    </>
}