import { config } from "@config"
import { messageHasRoleMiddleware } from "@controllers/message-middleware/has-role"
import { Message } from "discord.js"

export const strictApplicationMode = async (message: Message) => {
  if(!messageHasRoleMiddleware(message, config.ADMIN_ROLE_ID)) {
    return
  }
  
}
