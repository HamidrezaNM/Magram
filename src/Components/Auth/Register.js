import { useContext, useRef, useState } from "react";
import { AuthContext } from "./Auth";
import { socket } from "../../App";
import { DetectDevice, GetDeviceData } from "./Verify";

export default function Register() {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [isLoading, setIsLoading] = useState(false)

    const firstnameTextField = useRef();

    const Auth = useContext(AuthContext);

    const registerUserHandler = async e => {
        e.preventDefault()

        if (firstname !== "" && firstname !== null) {
            // let deviceData = await GetDeviceData(true);

            // socket.emit('RegisterUser', {
            //     phone: Auth.authPhoneNumber,
            //     countryCode: Auth.authCountryCode,
            //     verify: btoa(Auth.authPassword),
            //     firstname: firstname,
            //     lastname: lastname
            // }, { device: deviceData ?? 'Unknown' })

            // setIsLoading(true)

            // socket.on('RegisterUser', (response) => {
            //     setIsLoading(false)
            //     if (response.ok) {
            //         localStorage.setItem("auth_key", response.data);
            //         localStorage.setItem("authState", "Authorized");
            //         Auth.setAuthKey(response.data);
            //         Auth.setDevice(deviceData)
            //         Auth.setAuthState('VerifySession')
            //     } else {
            //         firstnameTextField.current.querySelector("label").innerHTML =
            //             "Something went wrong";
            //         firstnameTextField.current.classList.add("error");
            //     }
            // })
        } else {
            firstnameTextField.current.querySelector("label").innerHTML =
                "This field is required";
            firstnameTextField.current.classList.add("error");
        }
    };

    return (
        <div className="Register">
            <form action="" onSubmit={registerUserHandler}>
                <div className="content">
                    <div className="title">Choose a Name</div>
                    <p className="subtitle">
                        Choose a name for your account to identify you
                    </p>
                    <div className="textfield" ref={firstnameTextField}>
                        <input
                            placeholder=" "
                            type="text"
                            value={firstname}
                            onChange={(e) => {
                                firstnameTextField.current.querySelector("label").innerHTML =
                                    "First name";
                                firstnameTextField.current.classList.remove("error");
                                setFirstname(e.target.value);
                            }}
                        />
                        <label>First name</label>
                    </div>
                    <div className="textfield">
                        <input
                            placeholder=" "
                            type="text"
                            value={lastname}
                            onChange={(e) => {
                                setLastname(e.target.value);
                            }}
                        />
                        <label>Last name (optional)</label>
                    </div>
                </div>
                <button type="submit" className={isLoading ? "Loading" : ''}>Next</button>
            </form>
        </div>
    );
}
