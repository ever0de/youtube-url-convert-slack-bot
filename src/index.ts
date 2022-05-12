import puppeteer from "puppeteer";
import { load } from "cheerio";
import Innertube from "youtubei.js";
import Fastify from "fastify";
import FastifyFormbody from "@fastify/formbody";
import queryString from "query-string";

const fastify = Fastify({ logger: true });

const titleClassName = "hVBZRJ";

const spotify = async (url: string) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(url);

  const html = await page.content();
  const $ = load(html);
  const title = $(`.${titleClassName}`).text();

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

fastify.register(FastifyFormbody, { parser: (str) => queryString.parse(str) });

fastify.post<{
  Body: { text: string };
}>(`/convert/url`, async (request) => {
  const { text: targetURL } = request.body;

  if (isSpotifyURL(targetURL)) {
    return await spotify(targetURL);
  }

  if (isYoutubeMusicURL(targetURL)) {
    return await youtubeMusic(targetURL);
  }

  if (isYoutubeURL(targetURL)) {
    return targetURL;
  }

  return "Unknown URL";
});

fastify.listen(3000, "0.0.0.0", (error, address) => {
  if (error) throw error;

  console.log(`Server is now listening on ${address}`);
});
