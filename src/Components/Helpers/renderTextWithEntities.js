import { Api } from "telegram";
import MentionLink from "../App/Message/MentionLink";
import Link from "../App/Message/Link";
import Spoiler from "../App/Message/Spoiler";
import CustomEmoji from "../App/Message/CustomEmoji";
import Pre from "../App/Message/Pre";
import BotCommand from "../App/Message/BotCommand";

export default function renderTextWithEntities(text, entities, allowClick = true, includeFrom, isInChat = true) {
    if (!entities?.length) {
        if (includeFrom) {
            return includeFrom + ': ' + text
        }
        return text
    }

    const result = [];

    const organizedEntities = organizeEntities(entities);

    const renderEntity = (textPartStart, textPartEnd, organizedEntity, isLastEntity) => {
        const { entity, nestedEntities } = organizedEntity;
        let { offset, length } = entity

        const entityResult = []

        let textBefore = text.substring(textPartStart, offset)
        const textBeforeLength = textBefore.length
        entityResult.push(textBefore)

        const entityStartIndex = textPartStart + textBeforeLength;
        const entityEndIndex = entityStartIndex + length
        let entityContent = text.substring(offset, offset + length)
        const nestedEntityContent = []

        if (nestedEntities.length) {
            let nestedIndex = entityStartIndex;

            nestedEntities.forEach((nestedEntity, nestedEntityIndex) => {
                const {
                    entityResult: nestedResult,
                    entityEndIndex: nestedEntityEndIndex,
                } = renderEntity(
                    nestedIndex,
                    entityEndIndex,
                    nestedEntity,
                    nestedEntityIndex === nestedEntities.length - 1,
                );

                nestedEntityContent.push(...nestedResult);
                nestedIndex = nestedEntityEndIndex;
            });
        }

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
            case 'MessageEntityBold':
                return <strong>{entityContent}</strong>
            case 'MessageEntityMention':
                return <MentionLink username={entityContent} allowClick={allowClick}>{entityContent}</MentionLink>
            case 'MessageEntityTextUrl':
            case 'MessageEntityUrl':
                return <Link url={entity.url ?? entityContent} allowClick={allowClick}>{entityContent}</Link>
            case 'MessageEntitySpoiler':
                return <Spoiler allowClick={allowClick}>{entityContent}</Spoiler>
            case 'MessageEntityCustomEmoji':
                return <CustomEmoji documentId={entity.documentId.value} autoPlay={isInChat && window.Animations?.AnimatedStickers} />
            case 'MessageEntityPre':
                return <Pre>{entityContent}</Pre>
            case 'MessageEntityBotCommand':
                return <BotCommand command={entityContent}>{entityContent}</BotCommand>
            default:
                return entityContent
        }
    }

    function organizeEntities(entities) {
        const organizedEntityIndexes = new Set();
        const organizedEntities = [];

        entities.forEach((entity, index) => {
            if (organizedEntityIndexes.has(index)) {
                return;
            }

            const organizedEntity = organizeEntity(entity, index, entities, organizedEntityIndexes);
            if (organizedEntity) {
                organizedEntity.organizedIndexes.forEach((organizedIndex) => {
                    organizedEntityIndexes.add(organizedIndex);
                });

                organizedEntities.push(organizedEntity);
            }
        });

        return organizedEntities;
    }

    function organizeEntity(
        entity,
        index,
        entities,
        organizedEntityIndexes,
    ) {
        const { offset, length } = entity;
        const organizedIndexes = new Set([index]);

        if (organizedEntityIndexes.has(index)) {
            return undefined;
        }

        const nestedEntities = [];
        const parsedNestedEntities = entities
            .filter((e, i) => i > index && e.offset >= offset && e.offset < offset + length)
            .map((e) => organizeEntity(e, entities.indexOf(e), entities, organizedEntityIndexes))
            .filter(Boolean);

        parsedNestedEntities.forEach((parsedEntity) => {
            let isChanged = false;

            parsedEntity.organizedIndexes.forEach((organizedIndex) => {
                if (!isChanged && !organizedIndexes.has(organizedIndex)) {
                    isChanged = true;
                }

                organizedIndexes.add(organizedIndex);
            });

            if (isChanged) {
                nestedEntities.push(parsedEntity);
            }
        });

        return {
            entity,
            organizedIndexes,
            nestedEntities,
        };
    }

    let index = 0

    organizedEntities.forEach((entity, arrayIndex) => {
        const { entityResult, entityEndIndex } = renderEntity(index, text.length, entity, arrayIndex === organizedEntities.length - 1)

        result.push(...entityResult)
        index = entityEndIndex
    })

    if (includeFrom) {
        result.unshift(includeFrom + ': ')
    }

    return result
}