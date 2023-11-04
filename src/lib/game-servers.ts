import z from "zod";
import serversJSON from "./game-servers.json";

const gameServerSchema = z.object({
  name: z.string(),
  uuid: z.string(),
  game: z.string()
});

type GameServer = typeof gameServerSchema._type;


export const gameServers = new Map<string, GameServer>();

serversJSON.forEach(server => {
  const s = gameServerSchema.safeParse(server);
  if(s.success) {
    gameServers.set(s.data.name, s.data);
  }
})
