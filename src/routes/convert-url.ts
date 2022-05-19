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

    if (isSpotifyURL(sentMessage)) {
      const [targetURL, message] = sentMessage.split("\n");

      getYoutubeURLFromSpotify(targetURL, fastify.browser).then((url) => {
        slack.chat
          .postMessage({
            channel: channel_name,
            text: `<@${user_name}> ${url}\n${message ? message : ""}`,
          })
          .catch(() => {
            sendWebhook(response_url, `${channel_name}에 봇을 초대해주세요.`);
          });
      });
      return "";
    }

    if (isYoutubeMusicURL(sentMessage)) {
      getYoutubeURLFromYoutubeMusic(sentMessage).then((url) => {
        slack.chat
          .postMessage({
            channel: channel_name,
            text: `<@${user_name}> ${url}`,
          })
          .catch(() => {
            sendWebhook(response_url, `${channel_name}에 봇을 초대해주세요.`);
          });
      });
      return "";
    }

    if (isYoutubeURL(sentMessage)) {
      slack.chat
        .postMessage({
          channel: channel_name,
          text: `<@${user_name}> ${sentMessage}`,
        })
        .catch(() => {
          sendWebhook(response_url, `${channel_name}에 봇을 초대해주세요.`);
        });

      return "";
    }

    return `Sorry <@${user_name}> Failed convert url: ${sentMessage}`;
  });
};
