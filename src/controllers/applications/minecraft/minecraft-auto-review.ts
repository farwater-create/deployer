import { MinecraftApplicationModel } from "@models/application";
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
  reason: string
}


export const autoReviewMinecraftApplication = (application: MinecraftApplicationModel): MinecraftAutoReviewResult => {
  const ageInt = Number.parseInt(application.age);
  if(Number.isNaN(ageInt)) {
    return {
      status: MinecraftAutoReviewStatus.Rejected,
      reason: "invalid age"
    }
  }
  if(!Number.isSafeInteger(ageInt)) {
    return {
      status: MinecraftAutoReviewStatus.Rejected,
      reason: "invalid age"
    }
  }
  if(ageInt > 120 || ageInt < 13) {
    return {
      status: MinecraftAutoReviewStatus.Rejected,
      reason: "invalid age"
    }
  }
  if(application.minecraftUuid === "⚠️NO UUID FOUND⚠️") {
    return {
      status: MinecraftAutoReviewStatus.NeedsManualReview,
      reason: "Minecraft account not found."
    }
  }
  if(application.reason.length >= 100) {
    return {
      status: MinecraftAutoReviewStatus.Accepted,
      reason: "ok"
    }
  }
  return {
    status: MinecraftAutoReviewStatus.NeedsManualReview,
    reason: "Short description"
  }
}
