import { config } from "@config";
import { MinecraftApplication } from "@controllers/applications/minecraft/application";
import { PterodactylPanel } from "@controllers/pterodactyl/pterodactyl";
import { fetchMinecraftUser } from "@lib/minecraft/fetch-minecraft-user";
import { prisma } from "@lib/prisma";
import { digestSkinHex } from "@lib/skin-id/skin-id";
import { logger } from "@logger";
import { MinecraftApplicationReviewStatus } from "@models/application/application";
import { FarwaterUserModel } from "@models/user/farwater-user";
import { Client } from "discord.js";

export class FarwaterUser {
    private _offensiveSkin: boolean | undefined;

    constructor(private options: FarwaterUserModel & { client: Client }) { }

    getOptions() {
        return this.options;
    }

    async member() {
        const { client, discordId } = this.options;
        return (await client.guilds.fetch(config.GUILD_ID)).members.fetch(discordId);
    }

    async user() {
        const { client, discordId } = this.options;
        return client.users.fetch(discordId);
    }

    async offensiveSkin(): Promise<boolean> {
        const { minecraftSkinSum } = this.options;
        if (typeof minecraftSkinSum != "string") return false;
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
        if (minecraftSkinSum) {
            await prisma.offensiveMinecraftSkin.upsert({
                create: {
                    hash: minecraftSkinSum,
                },
                update: {
                    hash: minecraftSkinSum,
                },
                where: {
                    hash: minecraftSkinSum,
                },
            });
        }
        return logger.discord(
            "warn",
            `flagged offensive skin for <@${this.options.discordId}> ${this.options.minecraftName}`,
        );
    }

    async skinURL() {
        const { minecraftUuid } = this.options;
        return new URL(`https://mc-heads.net/body/${minecraftUuid}.png`).toString();
    }

    static async fromDiscordId(client: Client, discordId: string): Promise<FarwaterUser> {
        let farwaterUser = await prisma.farwaterUser.findUnique({
            where: {
                discordId,
            },
            include: {
                minecraftApplications: true,
            },
        });

        if (!farwaterUser) {
            farwaterUser = await prisma.farwaterUser.create({
                data: {
                    discordId: discordId,
                },
                include: {
                    minecraftApplications: true,
                },
            });
        }

        return new FarwaterUser({
            ...farwaterUser,
            client,
        });
    }

    static async fromMinecraftName(client: Client, minecraftName: string): Promise<FarwaterUser | null> {
        const farwaterUser = await prisma.farwaterUser.findFirst({
            where: {
                minecraftName,
            },
            include: {
                minecraftApplications: true,
            },
        });

        if (!farwaterUser) return null;

        return new FarwaterUser({
            ...farwaterUser,
            client,
        });
    }

    async getMinecraftApplications(): Promise<MinecraftApplication[] | null> {
        const { client, discordId } = this.options;
        const applications = await prisma.minecraftApplication.findMany({
            where: {
                discordId,
            },
            include: {
                farwaterUser: true,
            },
        });

        return applications.map(
            (application) =>
                new MinecraftApplication({
                    ...application,
                    client,
                }),
        );
    }

    async getMinecraftApplicationByServerId(serverId: string): Promise<MinecraftApplication | null> {
        const { client, discordId } = this.options;
        const application = await prisma.minecraftApplication.findFirst({
            where: {
                discordId,
                serverId,
            },
            include: {
                farwaterUser: true,
            },
        });

        if (!application) return null;

        return new MinecraftApplication({
            ...application,
            client,
        });
    }

    async update() {
        if (this.options.minecraftName) {
            const userProfile = await fetchMinecraftUser(this.options.minecraftName);
            const minecraftSkinSum = userProfile ? digestSkinHex(userProfile.textures?.raw.value) : "null";
            const minecraftUuid = userProfile ? userProfile.uuid : "null";

            this.options.minecraftSkinSum = minecraftSkinSum;
            this.options.minecraftUuid = minecraftUuid;

            await this.serialize();

            if (await this.offensiveSkin()) {
                this.unwhitelistAll();
                logger.discord(
                    "warn",
                    "found offensive skin while updating user application for " + `<@${this.options.discordId}>`,
                );
            }
        }
    }

    async serialize() {
        const { discordId, minecraftName, minecraftSkinSum, minecraftUuid, age } = this.options;
        await prisma.farwaterUser
            .upsert({
                where: {
                    discordId: discordId,
                },
                update: {
                    minecraftName,
                    minecraftSkinSum,
                    minecraftUuid,
                    age,
                    updatedAt: new Date(Date.now()),
                },
                create: {
                    discordId,
                    age,
                    minecraftName,
                    minecraftSkinSum,
                    minecraftUuid,
                    updatedAt: new Date(Date.now()),
                    createdAt: new Date(Date.now()),
                },
            })
            .catch(logger.error);
    }

    async unwhitelist(serverId: string) {
        const { minecraftName } = this.options;
        if (minecraftName)
            PterodactylPanel.minecraft(serverId)
                .unwhitelist(minecraftName)
                .catch((err) => logger.discord("error", err));
    }

    async whitelist(serverId: string) {
        const { minecraftName } = this.options;
        if (minecraftName)
            PterodactylPanel.minecraft(serverId)
                .whitelist(minecraftName)
                .catch((err) => logger.discord("error", err));
    }

    async whitelistAll(ignoreStatus = false) {
        const { minecraftName } = this.options;
        const applications = await this.getMinecraftApplications();

        if (minecraftName && applications) {
            for (const application of applications) {
                if (application.getOptions().status == MinecraftApplicationReviewStatus.Accepted || ignoreStatus)
                    PterodactylPanel.minecraft(application.getOptions().serverId)
                        .whitelist(minecraftName)
                        .catch((err) => logger.discord("error", err));
            }
        }
    }

    async unwhitelistAll() {
        const { minecraftName } = this.options;
        const applications = await this.getMinecraftApplications();

        if (minecraftName && applications) {
            applications.forEach((application) => {
                PterodactylPanel.minecraft(application.getOptions().serverId)
                    .unwhitelist(minecraftName)
                    .catch((err) => logger.discord("error", err));
            });
        }
    }
}
