export const SwimrankingsRequestOptions: RequestInit = {
  headers: {
    accept: "*/*",
    "accept-language": "nl,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
    priority: "u=1, i",
    "sec-ch-ua":
      '"Not:A-Brand";v="99", "Microsoft Edge";v="145", "Chromium";v="145"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
  },
  referrer: "https://www.swimrankings.net/",
  body: null,
  method: "GET",
  mode: "cors",
  credentials: "include",
};
