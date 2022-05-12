import axios from "axios";

export const sendWebhook = async (url: string, text: string) => {
  await axios.post(url, {
    text,
  });
};
