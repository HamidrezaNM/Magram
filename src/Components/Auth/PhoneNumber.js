import { useState, useContext, useCallback, useRef } from "react";
import { AuthContext } from "./Auth";
import { client, socket } from "../../App";
import { Api } from "telegram";

export default function PhoneNumber() {
    const [countryCode, setCountryCode] = useState("98");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [formatedPhoneNumber, setFormatedPhoneNumber] = useState("+98");
    const [isLoading, setIsLoading] = useState(false)

    const Auth = useContext(AuthContext);

    const phoneNumberRef = useRef()

    const phoneNumberHandler = (e) => {
        var value = e.target.value;

        var matches = value
            .replace(/[^+\d]/g, "")
            .match(/(\+?)(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})/);

        var _format = "";

        for (let i = 1; i < matches.length; i++) {
            const match = matches[i];

            i === 1
                ? (_format = "+")
                : match !== "" && (_format = _format + (i > 2 ? " " : "") + match);
        }
        setFormatedPhoneNumber(_format);
        setPhoneNumber(
            value
                .replace(/\D+/g, "")
                .replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "$2$3$4")
        );
        setCountryCode(
            value
                .replace(/\D+/g, "")
                .replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "$1"))
    }

    const Validate = async e => {
        e.preventDefault();

        if (countryCode.length > 0 && countryCode.length < 3 && phoneNumber.length === 10) {
            setIsLoading(true)
            const sendCode = await sendCodeHandler()

            Auth.setAuthPhoneNumber(phoneNumber)
            Auth.setAuthCountryCode(countryCode)
            Auth.setAuthPhoneCodeHash(sendCode.phoneCodeHash)
            Auth.setAuthState('authorizationStateWaitCode')
            // socket.on('ValidatePhoneNumber', (response) => {
            //     console.log(response)
            //     if (response.ok) {
            //     } else if (response.errorCode === 404) {
            //         Auth.setAuthPhoneNumber(phoneNumber)
            //         Auth.setAuthCountryCode(countryCode)
            //         Auth.setAuthState('Password')
            //     }
            // })
        } else {
            phoneNumberRef.current.querySelector("label").innerHTML =
                "Invalid Phone number";
            phoneNumberRef.current.classList.add("error");
        }

    }

    async function sendCodeHandler() {
        await client.connect() // Connecting to the server

        return await client.sendCode({
            apiId: 22692190,
            apiHash: 'd392a9a3f167823d8c42aaa77270c0be'
        }, countryCode + phoneNumber);
    }

    return <div className="PhoneNumber">
        <form action="" onSubmit={Validate}>
            <div className="content">
                <div className="title">Sign in to My App</div>
                <p className="subtitle">
                    Please confirm your country and enter your phone number
                </p>
                <div className="textfield" ref={phoneNumberRef}>
                    <input
                        placeholder=" "
                        type="text"
                        value={formatedPhoneNumber}
                        onChange={useCallback((e) => {
                            if (phoneNumberRef.current.classList.contains("error")) {
                                phoneNumberRef.current.querySelector("label").innerHTML =
                                    "Phone number";
                                phoneNumberRef.current.classList.remove("error");
                            }
                            phoneNumberHandler(e);
                        })}
                    />
                    <label>Phone number</label>
                </div>
            </div>
            <button type="submit" className={isLoading ? "Loading" : ''}>Next</button>
        </form>
    </div>;
}