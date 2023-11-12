import { config } from "@config";
import { PterodactylPanel } from "@controllers/pterodactyl/pterodactyl";
import { extractEmbedFields } from "@lib/discord-helpers/extract-fields";
import { fetchMinecraftUser } from "@lib/minecraft/fetch-minecraft-user";
import { prisma } from "@lib/prisma";
import { digestSkinHex } from "@lib/skin-id/skin-id";
import { logger } from "@logger";
import { MinecraftApplicationAutoReviewStatus, MinecraftApplicationModel, MinecraftAutoReviewResult } from "@models/application/application";
import { MinecraftApplicationRejectReason, minecraftApplicationRejectReasons } from "@models/application/reject-reasons";
import { Prisma, PrismaClient } from "@prisma/client";
import { Client, GuildMember, Message } from "discord.js";
import z from "zod";

export class MinecraftApplication implements MinecraftApplicationModel {
  discordId: string;
  reason: string;
  age: string;
  minecraftName: string;
  minecraftUuid: string;
  minecraftSkinSum: string;
  serverId: string;
  client: Client;
  createdAt: Date;
  private _offensiveSkin: boolean | undefined;
  private _autoReviewResult: MinecraftAutoReviewResult | undefined;
  private _member: GuildMember | undefined;

  constructor(model: MinecraftApplicationModel, client: Client) {
    this.discordId = model.discordId;
    this.reason = model.reason;
    this.age = model.age;
    this.minecraftName = model.minecraftName;
    this.minecraftUuid = model.minecraftUuid;
    this.minecraftSkinSum = model.minecraftSkinSum;
    this.serverId = model.serverId;
    this.client = client;
    this.createdAt = model.createdAt;
  }

  async member() {
    if(!this._member) {
      this._member == (await this.client.guilds.fetch(config.GUILD_ID)).members.fetch(this.discordId);
    }
    return this._member;
  }

  async user() {
    return this.client.users.fetch(this.discordId);
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
        reason: "invalidAge",
      };
    }

    const ageInt = Number.parseInt(application.age, 10);

    if (Number.isNaN(ageInt)) {
      return {
        status: MinecraftApplicationAutoReviewStatus.Rejected,
        reason: "invalidAge",
      };
    }

    if (!Number.isSafeInteger(ageInt)) {
      return {
        status: MinecraftApplicationAutoReviewStatus.Rejected,
        reason: "invalidAge",
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
        reason: "noMinecraftAccount",
      };
    }

    if (await application.offensiveSkin()) {
      return {
        reason: "offensiveMinecraftSkin",
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
    const embedSchema = z.object({
      discordId: z.string(),
      minecraftUuid: z.string(),
      minecraftName: z.string(),
      minecraftSkinSum: z.string(),
      serverId: z.string(),
      age: z.string(),
    });

    const embedFields = extractEmbedFields<MinecraftApplicationModel>(embed, embedSchema);
    if(!embedFields) {
      throw new Error("Missing embed fields");
    }
    const reason = embed.description ? embed.description : "";

    return new MinecraftApplication({
      ...embedFields,
      reason,
    }, message.client);
  };

  async update() {
    const profile = await fetchMinecraftUser(this.minecraftUuid).catch(logger.error);
    if(!profile) return;
    this.minecraftUuid = profile.uuid;
    this.minecraftName = profile.username;
    this.minecraftSkinSum = digestSkinHex(profile.textures.raw.value);
    const { minecraftUuid, minecraftName, minecraftSkinSum } = this;
    prisma.minecraftApplication.update({
      where: {
        serverId: this.serverId,
        discordId: this.discordId
      },
      data: {
        minecraftName,
        minecraftUuid,
        minecraftSkinSum
      }
    }).catch(logger.error);
    if(await this.offensiveSkin()) {
      this.unwhitelist();
      logger.discord("warn", "found offensive skin while updating user application for " + `<@${this.discordId}>`);
    }
  }

  async unwhitelist() {
    PterodactylPanel.minecraft(config.PTERODACTYL_SERVER_ID)
      .unwhitelist(this.minecraftName)
      .catch((err) => logger.discord("error", err));
  }

  async whitelist() {
    PterodactylPanel.minecraft(config.PTERODACTYL_SERVER_ID)
      .whitelist(this.minecraftName)
      .catch((err) => logger.discord("error", err));
  }

  async serialize(prisma: PrismaClient) {
    const { discordId, minecraftUuid, reason, age, serverId, createdAt, minecraftName, minecraftSkinSum } = this;
    await prisma.minecraftApplication.create({
      data: {
        discordId,
        minecraftUuid,
        reason,
        age,
        serverId,
        createdAt,
        minecraftName,
        minecraftSkinSum
      }
    }).catch(logger.error);
  }

  static async fromDiscordId(client: Client, discordId: string) {
    const applicationModels = await prisma.minecraftApplication.findMany({
      where: {
        discordId
      }
    });
    if(applicationModels) {
      return applicationModels.map(m => new MinecraftApplication(m, client))
    }
  }

  async skinURL() {
    return new URL(`https://mc-heads.net/body/${this.minecraftUuid}.png`).toString()
  }
}
