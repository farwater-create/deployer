import { MinecraftApplicationRejectReason } from "./reject-reasons";

export interface ApplicationModel {
  discordId: string;
  reason: string;
  age: string;
}

export type MinecraftApplicationModel = {
  minecraftName: string;
  minecraftUuid: string;
  minecraftSkinSum: string;
  serverId: string;
  createdAt: Date;
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
