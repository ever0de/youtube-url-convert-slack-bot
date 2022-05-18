import { FastifyInstance } from "fastify";

export const help = async (fastify: FastifyInstance) => {
  fastify.post(`/help`, async () => {
    return `
    \`\`\`
1. /help
2. /url <spotify url or youtube music url>\n<하고싶은말>
    \`\`\`
    `;
  });
};
