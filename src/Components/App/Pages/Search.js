import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext, UserContext } from "../../Auth/Auth";
import { PageClose, PageHandle, PageHeader, SubPage } from "../Page";
import { Icon, Profile } from "../common";
import DropdownMenu from "../../UI/DropdownMenu";
import MenuItem from "../../UI/MenuItem";
import Transition from "../Transition";
import { ChatContext } from "../ChatContext";
import Menu from "../../UI/Menu";
import { showUserProfile } from "./UserProfile";
import ManageGroup from "./ManageGroup/Manage";
import ContentEditable from "../../common/WrappedContentEditable";
import { client, socket } from "../../../App";
import { viewChat } from "../ChatList";
import { getChatData } from "../Chat";
import { Api } from "telegram";
import { generateChatWithPeer, getChatSubtitle } from "../../Helpers/chats";
import { handleCoolDown } from "../../Util/coolDown";


export default function Search() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [input, setInput] = useState('')
    const [chats, setChats] = useState([])

    const Auth = useContext(AuthContext)

    const dispatch = useDispatch()

    const page = useRef()
    const inputRef = useRef()
    const placeholderRef = useRef()

    const subPage = useSelector((state) => state.ui.value.subPage)

    useEffect(() => {
        setIsLoaded(true)
        setTimeout(() => {
            inputRef.current.querySelector('.InputField').focus()
        }, 200);
    }, [])

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
                <div><Icon name="arrow_back" className="backBtn" onClick={() => PageClose(dispatch)} /></div>
                <div className="Title"><span>Search</span></div>
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
            </div>
            <div className="section">
                <div className="Tabs">
                    <div className="Tab active"><span>Chats</span></div>
                </div>
                <div className="Items">
                    {chats.length > 0 && Object.values(chats).map((item) => (
                        <div key={item.id?.value} className="Item" onClick={() => { viewChat(generateChatWithPeer(item), dispatch); PageClose(dispatch) }}>
                            <Profile entity={item} size={44} name={item?.title} id={item.id?.value} />
                            <div className="UserDetails">
                                <div className="title">{item?.title ?? item.firstName}</div>
                                <div className="subtitle">{getChatSubtitle(item)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    </>
}