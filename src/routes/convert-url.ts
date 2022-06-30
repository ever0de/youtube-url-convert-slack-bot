import { FastifyInstance } from "fastify";

import { sendWebhook } from "../slack";
import { isSpotifyURL, isYoutubeMusicURL, isYoutubeURL } from "../url/checker";
import { getYoutubeURLFromSpotify } from "../url/spotify";
import { getYoutubeURLFromYoutubeMusic } from "../url/youtube-music";

export const convertURL = async (fastify: FastifyInstance) => {
  fastify.post<{
    Body: {
      text: string;
      user_name: string;
      channel_name: string;
      response_url: string;
    };
  }>(`/convert/url`, async (request) => {
    const { slack } = fastify;
    const {
      text: sentMessage,
      user_name,
      response_url,
      channel_name,
    } = request.body;

    const [url, message] = sentMessage.split("\n");

    const generateMessage = (url: string) => {
      return `<@${user_name}> ${url}\n${message ?? ""}`;
    };

    if (isSpotifyURL(sentMessage)) {
      getYoutubeURLFromSpotify(url, fastify.browser).then((url) => {
        slack.chat
          .postMessage({
            channel: channel_name,
            text: generateMessage(url),
          })
          .catch(() => {
            sendWebhook(response_url, `${channel_name}에 봇을 초대해주세요.`);
          });
      });
      return "";
    }

    if (isYoutubeMusicURL(url)) {
      getYoutubeURLFromYoutubeMusic(url).then((url) => {
        slack.chat
          .postMessage({
            channel: channel_name,
            text: generateMessage(url),
          })
          .catch(() => {
            sendWebhook(response_url, `${channel_name}에 봇을 초대해주세요.`);
          });
      });
      return "";
    }

    if (isYoutubeURL(url)) {
      slack.chat
        .postMessage({
          channel: channel_name,
          text: generateMessage(url),
        })
        .catch(() => {
          sendWebhook(response_url, `${channel_name}에 봇을 초대해주세요.`);
        });

      return "";
    }

    return `Sorry <@${user_name}> Failed convert url: ${url}`;
  });
};
