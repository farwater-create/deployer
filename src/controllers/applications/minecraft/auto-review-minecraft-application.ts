import { prisma } from "@lib/prisma";
import { getSkin, isGoodSkin } from "@lib/skin-id/skin-id";
import { MinecraftApplicationModel } from "@models/application";
import { MinecraftApplicationRejectReason } from "@views/application/minecraft-application-decision-message";
import { Client } from "discord.js";
/**
 * Throws error if application cannot be auto processed.
 * @param interaction
 * @param application
 * @returns
 */

export enum MinecraftApplicationAutoReviewStatus {
  Accepted,
  Rejected,
  NeedsManualReview,
}

export type MinecraftAutoReviewResult = {
  status: MinecraftApplicationAutoReviewStatus;
  reason: MinecraftApplicationRejectReason;
};

export const autoReviewMinecraftApplication = async (
  client: Client,
  application: MinecraftApplicationModel,
): Promise<MinecraftAutoReviewResult> => {
  const match = /^[1-9][0-9]?$/;
  if (!match.test(application.age)) {
    return {
      status: MinecraftApplicationAutoReviewStatus.Rejected,
      reason: "invalid_age",
    };
  }

  const ageInt = Number.parseInt(application.age, 10);

  if (Number.isNaN(ageInt)) {
    return {
      status: MinecraftApplicationAutoReviewStatus.Rejected,
      reason: "invalid_age",
    };
  }

  if (!Number.isSafeInteger(ageInt)) {
    return {
      status: MinecraftApplicationAutoReviewStatus.Rejected,
      reason: "invalid_age",
    };
  }

  if (ageInt < 13) {
    return {
      status: MinecraftApplicationAutoReviewStatus.Rejected,
      reason: "underage",
    };
  }

  if (application.minecraftUuid === "⚠️NO UUID FOUND⚠️") {
    return {
      status: MinecraftApplicationAutoReviewStatus.NeedsManualReview,
      reason: "no_minecraft_account",
    };
  }

  if (application.minecraftSkinSum != "null") {
    const badSkin = await prisma.badSkin.findFirst({
      where: {
        hash: application.minecraftSkinSum,
      },
    });
    if (badSkin)
      return {
        status: MinecraftApplicationAutoReviewStatus.Rejected,
        reason: "offensive_skin",
      };
  }

  return {
    status: MinecraftApplicationAutoReviewStatus.Accepted,
    reason: "other",
  };
};
