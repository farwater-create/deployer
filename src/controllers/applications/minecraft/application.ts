import { config } from "@config";
import { prisma } from "@lib/prisma";
import { logger } from "@logger";
import { MinecraftApplicationAutoReviewStatus, MinecraftApplicationModel, MinecraftApplicationRejectReason, MinecraftAutoReviewResult, minecraftApplicationDenyReasonDescriptions } from "@models/application";
import { PrismaClient } from "@prisma/client";
import { Client, DMChannel, Message } from "discord.js";

export class MinecraftApplication implements MinecraftApplicationModel {
  discordId: string;
  reason: string;
  age: string;
  minecraftName: string;
  minecraftUuid: string;
  minecraftSkinSum: string;
  private _offensiveSkin: boolean | undefined;
  private _autoReviewResult: MinecraftAutoReviewResult | undefined;

  constructor(model: MinecraftApplicationModel) {
    this.discordId = model.discordId;
    this.reason = model.reason;
    this.age = model.age;
    this.minecraftName = model.minecraftName;
    this.minecraftUuid = model.minecraftUuid;
    this.minecraftSkinSum = model.minecraftSkinSum;
  }

  async offensiveSkin(): Promise<boolean> {
    if (this.minecraftSkinSum === "null") return false;
    if (this._offensiveSkin) return this._offensiveSkin;
    const result = await prisma.offensiveMinecraftSkin.findFirst({
      where: {
        hash: this.minecraftSkinSum,
      },
    });
    this._offensiveSkin = result ? true : false;
    return this._offensiveSkin;
  }

  async flagOffensiveSkin(): Promise<void> {
    if (await this.offensiveSkin()) {
      await prisma.offensiveMinecraftSkin.create({
        data: {
          hash: this.minecraftSkinSum,
        },
      });
    }
    this._offensiveSkin = true;
  }

  async autoReviewResult(
    application: MinecraftApplication
  ): Promise<MinecraftAutoReviewResult> {
    if (this._autoReviewResult) return this._autoReviewResult;
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

    if (await application.offensiveSkin()) {
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
    });
  };

  async denyApplication(
    client: Client,
    application: MinecraftApplication,
    reason: MinecraftApplicationRejectReason
  ) {

    const { discordId } = application;
    const guild = client.guilds.cache.get(config.GUILD_ID);
    if (!guild) {
      throw new Error("guild not found");
    }

    const rejectReasonDescription =
      minecraftApplicationDenyReasonDescriptions.get(reason);
    const user = await client.users.fetch(discordId);
    if (!user) return;
    const dmChannel = await user.createDM(true);

    try {
      await dmChannel.send(
        `Your farwater application was denied for reason: \`${rejectReasonDescription}\`. If you believe this was an error create a ticket.`
      ).catch(logger.error);
      switch (reason) {
        case "other_bannable":
          break;
        case "underage":
          break;
        case "offensive_application":
          break;
        case "offensive_discord_user":
          break;
        case "offensive_skin":
          await application.flagOffensiveSkin();
          break;
        case "offensive_name":
          break;
        case "no_reason_provided":
          await dmChannel.send("Please reapply with a valid reason").catch(logger.error);
          break;
        case "user_not_in_discord_server":
          break;
        case "no_minecraft_account":
          await dmChannel.send(
            "Double check your minecraft name (case sensitive) and apply again."
          ).catch(logger.error);
          break;
        case "invalid_age":
          await dmChannel.send("Please enter a valid age when re-applying").catch(logger.error);
        default:
        case "low_effort_application":
          await dmChannel.send(
            "Please give more reasons for why you want to join farwater then apply again."
          ).catch(logger.error);
          break;
      }
    } catch (error) {
      logger.discord(
        "warn",
        "Tried to send dm to user " + user.id + " but user has dms closed."
      );
    }
  };

  async dmChannel(client: Client): Promise<DMChannel> {
    return client.users.createDM(this.discordId);
  }

  async acceptApplication() {

  }

  async serialize(prisma: PrismaClient) {
    const { discordId, minecraftUuid, reason, age } = this;
    await prisma.minecraftApplication.create({
      data: {
        discordId,
        minecraftUuid,
        reason,
        age
      }
    })
  }

  static async byDiscordId(prisma: PrismaClient, discordId: string) {
    return prisma.minecraftApplication.findFirst({
      where: {
        discordId
      }
    });
  }
}
