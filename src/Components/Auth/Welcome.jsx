import { useContext } from "react";
import { AuthContext } from "./Auth";

export default function Welcome() {
    const Auth = useContext(AuthContext);

    return <div className="Welcome">
        <div className="content">
            <div className="title">Welcome to Magram</div>
            <p>A user friendly app for chat with your friends with beautiful design</p>
        </div>
        <button onClick={() => { Auth.setAuthState("authorizationStateWaitPhoneNumber"); }}>Get Started</button>
    </div>
}