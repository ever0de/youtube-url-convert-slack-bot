import { load } from "cheerio";
import { Browser } from "puppeteer";
import Innertube from "youtubei.js";

const spotifyTitleClassName = "hVBZRJ";

export const getYoutubeURLFromSpotify = async (
  url: string,
  browser: Browser,
) => {
  const page = await browser.newPage();
  await page.goto(url);

  await page.waitForSelector(`.${spotifyTitleClassName}`);
  const html = await page.content();
  const $ = load(html);
  const title = $(`.${spotifyTitleClassName}`).text();
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
