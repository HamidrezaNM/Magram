import { createPortal } from "react-dom"
import Transition from "../App/Transition"
import { memo, useEffect, useRef, useState } from "react"

function Modal({ open, onClose, title, children }) {
    const [portal, setPortal] = useState(false)

    const ref = useRef()
    const dragger = useRef()

    const app = document.querySelector('.App')

    useEffect(() => {
        console.log('Modal Toggled', open)
        if (open) {
            setPortal(true)
        }
        app.classList.toggle('hasModal', open)
    }, [open])

    const handleClose = () => {
        requestAnimationFrame(() => {
            ref.current.style = ""
            app.querySelector('.Home').style.transform = ""
            app.querySelector('.Home').style.transition = ""
        })
        onClose()
    }

    const handleDragModal = () => {
        let startY = 0, scrollTop = 0, height = 0;
        let rafId = null

        // height = dragger.current.clientHeight
        // dragger.current.scrollTop = height

        ref.current.addEventListener("touchstart", (e) => {
            startY = e.touches[0].pageY;
            scrollTop = ref.current.scrollTop;
            height = ref.current.clientHeight;
            ref.current.style.transition = 'none';
            app.querySelector('.Home').style.transition = 'transform .1s ease';
        }, { passive: true });

        ref.current.addEventListener("touchmove", (e) => {
            const currentY = e.touches[0].pageY;
            const diff = currentY - startY;

            if (diff < 0 || ref.current.scrollTop > 0 || ref.current.querySelector('.scrollable').scrollTop > 0) return

            if (!rafId)
                requestAnimationFrame(() => {
                    ref.current.style.transform = `translate3d(0, ${diff}px, 0)`;
                    app.querySelector('.Home').style.transform = `scale(calc(.9 + ${diff / height * .1})) translateY(${24 * (.5 - diff / height)}px)`;

                    rafId = null
                })
        });

        ref.current.addEventListener("touchend", (e) => {
            const currentY = e.changedTouches[0].pageY;
            const diff = scrollTop > 0 ? 0 : currentY - startY;

            if (diff / height > .1) {
                handleClose()
                return
            }

            ref.current.style.transition = "transform 0.3s ease";
            app.querySelector('.Home').style.transition = "transform 0.3s ease";

            requestAnimationFrame(() => {
                ref.current.style.transform = 'translate3d(0, 0px, 0)'
                app.querySelector('.Home').style.transform = 'scale(.9) translateY(12px)'
            })
            setTimeout(() => {
                ref.current.style.transition = "";
                app.querySelector('.Home').style.transition = "";
            }, 300);
        });
    }

    const handleScrollDebounce = () => {
        const scrollTop = dragger.current.scrollTop
        const height = dragger.current.clientHeight

        console.log('scroll debounce', scrollTop)

        if (scrollTop / height > .75) {
            dragger.current.scrollTop = height

            setTimeout(() => {
                dragger.current.scrollTop = height
            }, 200);
        } else {
            dragger.current.scrollTop = 0
            setTimeout(() => {
                handleClose()
            }, 200);
        }
    }

    return portal && createPortal(<Transition state={open} eachElement action={() => setPortal(false)} activeAction={handleDragModal}>
        {/* <div className="Dragger" ref={dragger} onTouchEnd={handleScrollDebounce}> */}
        <div className="bg animate" onClick={handleClose}></div>
        <div className="Modal animate" ref={ref}>
            <div className="TopBar">
                <div><button onClick={handleClose}>Cancel</button></div>
                {title && <div className="Content">
                    <span>{title}</span>
                </div>}
                <div className="Meta"></div>
            </div>
            <div className="Content">
                {children}
            </div>
        </div>
        {/* </div> */}
    </Transition>, app)
}

export default memo(Modal)