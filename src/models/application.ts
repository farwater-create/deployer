export interface ApplicationModel {
  discordId: string;
  reason: string;
  age: string;
}

export type MinecraftApplicationModel  = {
  minecraftName: string;
  minecraftUuid: string;
  minecraftSkinSum: string;
} & ApplicationModel;
