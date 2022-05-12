import dotenv from "dotenv";
import Fastify from "fastify";

import { registerPlugins } from "./plugin";
import { convertURL } from "./routes/convert-url";

dotenv.config();

const main = async () => {
  const fastify = Fastify({ logger: true });

  await registerPlugins(fastify);
  await convertURL(fastify);

  const address = await fastify.listen(3000, "0.0.0.0");
  console.log(`Server is now listening on ${address}`);
};

main().catch((error) => console.error(error));
