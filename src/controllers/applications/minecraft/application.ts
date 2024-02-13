import {FarwaterUser} from "@controllers/users/farwater-user";
import {extractEmbedFields} from "@lib/discord/extract-fields";
import {prisma} from "@lib/prisma";
import {logger} from "@logger";
import {
    MinecraftApplicationModel,
    MinecraftApplicationReviewStatus,
    MinecraftAutoReviewResult,
} from "@models/application/application";
import {Client, Message} from "discord.js";
import z from "zod";

const DISCORD_TOS_AGE = 13;

export class MinecraftApplication {
    private _autoReviewResult: MinecraftAutoReviewResult | undefined;
    private _farwaterUser: FarwaterUser | undefined;

    constructor(private options: MinecraftApplicationModel & {client: Client}) {
        this.initializeFarwaterUser();
    }

    getOptions() {
        return this.options;
    }

    async autoReviewResult(): Promise<MinecraftAutoReviewResult> {
        if (!this._farwaterUser) {
            // Handle the case where farwaterUser is null
            return {
                status: MinecraftApplicationReviewStatus.Rejected,
                reason: "other",
            };
        }

        const {age, minecraftUuid} = this._farwaterUser.getOptions();

        if (this._autoReviewResult) return this._autoReviewResult;
        const match = /^[1-9][0-9]?$/;

        if (age) {
            const ageInt = Number.parseInt(age, 10);

            if (!match.test(age)) {
                return {
                    status: MinecraftApplicationReviewStatus.Rejected,
                    reason: "invalidAge",
                };
            }

            if (Number.isNaN(ageInt) || !Number.isSafeInteger(ageInt) || ageInt < DISCORD_TOS_AGE) {
                return {
                    status: MinecraftApplicationReviewStatus.Rejected,
                    reason: "invalidAge",
                };
            }
        }

        if (minecraftUuid === "⚠️NO UUID FOUND⚠️") {
            return {
                status: MinecraftApplicationReviewStatus.NeedsManualReview,
                reason: "noMinecraftAccount",
            };
        }

        if (await this._farwaterUser.offensiveSkin()) {
            return {
                reason: "offensiveMinecraftSkin",
                status: MinecraftApplicationReviewStatus.NeedsManualReview,
            };
        }

        return {
            status: MinecraftApplicationReviewStatus.Accepted,
            reason: "other",
        };
    }

    static fromMinecraftApplicationDecisionMessage = (message: Message): MinecraftApplication => {
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
            roleId: z.string(),
        });

        const embedFields = extractEmbedFields<MinecraftApplicationModel>(embed, embedSchema);
        if (!embedFields) {
            throw new Error("Missing embed fields");
        }
        const reason = embed.description ? embed.description : "";

        return new MinecraftApplication({
            ...embedFields,
            reason,
            client: message.client,
        });
    };

    async serialize() {
        const {discordId, reason, serverId, createdAt, roleId} = this.options;
        await prisma.minecraftApplication
            .upsert({
                where: {
                    discordId_serverId: {
                        discordId,
                        serverId,
                    },
                },
                update: {
                    reason,
                    createdAt,
                    roleId,
                    status: "pending",
                },
                create: {
                    discordId,
                    reason,
                    serverId,
                    createdAt,
                    roleId,
                    status: "pending",
                },
            })
            .catch(logger.error);
    }

    async updateStatus(status: MinecraftApplicationReviewStatus) {
        const {discordId, serverId} = this.options;

        await prisma.minecraftApplication.update({
            where: {
                discordId_serverId: {
                    discordId,
                    serverId,
                },
            },
            data: {
                status,
            },
        });
    }

    async getFarwaterUser(): Promise<FarwaterUser | undefined> {
        if (!this._farwaterUser) {
            await this.initializeFarwaterUser();
        }

        return this._farwaterUser;
    }

    private async initializeFarwaterUser() {
        const {discordId} = this.options;
        const farwaterUser = await prisma.farwaterUser.findUnique({
            where: {
                discordId,
            },
            include: {
                minecraftApplications: true,
            },
        });

        if (!farwaterUser) {
            return null;
        }

        this._farwaterUser = new FarwaterUser({
            ...farwaterUser,
            client: this.options.client,
        });
    }
}
