import { MinecraftApplicationRejectReason } from "./reject-reasons";

import { MinecraftApplication } from "@prisma/client";

export type MinecraftApplicationModel = MinecraftApplication;

export enum MinecraftApplicationAutoReviewStatus {
  Accepted,
  Rejected,
  NeedsManualReview,
}

export type MinecraftAutoReviewResult = {
  status: MinecraftApplicationAutoReviewStatus;
  reason: MinecraftApplicationRejectReason;
};

export enum MinecraftApplicationCustomId {
  Accept = "minecraft-application-decision-accept",
  Reject = "minecraft-application-decision-reject",
  Submit = "minecraft-application-model-submit",
  Start =  "minecraft-application-start",
};
