export const getYoutubeURLFromYoutubeMusic = async (url: string) => {
  const youtubeURL = url.replace("music.", "");
  const [splitURL, content] = youtubeURL.split(/\n| /);

  if (youtubeURL.includes("&list")) {
    return [splitURL.slice(0, youtubeURL.indexOf("&list")), content].join("\n");
  }

  return youtubeURL;
};
