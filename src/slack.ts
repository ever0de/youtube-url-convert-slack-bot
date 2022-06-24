import axios from "axios";

export const sendWebhook = async (
  url: string,
  text: string,
): Promise<unknown> => {
  return axios.post<unknown>(url, {
    text,
  });
};
