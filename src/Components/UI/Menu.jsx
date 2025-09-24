import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { Icon } from "../App/common"
import { useDispatch } from "react-redux"
import { handleBackground } from "../Stores/UI"
import Transition from "../App/Transition"

const Menu = forwardRef(({ icon, animateWidth = true, animateHeight = true, minHeight = 36, closeManually = false, custom, children }, ref) => {
    const menu = useRef()
    const [isActive, setIsActive] = useState()

    const bg = useRef()

    const dispatch = useDispatch()

    useEffect(() => {
        menu.current.querySelector('.icon').style.zIndex = isActive ? 12 : null
        menu.current.style.zIndex = isActive ? 12 : null
        if (!isActive) return
        // setTimeout(() => {
        //     bg.current.classList.remove('animate')
        // }, 0);

    }, [isActive])

    useEffect(() => {
        if (custom) {
            menu.current.querySelector('.Item').onclick = handleOpenMenu
        }
    }, [custom])

    const activeAction = () => {
        let w = menu.current.querySelector('.DropdownMenu').clientWidth
        let h = menu.current.querySelector('.DropdownMenu').clientHeight

        if (!closeManually) {
            menu.current.querySelectorAll('.MenuItem').forEach(item => item.onclick = handleCloseMenu)
        }

        menu.current.querySelector('.DropdownMenu').classList.add('animate')
        setTimeout(() => {
            menu.current.querySelector('.DropdownMenu').classList.remove('animate')
        }, 5);
        if (animateWidth) {
            menu.current.querySelector('.DropdownMenu').style.minWidth = 36 + 'px';
            menu.current.querySelector('.DropdownMenu').style.width = 36 + 'px';
        }
        if (animateHeight) menu.current.querySelector('.DropdownMenu').style.height = minHeight + 'px';

        requestAnimationFrame(() => {
            setTimeout(() => {
                if (animateWidth) menu.current.querySelector('.DropdownMenu').style.width = w + 'px'
                if (animateHeight) menu.current.querySelector('.DropdownMenu').style.height = h + 'px'
            }, 40);
            setTimeout(() => {
                if (animateHeight) menu.current.querySelector('.DropdownMenu').style.height = ''
            }, 200);
        });
    }

    useImperativeHandle(ref, () => ({
        handleOpenMenu() {
            handleOpenMenu()
        },
        handleCloseMenu() {
            handleCloseMenu()
        }
    }))

    const handleOpenMenu = () => {
        setIsActive(!isActive)
    }

    const handleCloseMenu = () => {
        setIsActive(false)
    }

    return (<>
        <Transition state={isActive}>
            <div ref={bg} className="bg animate" onClick={handleOpenMenu}></div>
        </Transition>
        <div className="Menu" ref={menu}>
            {icon && <Icon name={icon} onClick={handleOpenMenu} />}
            {custom}
            {/* {isActive ? children : null} */}
            <Transition state={isActive} activeAction={activeAction}>
                {children}
            </Transition>
        </div>
    </>)
})

export default Menu