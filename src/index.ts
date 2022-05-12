import puppeteer from "puppeteer";
import { load } from "cheerio";
import Innertube from "youtubei.js";
import Fastify from "fastify";
import FastifyFormbody from "@fastify/formbody";
import queryString from "query-string";
import { WebClient } from "@slack/web-api";
import dotenv from "dotenv";

dotenv.config();

const fastify = Fastify({ logger: true });

const titleClassName = "hVBZRJ";

const spotify = async (url: string, browser: puppeteer.Browser) => {
  const page = await browser.newPage();
  await page.goto(url);

  await page.waitForSelector(`.${titleClassName}`);
  const html = await page.content();
  const $ = load(html);
  const title = $(`.${titleClassName}`).text();
  console.log(`found title: ${title}`);

  await page.close();

  const youtube = await new Innertube({ gl: "US" });
  const searchList = await youtube
    .search(title, {
      client: "YOUTUBE",
      order: "",
      period: "",
      duration: "",
    })
    .then((data) =>
      (data as any).videos.map((video: any) => ({
        url: video.url,
        title: video.title,
        channelName: video.channel.name,
        viewCount: video.metadata.view_count,
      })),
    );

  console.log(searchList[0].url);
  return searchList[0].url;
};

const youtubeMusic = async (url: string) => {
  return url.replace("music.", "");
};

const isSpotifyURL = (url: string) => {
  return url.includes("spotify.com");
};

const isYoutubeMusicURL = (url: string) => {
  return url.includes("music.youtube.com");
};

const isYoutubeURL = (url: string) => {
  return url.includes("youtube.com");
};

fastify.register(async function () {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const web = new WebClient(process.env.BOT_TOKEN);

  fastify.decorate("browser", browser);
  fastify.decorate("slack", web);
});

fastify.register(FastifyFormbody, { parser: (str) => queryString.parse(str) });

fastify.setErrorHandler((error) => {
  console.error(error);
});

fastify.post<{
  Body: { text: string; user_name: string };
}>(`/convert/url`, async (request, reply) => {
  const { text: targetURL, user_name } = request.body;
  console.log(JSON.stringify(request.body));

  reply.statusCode = 201;
  if (isSpotifyURL(targetURL)) {
    spotify(targetURL, fastify.browser).then((url) => {
      fastify.slack.chat.postMessage({
        channel: `${process.env.CHANNEL}`,
        text: `<@${user_name}> ${url}`,
      });
    });
    return;
  }

  if (isYoutubeMusicURL(targetURL)) {
    youtubeMusic(targetURL).then((url) => {
      fastify.slack.chat.postMessage({
        channel: `${process.env.CHANNEL}`,
        text: `<@${user_name}> ${url}`,
      });
    });
    return;
  }

  if (isYoutubeURL(targetURL)) {
    fastify.slack.chat.postMessage({
      channel: `${process.env.CHANNEL}`,
      text: `<@${user_name}> ${targetURL}`,
    });
    return;
  }

  return;
});

fastify.listen(3000, "0.0.0.0", (error, address) => {
  if (error) throw error;

  console.log(`Server is now listening on ${address}`);
});

declare module "fastify" {
  export interface FastifyInstance {
    browser: puppeteer.Browser;
    slack: WebClient;
  }
}
