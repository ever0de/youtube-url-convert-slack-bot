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
      text: targetURL,
      user_name,
      response_url,
      channel_name,
    } = request.body;

    if (isSpotifyURL(targetURL)) {
      getYoutubeURLFromSpotify(targetURL, fastify.browser).then((url) => {
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

    if (isYoutubeMusicURL(targetURL)) {
      getYoutubeURLFromYoutubeMusic(targetURL).then((url) => {
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

    if (isYoutubeURL(targetURL)) {
      slack.chat
        .postMessage({
          channel: channel_name,
          text: `<@${user_name}> ${targetURL}`,
        })
        .catch(() => {
          sendWebhook(response_url, `${channel_name}에 봇을 초대해주세요.`);
        });

      return "";
    }

    return `Sorry <@${user_name}> Failed convert url: ${targetURL}`;
  });
};
