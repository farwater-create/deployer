import { config } from "@config";
import { PterodactylPanel } from "@controllers/pterodactyl/pterodactyl";
import { extractEmbedFields } from "@lib/discord/extract-fields";
import { fetchMinecraftUser } from "@lib/minecraft/fetch-minecraft-user";
import { prisma } from "@lib/prisma";
import { digestSkinHex } from "@lib/skin-id/skin-id";
import { logger } from "@logger";
import { MinecraftApplicationAutoReviewStatus, MinecraftApplicationModel, MinecraftAutoReviewResult } from "@models/application/application";
import { Client, GuildMember, Message } from "discord.js";
import z from "zod";

export class MinecraftApplication {
  private _offensiveSkin: boolean | undefined;
  private _autoReviewResult: MinecraftAutoReviewResult | undefined;
  private _member: GuildMember | undefined;
  constructor(private options: MinecraftApplicationModel & { client: Client }) {}

  getOptions() {
    return this.options;
  }

  async member() {
    const { client, discordId } = this.options;
    if(!this._member) {
      this._member == (await client.guilds.fetch(config.GUILD_ID)).members.fetch(discordId);
    }
    return this._member;
  }

  async user() {
    const { client, discordId } = this.options;
    return client.users.fetch(discordId);
  }

  async offensiveSkin(): Promise<boolean> {
    const { minecraftSkinSum } = this.options;
    const { _offensiveSkin} = this;
    if (minecraftSkinSum === "null") return false;
    if (_offensiveSkin) return _offensiveSkin;
    const result = await prisma.offensiveMinecraftSkin.findFirst({
      where: {
        hash: minecraftSkinSum,
      },
    });
    this._offensiveSkin = result ? true : false;
    return this._offensiveSkin;
  }

  async flagOffensiveSkin(): Promise<void> {
    const { minecraftSkinSum } = this.options;
    const offensiveSkin = await this.offensiveSkin();
    if (offensiveSkin) {
      await prisma.offensiveMinecraftSkin.create({
        data: {
          hash: minecraftSkinSum,
        },
      });
    }
  }

  async autoReviewResult(
  ): Promise<MinecraftAutoReviewResult> {
    const { age, minecraftUuid } = this.options;
    if (this._autoReviewResult) return this._autoReviewResult;
    const match = /^[1-9][0-9]?$/;
    if (!match.test(age)) {
      return {
        status: MinecraftApplicationAutoReviewStatus.Rejected,
        reason: "invalidAge",
      };
    }

    const ageInt = Number.parseInt(age, 10);

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

    if (minecraftUuid === "⚠️NO UUID FOUND⚠️") {
      return {
        status: MinecraftApplicationAutoReviewStatus.NeedsManualReview,
        reason: "noMinecraftAccount",
      };
    }

    if (await this.offensiveSkin()) {
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
      roleId: z.string()
    });

    const embedFields = extractEmbedFields<MinecraftApplicationModel>(embed, embedSchema);
    if(!embedFields) {
      throw new Error("Missing embed fields");
    }
    const reason = embed.description ? embed.description : "";

    return new MinecraftApplication({
      ...embedFields,
      reason,
      client: message.client
    });
  };

  async update() {
    const profile = await fetchMinecraftUser(this.options.minecraftUuid).catch(logger.error);
    if(!profile) return;
    this.options.minecraftUuid = profile.uuid;
    this.options.minecraftName = profile.username;
    this.options.minecraftSkinSum = digestSkinHex(profile.textures.raw.value);

    const { minecraftUuid, minecraftName, minecraftSkinSum, discordId, serverId } = this.options;
    prisma.minecraftApplication.update({
      where: {
        discordId_serverId: {
          discordId,
          serverId
        }
      },
      data: {
        minecraftName,
        minecraftUuid,
        minecraftSkinSum
      }
    }).catch(logger.error);
    if(await this.offensiveSkin()) {
      this.unwhitelist();
      logger.discord("warn", "found offensive skin while updating user application for " + `<@${discordId}>`);
      PterodactylPanel.minecraft(serverId).kick(minecraftName);
      (await this.user()).dmChannel?.send("You have been unwhitelisted and kicked for having an offensive skin. Submit a ticket.").catch(logger.error);
    }
  }

  async unwhitelist() {
    const { serverId, minecraftName } = this.options;
    PterodactylPanel.minecraft(serverId)
      .unwhitelist(minecraftName)
      .catch((err) => logger.discord("error", err));
  }

  async whitelist() {
    const { serverId, minecraftName } = this.options;
    PterodactylPanel.minecraft(serverId)
      .whitelist(minecraftName)
      .catch((err) => logger.discord("error", err));
  }

  async serialize() {
    const { discordId, minecraftUuid, reason, age, serverId, createdAt, minecraftName, minecraftSkinSum, roleId } = this.options;
    await prisma.minecraftApplication.create({
      data: {
        discordId,
        minecraftUuid,
        reason,
        age,
        serverId,
        createdAt,
        minecraftName,
        minecraftSkinSum,
        roleId
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
      return applicationModels.map(m => new MinecraftApplication({
        ...m,
        client
      }))
    }
  }

  async skinURL() {
    const { minecraftUuid } = this.options;
    return new URL(`https://mc-heads.net/body/${minecraftUuid}.png`).toString()
  }

}
