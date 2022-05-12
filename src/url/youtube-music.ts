export const getYoutubeURLFromYoutubeMusic = async (url: string) => {
  return url.replace("music.", "");
};
