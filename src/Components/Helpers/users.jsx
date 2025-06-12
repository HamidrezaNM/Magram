import { SERVICE_NOTIFICATIONS_USER_ID } from "../../config";
import { formatPhoneNumber } from "../Util/phoneNumber";

export function isDeletedUser(user) {
    return user.deleted;
}

export function getUserFullName(user) {
    if (!user) {
        return undefined;
    }

    if (isDeletedUser(user)) {
        return 'Deleted Account';
    }

    if (user.title) return user.title;

    if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
    }

    if (user.firstName) {
        return user.firstName;
    }

    if (user.lastName) {
        return user.lastName;
    }

    if (user.phoneNumber) {
        return `+${formatPhoneNumber(user.phoneNumber)}`;
    }

    return undefined;
}