import { MinecraftApplicationModel } from "@models/application";
import { MinecraftApplicationRejectReason, minecraftApplicationDenyReasons } from "@views/application/minecraft-application-decision-message";
/**
 * Throws error if application cannot be auto processed.
 * @param interaction
 * @param application
 * @returns
 */


export enum MinecraftAutoReviewStatus {
  Accepted,
  Rejected,
  NeedsManualReview
}

export type MinecraftAutoReviewResult = {
  status: MinecraftAutoReviewStatus,
  reason: MinecraftApplicationRejectReason
}


export const autoReviewMinecraftApplication = (application: MinecraftApplicationModel): MinecraftAutoReviewResult => {
  const match = /^[1-9][0-9]?$/;
  if(!match.test(application.age)) {
    return {
      status: MinecraftAutoReviewStatus.Rejected,
      reason: "invalid_age"
    }
  }

  const ageInt = Number.parseInt(application.age, 10);

  if(Number.isNaN(ageInt)) {
    return {
      status: MinecraftAutoReviewStatus.Rejected,
      reason: "invalid_age",
    }
  }

  if(!Number.isSafeInteger(ageInt)) {
    return {
      status: MinecraftAutoReviewStatus.Rejected,
      reason: "invalid_age"
    }
  }

  if(ageInt < 13) {
    return {
      status: MinecraftAutoReviewStatus.Rejected,
      reason: "underage"
    }
  }

  if(application.minecraftUuid === "⚠️NO UUID FOUND⚠️") {
    return {
      status: MinecraftAutoReviewStatus.NeedsManualReview,
      reason: "no_minecraft_account"
    }
  }

  if(application.reason.length >= 100) {
    return {
      status: MinecraftAutoReviewStatus.Accepted,
      reason: "other"
    }
  }

  return {
    status: MinecraftAutoReviewStatus.NeedsManualReview,
    reason: "low_effort_application"
  }
}
