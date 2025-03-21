import { useContext, useEffect, useRef, useState } from "react";
import { AuthComplete, AuthContext } from "./Auth";
import { client, socket } from "../../App";

export default function Password() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false)

    const passwordTextField = useRef();

    const Auth = useContext(AuthContext);

    const Password = async e => {
        e.preventDefault()
        try {
            setIsLoading(true)
            await client.signInWithPassword(
                {
                    apiId: 22692190,
                    apiHash: 'd392a9a3f167823d8c42aaa77270c0be',
                },
                {
                    password: () => password,
                    onError: (err) => {
                        console.log('SignIn Failed', err)
                        return true
                    },
                }
            );

            await client.sendMessage('me', { message: "You're successfully logged in!" });

            const session = client.session.save()

            AuthComplete(Auth, session)
        } catch (error) {
            console.dir(error)
        }
    }

    return <div className="Password">
        <form action="" onSubmit={Password}>
            <div className="content">
                <div className="title">Enter Password</div>
                <p className="subtitle">
                    Your account is protected with password, so enter the password to be
                    verified
                </p>
                <div className="textfield" ref={passwordTextField}>
                    <input
                        placeholder=" "
                        type="password"
                        value={password}
                        onChange={(e) => {
                            if (passwordTextField.current.classList.contains("error")) {
                                passwordTextField.current.querySelector("label").innerHTML =
                                    "Password";
                                passwordTextField.current.classList.remove("error");
                            }
                            setPassword(e.target.value);
                        }}
                    />
                    <label>Password</label>
                </div>
            </div>
            <button type="submit" className={isLoading ? "Loading" : ''}>Next</button>
        </form>
    </div>
}