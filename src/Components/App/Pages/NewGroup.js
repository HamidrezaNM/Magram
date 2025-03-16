import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext, UserContext } from "../../Auth/Auth";
import { Icon, Profile } from "../common";
import './NewGroup.css';
import { PageClose, PageHeader, pageClose } from "../Page";
import DropdownMenu from "../../UI/DropdownMenu";
import Menu from "../../UI/Menu";
import MenuItem from "../../UI/MenuItem";
import { useDispatch } from "react-redux";
import { socket } from "../../../App";

export default function NewGroup() {
    const [firstname, setFirstname] = useState('')
    const [username, setUsername] = useState('')
    const [bio, setBio] = useState('')

    const dispatch = useDispatch()
    const User = useContext(UserContext)
    const Auth = useContext(AuthContext)

    useEffect(() => {
        setTimeout(() => {
            if (document.querySelector('.fadeThrough'))
                document.querySelector('.fadeThrough').classList.remove('fadeThrough')
        }, 100);
    }, [])

    useEffect(() => {
        console.log(firstname)
    }, [firstname])

    const createGroup = useCallback(() => {
        if (!firstname || firstname === null || firstname === '') return false;
        const group = {
            firstname,
            username,
            bio,
            profile: []
        }
        socket.emit('CreateGroup', { token: Auth.authJWT, ...group })
        socket.on('CreateGroup', (response) => {
            if (response.ok) {
                socket.off('CreateGroup')
            }
        })
    }, [firstname, username, bio])

    return <div className="NewGroup fadeThrough">
        <PageHeader key={firstname + username + bio}>
            <div><Icon name="arrow_back" className="backBtn" onClick={() => PageClose(dispatch)} /></div>
            <div className="Title"><span>New Group</span></div>
            <div className="Meta">
                <button onClick={() => createGroup()}>Create</button>
            </div>
        </PageHeader>
        <div className="section">
            <div className="User">
                <Profile name={firstname} />
                <div className="textfield"><input type="text" value={firstname} onInput={(e) => setFirstname(e.target.value)} placeholder="Enter group name" /></div>
            </div>
            <div className="Items Info">
                <div className="Item"><Icon name="alternate_email" /><div className="textfield"><input type="text" value={username} onInput={(e) => setUsername(e.target.value)} placeholder="Username (Optional)" /></div></div>
                <div className="Item"><Icon name="info" /><div className="textfield"><input type="text" value={bio} onInput={(e) => setBio(e.target.value)} placeholder="Bio (Optional)" /></div></div>
            </div>
        </div>
    </div>
}