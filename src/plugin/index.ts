import FastifyFormbody from "@fastify/formbody";
import { WebClient } from "@slack/web-api";
import { FastifyInstance } from "fastify";
import puppeteer from "puppeteer";
import queryString from "query-string";

export const registerPlugins = async (fastify: FastifyInstance) => {
  fastify.register(FastifyFormbody, {
    parser: (str) => queryString.parse(str),
  });

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const slack = new WebClient(process.env.BOT_TOKEN);

  fastify.decorate("browser", browser);
  fastify.decorate("slack", slack);
};

declare module "fastify" {
  export interface FastifyInstance {
    browser: puppeteer.Browser;
    slack: WebClient;
  }
}
