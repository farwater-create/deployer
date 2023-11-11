export interface ApplicationModel {
  discordId: string;
  reason: string;
  age: string;
}

export type MinecraftApplicationModel = {
  minecraftName: string;
  minecraftUuid: string;
  minecraftSkinSum: string;
} & ApplicationModel;

export enum MinecraftApplicationAutoReviewStatus {
  Accepted,
  Rejected,
  NeedsManualReview,
}

export type MinecraftAutoReviewResult = {
  status: MinecraftApplicationAutoReviewStatus;
  reason: MinecraftApplicationRejectReason;
};

export type MinecraftApplicationRejectReason =
  | "underage"
  | "no_reason_provided"
  | "low_effort_application"
  | "offensive_name"
  | "offensive_skin"
  | "offensive_username"
  | "offensive_discord_user"
  | "offensive_application"
  | "user_not_in_discord_server"
  | "no_minecraft_account"
  | "other_bannable"
  | "invalid_age"
  | "other"
  | "is_banned"


export const minecraftApplicationDenyReasons: Array<{
  label: string;
  value: MinecraftApplicationRejectReason;
}> = [
  {
    label: "underage (< 13)",
    value: "underage",
  },
  {
    label: "no reason provided",
    value: "no_reason_provided",
  },
  {
    label: "Low effort application",
    value: "low_effort_application",
  },
  {
    label: "offensive name",
    value: "offensive_name",
  },
  {
    label: "offensive skin",
    value: "offensive_skin",
  },
  {
    label: "offensive username",
    value: "offensive_username",
  },
  {
    label: "offensive discord avatar/username/status/bio",
    value: "offensive_discord_user",
  },
  {
    label: "offensive application",
    value: "offensive_application",
  },
  {
    label: "user not in discord server",
    value: "user_not_in_discord_server",
  },
  {
    label: "minecraft account not found",
    value: "no_minecraft_account",
  },
  {
    label: "other",
    value: "other",
  },
  {
    label: "other (bannable)",
    value: "other_bannable",
  },
  {
    label: "invalid age",
    value: "invalid_age",
  },
  {
    label: "is banned",
    value: "is_banned"
  }
];

export const minecraftApplicationDenyReasonDescriptions = new Map<
  MinecraftApplicationRejectReason,
  string
>();

minecraftApplicationDenyReasons.forEach((v) => {
  minecraftApplicationDenyReasonDescriptions.set(v.value, v.label);
});
