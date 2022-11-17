/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable unicorn/no-process-exit */
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
const client = new PrismaClient();
async function main() {
  const applications = await client.WhitelistApplication.findMany();
  const applicationsJSON = JSON.stringify(applications, undefined, 2);
  fs.writeFile("userdata.json", applicationsJSON, (error) => {
    if (error) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
}
main();
