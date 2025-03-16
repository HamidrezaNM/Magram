import { Children } from "react";

export default function Dialog({ children }) {
    return <div className="Dialog">
        <div>
            {Children.map(children, (child) => {
                if (child.type === 'DialogTitle') {
                    <>{child}</>
                }
            })}
        </div>
        <div>
            {/* <div className="button primary" onClick={primaryBtn.action}>{primaryBtn.text}</div> */}
            {/* <div className="button secondary" onClick={secondaryBtn.action}>{secondaryBtn.text}</div> */}
        </div>
    </div>
}

export function DialogTitle({ children }) {
    return <div className="title">{children}</div>
}

export const typeOfComponent = component =>
    component?.props?.__TYPE ||
    component?.type?.toString().replace('Symbol(react.fragment)', 'react.fragment') ||
    undefined;

export const getChildrenByType = (children, types) =>
    Children.toArray(children).filter(child => types.indexOf(typeOfComponent(child)) !== -1);