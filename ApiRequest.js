"use strict";

const querystring = require('querystring');
const fetch = require("node-fetch");

class OsuApi {
    static async apiCall(_path, _data, times = 0) {
        const MAX_RETRY = 10;
        try {
            const contents = querystring.stringify(_data);
            const url = "https://osu.ppy.sh/api" + _path + "?" + contents;
            // console.log(url);
            const data = await fetch(url, {
                method: "GET",
                headers: { "Content-Type": "application/octet-stream" },
                credentials: "include",
                timeout: 10000,
            }).then((res) => res.json());
            if (!data) return { code: "error" };
            const dataString = JSON.stringify(data);
            if (dataString === "[]" || dataString === "{}") return { code: 404 };
            return data;
        }
        catch (ex) {
            if (times >= MAX_RETRY) {
                console.log("获取api时超过最大重试次数，停止获取");
                return { code: "error" };
            }
            console.log("获取api列表失败，第" + (times + 1) + "次重试");
            return this.apiCall(_path, _data, times + 1);
        }
    }

    static async getBeatmaps(options) {
        const resp = await this.apiCall('/get_beatmaps', options);
        return resp;
    }

    static async getBeatmapsById(beatmapId, apiKey) {
        const resp = await this.getBeatmaps({k: apiKey, b: beatmapId});
        return resp;
    }
}

module.exports = OsuApi;
