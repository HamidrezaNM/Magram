import { useState, useContext, useCallback, useRef } from "react";
import { AuthContext } from "./Auth";
import { API_HASH, API_ID, client } from "../../App";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export default function PhoneNumber() {
    const [countryCode, setCountryCode] = useState("98");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("+98");
    const [isLoading, setIsLoading] = useState(false)

    const Auth = useContext(AuthContext);

    const phoneNumberRef = useRef()

    const phoneNumberHandler = (e) => {
        var value = e.target.value;

        const result = parsePhoneNumberFromString(value);

        setFormattedPhoneNumber(result?.formatInternational() || value);
        setPhoneNumber(result?.nationalNumber || "");
        setCountryCode(result?.countryCallingCode || "")
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