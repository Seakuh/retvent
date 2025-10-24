import { Member, Role } from "../types/community.types";

const isAdminOrHost = (member?: Member | null) =>
  member?.role === Role.ADMIN || member?.role === Role.HOST;

export const canPostNews = (member?: Member | null) => isAdminOrHost(member);

export const canCreateEvent = (member?: Member | null) => isAdminOrHost(member);

export const canCreatePoll = (member?: Member | null) => isAdminOrHost(member);

export const canComment = (member?: Member | null) =>
  Boolean(member && member.role !== Role.GUEST);

export const canRSVP = (member?: Member | null) =>
  Boolean(member && member.role !== Role.GUEST);

export const canConnect = (member?: Member | null) =>
  Boolean(member && member.role !== Role.GUEST);

export const canDeleteComment = (
  currentUser: Member | null | undefined,
  authorId: string
) => {
  if (!currentUser) {
    return false;
  }
  if (currentUser.id === authorId) {
    return true;
  }
  return isAdminOrHost(currentUser);
};

