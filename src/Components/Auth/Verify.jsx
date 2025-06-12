import { useContext, useRef, useState } from "react";
import { AuthComplete, AuthContext } from "./Auth";
import { client } from "../../App";
import { Api } from "telegram";

export default function Verify() {
    const [phoneCode, setPhoneCode] = useState("");
    const [isLoading, setIsLoading] = useState(false)

    const passwordTextField = useRef();

    const Auth = useContext(AuthContext);

    const Verify = async e => {
        e.preventDefault()

        try {
            const result = await client.invoke(
                new Api.auth.SignIn({
                    phoneNumber: Auth.authCountryCode + Auth.authPhoneNumber,
                    phoneCodeHash: Auth.authPhoneCodeHash,
                    phoneCode: phoneCode,
                })
            );

            await client.sendMessage('me', { message: "You're successfully logged in!" });

            const session = client.session.save()
            // console.log(session)
            AuthComplete(Auth, session)
        } catch (error) {
            console.log(error)
            if (error.errorMessage === 'SESSION_PASSWORD_NEEDED') {
                Auth.setAuthPhoneCode(phoneCode)
                Auth.setAuthState('authorizationStateWaitPassword')
            }
        }

        // socket.emit('AuthenticateUser', { phone: Auth.authPhoneNumber, countryCode: Auth.authCountryCode, verify: btoa(password) }, { device: deviceData ?? 'Unknown' })
        // setIsLoading(true)
        // socket.on('AuthenticateUser', (response) => {
        //     setIsLoading(false)
        //     if (response.ok) {
        //         Auth.setAuthState('VerifySession')
        //         Auth.setAuthKey(response.data)
        //         Auth.setDevice(deviceData)
        //         localStorage.setItem("auth_key", response.data);
        //         localStorage.setItem("authState", "authorizationStateReady");
        //     } else if (response.errorCode === 403) {
        //         passwordTextField.current.querySelector("label").innerHTML =
        //             "Incorrect code";
        //         passwordTextField.current.classList.add("error");
        //     }
        // })
    }

    return <div className="Verify">
        <form action="" onSubmit={Verify}>
            <div className="content">
                <div className="title">Enter Code</div>
                <p className="subtitle">
                    Your account is protected with password, so enter the password to be
                    verified
                </p>
                <div className="textfield" ref={passwordTextField}>
                    <input
                        placeholder=" "
                        type="text"
                        value={phoneCode}
                        onChange={(e) => {
                            if (passwordTextField.current.classList.contains("error")) {
                                passwordTextField.current.querySelector("label").innerHTML =
                                    "Code";
                                passwordTextField.current.classList.remove("error");
                            }
                            setPhoneCode(e.target.value);
                        }}
                    />
                    <label>Code</label>
                </div>
            </div>
            <button type="submit" className={isLoading ? "Loading" : ''}>Next</button>
        </form>
    </div>
}

export const GetDeviceData = () => {
    var unknown = '-';

    // browser
    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browser = navigator.appName;
    var version = '' + parseFloat(nVer);
    var nameOffset, verOffset, ix;

    // Yandex Browser
    if ((verOffset = nAgt.indexOf('YaBrowser')) != -1) {
        browser = 'Yandex';
        version = nAgt.substring(verOffset + 10);
    }
    // Samsung Browser
    else if ((verOffset = nAgt.indexOf('SamsungBrowser')) != -1) {
        browser = 'Samsung';
        version = nAgt.substring(verOffset + 15);
    }
    // UC Browser
    else if ((verOffset = nAgt.indexOf('UCBrowser')) != -1) {
        browser = 'UC Browser';
        version = nAgt.substring(verOffset + 10);
    }
    // Opera Next
    else if ((verOffset = nAgt.indexOf('OPR')) != -1) {
        browser = 'Opera';
        version = nAgt.substring(verOffset + 4);
    }
    // Opera
    else if ((verOffset = nAgt.indexOf('Opera')) != -1) {
        browser = 'Opera';
        version = nAgt.substring(verOffset + 6);
        if ((verOffset = nAgt.indexOf('Version')) != -1) {
            version = nAgt.substring(verOffset + 8);
        }
    }
    // Legacy Edge
    else if ((verOffset = nAgt.indexOf('Edge')) != -1) {
        browser = 'Microsoft Legacy Edge';
        version = nAgt.substring(verOffset + 5);
    }
    // Edge (Chromium)
    else if ((verOffset = nAgt.indexOf('Edg')) != -1) {
        browser = 'Microsoft Edge';
        version = nAgt.substring(verOffset + 4);
    }
    // MSIE
    else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
        browser = 'Microsoft Internet Explorer';
        version = nAgt.substring(verOffset + 5);
    }
    // Chrome
    else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
        browser = 'Chrome';
        version = nAgt.substring(verOffset + 7);
    }
    // Safari
    else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
        browser = 'Safari';
        version = nAgt.substring(verOffset + 7);
        if ((verOffset = nAgt.indexOf('Version')) != -1) {
            version = nAgt.substring(verOffset + 8);
        }
    }
    // Firefox
    else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
        browser = 'Firefox';
        version = nAgt.substring(verOffset + 8);
    }
    // MSIE 11+
    else if (nAgt.indexOf('Trident/') != -1) {
        browser = 'Microsoft Internet Explorer';
        version = nAgt.substring(nAgt.indexOf('rv:') + 3);
    }
    // Other browsers
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
        browser = nAgt.substring(nameOffset, verOffset);
        version = nAgt.substring(verOffset + 1);
        if (browser.toLowerCase() == browser.toUpperCase()) {
            browser = navigator.appName;
        }
    }
    // trim the version string
    if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

    var majorVersion = parseInt('' + version, 10);
    if (isNaN(majorVersion)) {
        version = '' + parseFloat(nVer);
        majorVersion = parseInt(nVer, 10);
    }

    // mobile version
    var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

    // cookie
    var cookieEnabled = (navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
        document.cookie = 'testcookie';
        cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
    }

    // system
    var os = unknown;
    var clientStrings = [
        { s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/ },
        { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
        { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
        { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
        { s: 'Windows Vista', r: /Windows NT 6.0/ },
        { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
        { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
        { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
        { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
        { s: 'Windows 98', r: /(Windows 98|Win98)/ },
        { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
        { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
        { s: 'Windows CE', r: /Windows CE/ },
        { s: 'Windows 3.11', r: /Win16/ },
        { s: 'Android', r: /Android/ },
        { s: 'Open BSD', r: /OpenBSD/ },
        { s: 'Sun OS', r: /SunOS/ },
        { s: 'Chrome OS', r: /CrOS/ },
        { s: 'Linux', r: /(Linux|X11(?!.*CrOS))/ },
        { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
        { s: 'Mac OS X', r: /Mac OS X/ },
        { s: 'Mac OS', r: /(Mac OS|MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
        { s: 'QNX', r: /QNX/ },
        { s: 'UNIX', r: /UNIX/ },
        { s: 'BeOS', r: /BeOS/ },
        { s: 'OS/2', r: /OS\/2/ },
        { s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }
    ];
    for (var id in clientStrings) {
        var cs = clientStrings[id];
        if (cs.r.test(nAgt)) {
            os = cs.s;
            break;
        }
    }

    var osVersion = unknown;

    if (/Windows/.test(os)) {
        osVersion = /Windows (.*)/.exec(os)[1];
        os = 'Windows';
    }

    switch (os) {
        case 'Mac OS':
        case 'Mac OS X':
        case 'Android':
            osVersion = /(?:Android|Mac OS|Mac OS X|MacPPC|MacIntel|Mac_PowerPC|Macintosh) ([\.\_\d]+)/.exec(nAgt)[1];
            if (os === 'Android') {
                osVersion = osVersion === '10' ? '10+' : osVersion
            }
            break;

        case 'iOS':
            osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
            osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
            break;
    }

    var result = {
        browser: browser,
        browserVersion: version,
        browserMajorVersion: majorVersion,
        mobile: mobile,
        os: os,
        osVersion: osVersion,
        cookies: cookieEnabled
    };

    return result
}

export const DetectDevice = () => {
    var ua = navigator.userAgent;
    var tem;
    var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
}
