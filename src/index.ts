import puppeteer from "puppeteer";
import { load } from "cheerio";
import Innertube from "youtubei.js";
import Fastify from "fastify";

const fastify = Fastify({ logger: true });

const titleClassName = "hVBZRJ";

const spotify = async (url: string) => {
  const browser = await puppeteer.launch();
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

fastify.post<{
  Body: { url: string };
}>(`/convert/url`, async (request) => {
  const { url: targetURL } = request.body;

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

fastify.listen({ port: 3000 }, (error, address) => {
  if (error) throw error;

  console.log(`Server is now listening on ${address}`);
});
