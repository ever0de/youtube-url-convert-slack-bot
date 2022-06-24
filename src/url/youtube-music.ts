export const getYoutubeURLFromYoutubeMusic = async (url: string) => {
  const youtubeURL = url.replace("music.", "");

  if (youtubeURL.includes("&list")) {
    return youtubeURL.slice(0, youtubeURL.indexOf("&list"));
  }

  return youtubeURL;
};
