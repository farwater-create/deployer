export type ApplicationRejectReasonField = {
  // Admin facing label
  label: string;
  value: ApplicationRejectReason;
};

export type ApplicationRejectReason =
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
  | "other";

export const ApplicationRejectReasons: Array<ApplicationRejectReasonField> = [
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
    label: "other",
    value: "other",
  },
];
