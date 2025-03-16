import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./Auth";
import { client, socket } from "../../App";

export default function Password() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false)

    const passwordTextField = useRef();

    const Auth = useContext(AuthContext);

    function userAuthParamCallback(param) {
        return async function () {
            return await new (resolve => {
                resolve(param)
            })()
        }
    }

    const Password = async e => {
        e.preventDefault()
        try {
            await client.signInWithPassword(
                {
                    apiId: 22692190,
                    apiHash: 'd392a9a3f167823d8c42aaa77270c0be',
                },
                {
                    password: password,
                    onError: (err) => {
                        console.log(err)
                    },
                }
            );
            await client.sendMessage('me', { message: "You're successfully logged in!" });

            // await client.sendMessage('me', { message: "You're successfully logged in!" })
        } catch (error) {
            console.dir(error)
            // Error handling logic
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