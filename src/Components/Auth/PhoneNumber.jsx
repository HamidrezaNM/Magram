import { useState, useContext, useCallback, useRef } from "react";
import { AuthContext } from "./Auth";
import { API_HASH, API_ID, client } from "../../App";
import { Api } from "telegram";

export default function PhoneNumber() {
    const [countryCode, setCountryCode] = useState("98");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("+98");
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
        setFormattedPhoneNumber(_format);
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
        } else {
            phoneNumberRef.current.querySelector("label").innerHTML =
                "Invalid Phone number";
            phoneNumberRef.current.classList.add("error");
        }

    }

    async function sendCodeHandler() {
        await client.connect() // Connecting to the server

        return await client.sendCode({
            apiId: Number(API_ID),
            apiHash: API_HASH
        }, countryCode + phoneNumber);
    }

    return <div className="PhoneNumber">
        <form action="" onSubmit={Validate}>
            <div className="content">
                <div className="title">Sign in to Magram</div>
                <p className="subtitle">
                    Please confirm your country and enter your phone number
                </p>
                <div className="textfield" ref={phoneNumberRef}>
                    <input
                        placeholder=" "
                        type="text"
                        value={formattedPhoneNumber}
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