import { memo, useContext, useEffect } from "react"
import { ChatContext } from "./ChatContext"
import { useDispatch, useSelector } from "react-redux"
import { handlePage, handlePageAndSubPage, handlePageClose, handlePageHeader, handleSubPage, handleSubPageClose, handleTopbarTitleChange } from "../Stores/UI"
import { Menu } from "@mui/material";
import DropdownMenu from "../UI/DropdownMenu";

function Page({ children }) {
    return <div className="Page scrollable">
        {children}
    </div>
}

export default memo(Page)

export function SubPage({ children }) {
    return <div className="SubPage scrollable">
        {children}
    </div>
}

export function ShowPage({ title, page }) {
    const Chat = useContext(ChatContext)

    Chat.setPageTitle(title)
    Chat.setPage(page)
}

export function PageHeader({ children }) {
    const dispatch = useDispatch()

    const showPage = useSelector((state) => state.ui.showPage)
    const subPage = useSelector((state) => state.ui.subPage)

    useEffect(() => {
        dispatch(handlePageHeader(children))
    }, [])

    useEffect(() => {
        if (!subPage[0])
            dispatch(handlePageHeader(children))
    }, [showPage, subPage])
    return <></>
}

export function PageClose(dispatch, subPage = false) {
    document.querySelector('.TopBar .Title').style.animation = 'changeTitle .5s ease-in-out'
    if (subPage)
        dispatch(handleSubPageClose())
    else
        dispatch(handlePageClose())
    setTimeout(() => {
        dispatch(handleTopbarTitleChange())
    }, 250);
    setTimeout(() => {
        document.querySelector('.TopBar .Title').style = ''
    }, 500);
}

export function PageHandle(dispatch, page, title, subPage = false, data = null, PageHandle = null) {
    if (document.querySelector('.TopBar .Menu .icon')) document.querySelector('.TopBar .Menu .icon').style.animation = '0.3s ease-in-out 0s 1 normal none running menuToBack1'
    document.querySelector('.TopBar .Title').style.animation = 'changeTitle .5s ease-in-out'
    document.querySelectorAll('.TopBar .Meta>*').forEach((element) => {
        element.style.transform = 'scale(.8)'
    })
    setTimeout(() => {
        if (!PageHandle) {
            if (subPage)
                dispatch(handleSubPage({ page, data }))
            else
                dispatch(handlePage(page))
        } else
            dispatch(handlePageAndSubPage({ page: PageHandle, subPage: page }))
        dispatch(handleTopbarTitleChange(title))
        document.querySelectorAll('.TopBar .Meta>*').forEach((element) => {
            element.style.transform = ''
        })
    }, 150);
    setTimeout(() => {
        document.querySelector('.TopBar .Title').style = ''
    }, 500);
}