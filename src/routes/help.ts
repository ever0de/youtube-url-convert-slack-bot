import { FastifyInstance } from "fastify";

export const help = async (fastify: FastifyInstance) => {
  fastify.post(`/help`, async () => {
    return `/url <spotify url or youtube music url>
    하고싶은말`;
  });
};
