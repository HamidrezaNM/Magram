import { useState, useContext, useCallback, useRef } from "react";
import { AuthContext } from "./Auth";
import { client, socket } from "../../App";
import { Api } from "telegram";

export default function PhoneNumber() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [formatedPhoneNumber, setFormatedPhoneNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const Auth = useContext(AuthContext);
    const phoneNumberRef = useRef();

    const phoneNumberHandler = (e) => {
        const value = e.target.value;
        // Remove all non-digit and non-plus characters
        const cleanNumber = value.replace(/[^+\d]/g, "");
        
        // Format the number with spaces after country code and in groups of 3
        let formattedNumber = cleanNumber;
        if (cleanNumber.startsWith('+')) {
            // If number starts with +, add spaces after country code (assuming 1-3 digits)
            const matches = cleanNumber.match(/^\+(\d{1,3})(\d+)$/);
            if (matches) {
                const [_, countryCode, rest] = matches;
                // Format remaining numbers in groups of 3
                const formatted = rest.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
                formattedNumber = `+${countryCode} ${formatted}`;
            }
        } else if (cleanNumber.length > 0) {
            // If no +, add it and format
            formattedNumber = '+' + cleanNumber.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
        }

        setFormatedPhoneNumber(formattedNumber);
        // Store clean number without spaces and plus
        setPhoneNumber(cleanNumber.replace(/[^0-9]/g, ''));
    };

    const Validate = async e => {
        e.preventDefault();

        // Extract country code and phone number
        const matches = formatedPhoneNumber.match(/^\+(\d{1,3})([\d\s]+)$/);
        
        if (matches && phoneNumber.length >= 5) {  // Ensure minimum length of total number
            setIsLoading(true);
            const countryCode = matches[1];
            const phoneWithoutCode = phoneNumber.slice(countryCode.length);
            
            try {
                const sendCode = await sendCodeHandler(countryCode, phoneWithoutCode);
                Auth.setAuthPhoneNumber(phoneWithoutCode);
                Auth.setAuthCountryCode(countryCode);
                Auth.setAuthPhoneCodeHash(sendCode.phoneCodeHash);
                Auth.setAuthState('authorizationStateWaitCode');
            } catch (error) {
                phoneNumberRef.current.querySelector("label").innerHTML = "Failed to send code";
                phoneNumberRef.current.classList.add("error");
                setIsLoading(false);
            }
        } else {
            phoneNumberRef.current.querySelector("label").innerHTML = "Invalid phone number";
            phoneNumberRef.current.classList.add("error");
        }
    };

    async function sendCodeHandler(countryCode, phoneNumber) {
        await client.connect(); // Connecting to the server
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
