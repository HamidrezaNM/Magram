import { Api } from "telegram";
import MentionLink from "../App/Message/MentionLink";
import Link from "../App/Message/Link";
import Spoiler from "../App/Message/Spoiler";
import CustomEmoji from "../App/Message/CustomEmoji";

export default function renderTextWithEntities(text, entities, allowClick = true, entitiesData) {
    if (!entities?.length) {
        return text
    }

    const result = [];

    const renderEntity = (textPartStart, textPartEnd, entity, isLastEntity) => {
        let { offset, length } = entity

        const entityResult = []

        let textBefore = text.substring(textPartStart, offset)
        const textBeforeLength = textBefore.length
        entityResult.push(textBefore)

        const entityStartIndex = textPartStart + textBeforeLength;
        const entityEndIndex = entityStartIndex + length
        let entityContent = text.substring(offset, offset + length)

        const newEntity = processEntity(entity, entityContent)

        if (Array.isArray(newEntity))
            entityResult.push(...newEntity)
        else
            entityResult.push(newEntity)

        if (isLastEntity) {
            let textAfter = text.substring(entityEndIndex, textPartEnd)

            entityResult.push(textAfter)
        }

        return { entityResult, entityEndIndex }
    }

    const processEntity = (entity, entityContent) => {
        switch (entity.className) {
            case 'MessageEntityMention':
                return <MentionLink username={entityContent} allowClick={allowClick}>{entityContent}</MentionLink>
            case 'MessageEntityTextUrl':
            case 'MessageEntityUrl':
                return <Link url={entity.url ?? entityContent}>{entityContent}</Link>
            case 'MessageEntitySpoiler':
                return <Spoiler allowClick={allowClick}>{entityContent}</Spoiler>
            case 'MessageEntityCustomEmoji':
                return <CustomEmoji documentId={entity.documentId.value} />
            default:
                return entityContent
        }
    }

    let index = 0

    entities.forEach((entity, arrayIndex) => {
        const { entityResult, entityEndIndex } = renderEntity(index, text.length, entity, arrayIndex === entities.length - 1)

        result.push(...entityResult)
        index = entityEndIndex
    })

    return result
}