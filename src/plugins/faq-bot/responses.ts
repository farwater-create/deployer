import { PhraseResponseOptions } from "./phrase-map";

export default [
  {
    keywords: ["ip", "port"],
    response:
      "The ip is already included in the pack for you. If you need it, it's 159.69.139.235:25566.",
  },
  {
    keywords: ["pack", "forge", "download"],
    response:
      "The pack can be downloaded here. https://www.curseforge.com/minecraft/modpacks/farwater/files/4140217 You may use either PrismLauncher, Curseforge, or another third party launcher that supports curseforge packs. For more information see https://discord.com/channels/638990243587948555/1021860358853505045",
  },
  {
    keywords: ["wipe", "reset"],
    response:
      "Farwater Create is a seasonal server - meaning the server will wipe when the community decides it's time to move on to greener pastures. For example, when new versions of the game release, when big breaking changes come to major mods, or when the modding community decides to move to fabric.",
  },
  {
    keywords: ["applications", "long", "apply"],
    response:
      "Applications can take up to three days to process, if your application has taken longer than three days to receive a response, ping staff in this channel.",
  },
  {
    keywords: ["crash", "launch", "crashing"],
    response:
      "Farwater Create has been tested with around 5gb of ram on java 17 on PrismLauncher. Try again a couple times then Check the FAQ Support thread for more information.",
  },
  {
    keywords: ["active", "count"],
    response:
      "The server is fairly active, and the discord even more so. Towards the start of launch is when you'll see the most players.",
  },
  {
    keywords: ["whitelist", "join"],
    response:
      "In order to join the server, you must whitelist yourself, you will need to apply in <#1013903561391874078>",
  },
  {
    keywords: ["forge", "fabric", "version"],
    response: "As of season 7, the server is running on forge 1.18.2",
  },
  {
    keywords: ["bedrock"],
    response: "The server is not compatible with bedrock",
  },
] satisfies PhraseResponseOptions[];
