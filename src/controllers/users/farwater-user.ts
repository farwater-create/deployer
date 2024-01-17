import {config} from "@config";
import {MinecraftApplication} from "@controllers/applications/minecraft/application";
import {PterodactylPanel} from "@controllers/pterodactyl/pterodactyl";
import {prisma} from "@lib/prisma";
import {logger} from "@logger";
import {FarwaterUserModel} from "@models/user/farwater-user";
import {Client} from "discord.js";

export class FarwaterUser {
    private _offensiveSkin: boolean | undefined;

    constructor(private options: FarwaterUserModel & {client: Client}) {}

    getOptions() {
        return this.options;
    }

    async member() {
        const {client, discordId} = this.options;
        return (await client.guilds.fetch(config.GUILD_ID)).members.fetch(discordId);
    }

    async user() {
        const {client, discordId} = this.options;
        return client.users.fetch(discordId);
    }

    async offensiveSkin(): Promise<boolean> {
        const {minecraftSkinSum} = this.options;
        const {_offensiveSkin} = this;
        if (minecraftSkinSum === "null" || !minecraftSkinSum) return false;
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
        const {minecraftSkinSum} = this.options;
        const offensiveSkin = await this.offensiveSkin();
        if (offensiveSkin && minecraftSkinSum) {
            await prisma.offensiveMinecraftSkin.create({
                data: {
                    hash: minecraftSkinSum,
                },
            });
        }
    }

    async skinURL() {
        const {minecraftUuid} = this.options;
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
        const {client, discordId} = this.options;
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
        const {client, discordId} = this.options;
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

    async serialize() {
        const {discordId, minecraftName, minecraftSkinSum, minecraftUuid, age} = this.options;
        await prisma.farwaterUser
            .upsert({
                where: {
                    discordId: discordId,
                },
                update: {
                    minecraftName,
                    minecraftSkinSum,
                    minecraftUuid,
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
        const {minecraftName} = this.options;
        if (minecraftName)
            PterodactylPanel.minecraft(serverId)
                .unwhitelist(minecraftName)
                .catch((err) => logger.discord("error", err));
    }

    async whitelist(serverId: string) {
        const {minecraftName} = this.options;
        if (minecraftName)
            PterodactylPanel.minecraft(serverId)
                .whitelist(minecraftName)
                .catch((err) => logger.discord("error", err));
    }
}
