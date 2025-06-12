import { Children } from "react";
import Transition from "../App/Transition";
import buildClassName from "../Util/buildClassName";

export default function Dialog({ children, state, onClose }) {
    return <Transition state={state} eachElement>
        <div className="bg animate" style={{ backgroundColor: '#00000050' }} onClick={onClose}></div>
        <div className="Dialog">
            {children}
            {/* <div className="button primary" onClick={primaryBtn.action}>{primaryBtn.text}</div> */}
            {/* <div className="button secondary" onClick={secondaryBtn.action}>{secondaryBtn.text}</div> */}
        </div>
    </Transition>
}

export function DialogTitle({ children }) {
    return <div className="title">{children}</div>
}

export function DialogContent({ children }) {
    return <div className="Content">{children}</div>
}

export function DialogContentBody({ children }) {
    return <div className="body">{children}</div>
}

export function DialogButton({ children, onClick, className }) {
    return <div onClick={onClick} className={buildClassName("button", className)}>{children}</div>
}

export const typeOfComponent = component =>
    component?.props?.__TYPE ||
    component?.type?.toString().replace('Symbol(react.fragment)', 'react.fragment') ||
    undefined;

export const getChildrenByType = (children, types) =>
    Children.toArray(children).filter(child => types.indexOf(typeOfComponent(child)) !== -1);