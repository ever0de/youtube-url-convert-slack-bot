import { load } from "cheerio";
import { Browser } from "puppeteer";
import Innertube from "youtubei.js";

const titleClassName = "hVBZRJ";
const creatorClassName = "eHCcSU";

export const getYoutubeURLFromSpotify = async (
  url: string,
  browser: Browser,
) => {
  const page = await browser.newPage();
  await page.goto(url);

  await page.waitForSelector(`.${titleClassName}`);
  const html = await page.content();
  const $ = load(html);
  const title = $(`.${titleClassName}`).text();
  console.log(`found title: ${title}`);
  const creator = $(`.${creatorClassName} > a`).text();
  console.log(`found creator: ${creator}`);

  await page.close();

  const youtube = await new Innertube({ gl: "US" });
  const searchList = await youtube
    .search(`${creator} ${title}`, {
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
