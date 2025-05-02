import { memo, useEffect, useRef, useState } from "react";
import Transition from "../../Transition";
import EmojiData from '@emoji-mart/data/sets/14/apple.json'
import EmojiPicker from "@emoji-mart/react";
import { isMobile } from "../../Message/MessageMedia";
import { useSelector } from "react-redux";
import { Icon } from "../../common";
import Tabs from "../../../UI/Tabs";
import buildClassName from "../../../Util/buildClassName";
import TabContent from "../../../UI/TabContent";

function Picker({ show, onEmojiSelect, onBackspace }) {
    const [tabIndex, setTabIndex] = useState(0)

    const darkMode = useSelector((state) => state.settings.darkMode)

    const emojiPicker = useRef()

    const handlePicker = () => {
        if (isMobile) {
            setTimeout(() => {
                const emojiPickerSection = emojiPicker.current.querySelector('em-emoji-picker')
                    .shadowRoot.querySelector("section")

                emojiPickerSection.setAttribute("style", "width: 100%");

                emojiPickerSection.children[2].children[0].setAttribute("style", "width: 100%");
            }, 20);
        }
    }

    // useEffect(() => {
    //     if (isMobile) {
    //         setTimeout(() => {
    //             const emojiPickerSection = emojiPicker.current.querySelector('em-emoji-picker')
    //                 .shadowRoot.querySelector("section")

    //             emojiPickerSection.setAttribute("style", "width: 100%");

    //             emojiPickerSection.children[2].children[0].setAttribute("style", "width: 100%");

    //             emojiPicker.current.classList.remove('animate')
    //         }, 0);
    //     }
    // }, [])


    return <Transition state={show} activeAction={handlePicker}>
        <div className="EmojiPicker animate" ref={emojiPicker}>
            <Tabs index={tabIndex} setIndex={setTabIndex} bottom tabs={<>
                <div className={buildClassName("Tab", tabIndex === 0 && 'active')} onClick={() => setTabIndex(0)}>
                    <span>Emojis</span>
                </div>
                <div className={buildClassName("Tab", tabIndex === 1 && 'active')} onClick={() => setTabIndex(1)}>
                    <span>GIFs</span>
                </div>
                <div className={buildClassName("Tab", tabIndex === 2 && 'active')} onClick={() => setTabIndex(2)}>
                    <span>Stickers</span>
                </div>
            </>}>
                <TabContent state={true}>
                    <EmojiPicker
                        onEmojiSelect={onEmojiSelect}
                        theme={darkMode ? "dark" : "light"}
                        set="native"
                        previewPosition="none"
                        data={EmojiData} />

                </TabContent>
                <TabContent state={tabIndex === 1}>
                    <div></div>
                </TabContent>
                <TabContent state={tabIndex === 2}>
                    <div></div>
                </TabContent>
            </Tabs>
            <div className="Backspace">
                <Icon name="backspace" size={28} onClick={onBackspace} />
            </div>
        </div>
    </Transition>
}

export default memo(Picker)