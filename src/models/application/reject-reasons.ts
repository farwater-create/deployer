export const minecraftApplicationRejectReasons = {
  underage: "underage (< 13)",
  offensiveMinecraftName: "offensive minecraft name",
  offensiveMinecraftSkin: "offensive skin",
  offensiveDiscordProfilePicture: "offensive discord profile picture",
  offensiveDiscordName: "offensive discord name",
  offensiveDiscordUser: "offensive discord avatar/username/status/bio",
  offensiveApplication: "offensive application",
  lowEffortApplication: "Low effort application",
  userLeftDiscordServer: "user left discord server",
  noMinecraftAccount: "minecraft account not found",
  other: "other",
  otherBannable: "other (bannable)",
  invalidAge: "invalid age",
  isBanned: "is banned",
} as const;

export type MinecraftApplicationRejectReasons = typeof minecraftApplicationRejectReasons;


export type MinecraftApplicationRejectReason = keyof typeof minecraftApplicationRejectReasons;
