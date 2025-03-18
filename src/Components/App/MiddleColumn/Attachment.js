import { memo, useCallback, useRef } from "react"
import { Api } from "telegram"

function Attachment({ onUpload }) {
    const onFileChanged = useCallback((e) => {
        const file = e.target.files[0]

        var reader = new FileReader();
        reader.onload = function () {

            var arrayBuffer = this.result,
                bytes = new Uint8Array(arrayBuffer)

            const getFileType = () => {
                switch (file.type?.split('/')[0]) {
                    case 'image':
                        return new Api.MessageMediaPhoto({
                            photo: new Api.Photo({
                                fileReference: bytes
                            })
                        })
                    case 'video':
                        return new Api.MessageMediaDocument({
                            document: new Api.Document({
                                attributes: [
                                    new Api.DocumentAttributeVideo({})
                                ],
                                size: { value: file.size },
                                fileReference: bytes,
                                mimeType: file.type
                            })
                        })
                    default:
                        return new Api.MessageMediaDocument({
                            document: new Api.Document({
                                attributes: [
                                    new Api.DocumentAttributeFilename({
                                        fileName: file.name
                                    })
                                ],
                                size: { value: file.size },
                                fileReference: bytes,
                                mimeType: file.type
                            })
                        })
                }
            }

            const media = getFileType()

            onUpload(file, arrayBuffer, media)
        }
        reader.readAsArrayBuffer(file);
    }, [])

    return <div className="Attachment">
        <input type="file" onChange={onFileChanged} />
    </div>
}

export default memo(Attachment)