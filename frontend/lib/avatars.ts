/**
 * Каталог аватарок користувачів:
 * - Square / Squircle (квадратні із заокругленням): Avatar_1 .. Avatar_6
 * - Circle (круглі): CAvatar_1 .. CAvatar_6
 */

export interface UserAvatarItem {
  id: string;
  name: string;
  shape: "square" | "circle";
  src: string;
}

export const SQUARE_AVATARS: UserAvatarItem[] = [
  { id: "cat-white-square", name: "White Cat (Автор)", shape: "square", src: "/avatars/Avatar_1.png" },
  { id: "cat-siamese-square", name: "Siamese Cat", shape: "square", src: "/avatars/Avatar_2.png" },
  { id: "cat-tan-square", name: "Tan Cat", shape: "square", src: "/avatars/Avatar_3.png" },
  { id: "cat-grey-square", name: "Grey Cat", shape: "square", src: "/avatars/Avatar_4.png" },
  { id: "cat-orange-square", name: "Orange Cat", shape: "square", src: "/avatars/Avatar_5.png" },
  { id: "cat-black-square", name: "Black Cat", shape: "square", src: "/avatars/Avatar_6.png" },
];

export const CIRCLE_AVATARS: UserAvatarItem[] = [
  { id: "cat-black-circle", name: "Black Cat (Round)", shape: "circle", src: "/avatars/CAvatar_1.png" },
  { id: "cat-orange-circle", name: "Orange Cat (Round)", shape: "circle", src: "/avatars/CAvatar_2.png" },
  { id: "cat-grey-circle", name: "Grey Cat (Round)", shape: "circle", src: "/avatars/CAvatar_3.png" },
  { id: "cat-tan-circle", name: "Tan Cat (Round)", shape: "circle", src: "/avatars/CAvatar_4.png" },
  { id: "cat-siamese-circle", name: "Siamese Cat (Round)", shape: "circle", src: "/avatars/CAvatar_5.png" },
  { id: "cat-white-circle", name: "White Cat (Round)", shape: "circle", src: "/avatars/CAvatar_6.png" },
];

export const ALL_AVATARS = [...SQUARE_AVATARS, ...CIRCLE_AVATARS];

/** Базовий аватар автора Олександра Коваленка */
export const DEFAULT_AUTHOR_AVATAR = "/avatars/Avatar_1.png";
