import { prisma } from "@lib/prisma";
import { MinecraftApplicationAutoReviewStatus, MinecraftApplicationModel, MinecraftAutoReviewResult } from "@models/application";
import { Message } from "discord.js";

export class MinecraftApplication implements MinecraftApplicationModel {
  discordId: string;
  reason: string;
  age: string;
  minecraftName: string;
  minecraftUuid: string;
  minecraftSkinSum: string;
  private offensiveSkin: boolean | undefined;
  constructor(model: MinecraftApplicationModel) {
    this.discordId = model.discordId;
    this.reason = model.reason;
    this.age = model.age;
    this.minecraftName = model.minecraftName;
    this.minecraftUuid = model.minecraftUuid;
    this.minecraftSkinSum = model.minecraftSkinSum;
  }
  async hasOffensiveSkin(): Promise<boolean> {
    if (this.minecraftSkinSum === "null") return false;
    if (this.offensiveSkin) return this.offensiveSkin;
    const result = await prisma.offensiveMinecraftSkin.findFirst({
      where: {
        hash: this.minecraftSkinSum,
      },
    });
    this.offensiveSkin = result ? true : false;
    return this.offensiveSkin;
  }
  async flagOffensiveSkin(): Promise<void> {
    if(await this.hasOffensiveSkin()) {
      await prisma.offensiveMinecraftSkin.create({
        data: {
          hash: this.minecraftSkinSum
        }
      })
    }
  }
  async autoReviewResult(
    application: MinecraftApplication
  ): Promise<MinecraftAutoReviewResult> {
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

    if (await application.hasOffensiveSkin()) {
      return {
        reason: "offensive_skin",
        status: MinecraftApplicationAutoReviewStatus.NeedsManualReview,
      };
    }

    return {
      status: MinecraftApplicationAutoReviewStatus.Accepted,
      reason: "other",
    };
  }
  static fromMinecraftApplicationDecisionMessage = (
    message: Message
  ): MinecraftApplication => {
    if (message.embeds.length < 1) {
      throw new Error("error parsing application decision message");
    }
    const embed = message.embeds[0];
    const reason = embed.description;

    let discordId: string | undefined;
    let minecraftUuid: string | undefined;
    let minecraftName: string | undefined;
    let minecraftSkinSum: string | undefined;
    let age: string | undefined;

    embed.fields.forEach((field) => {
      if (field.name === "discordId") discordId = field.value;
      if (field.name === "minecraftUuid") minecraftUuid = field.value;
      if (field.name === "minecraftName") minecraftName = field.value;
      if (field.name === "age") age = field.value;
      if (field.name === "minecraftSkinSum") minecraftSkinSum = field.value;
    });

    if (
      !discordId ||
      !minecraftUuid ||
      !minecraftName ||
      !reason ||
      !age ||
      !minecraftSkinSum
    ) {
      throw new Error("embed missing fields.");
    }
    return new MinecraftApplication({
      age,
      discordId,
      minecraftUuid,
      minecraftName,
      minecraftSkinSum,
      reason,
    })
  };
}
