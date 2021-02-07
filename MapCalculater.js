"use strict";

const querystring = require('querystring');
const fetch = require('node-fetch')
const ojsama = require("ojsama");

class MapCalculater {
    /**
     * @param {Number} beatmapId 
     * @param {Object} options 
     */
    constructor(beatmapId, options) {
        this.beatmapId = beatmapId;
        this.mods = options.mods;
        this.combo = options.combo;
        this.nmiss = options.nmiss;
        this.count50 = options.count50;
        this.count100 = options.count100;
        this.count300 = options.count300;
        this.score = options.score;
        this.acc = options.acc;
    }

    async apiCall(_path, _data, isText = false) {
        const contents = querystring.stringify(_data);
        const url = "http://localhost:1611/" + _path + '?' + contents;
        if (isText) return await fetch(url, { timeout: 20000 }).then(res => res.text());
        else return await fetch(url, { timeout: 20000 }).then(res => res.json());
    }

    async getBeatmapPath() {
        let data = { id: this.beatmapId };
        let filepath = await this.apiCall("getBeatmap", data, true);
        return filepath;
    }

    async getMap() {
        try {
            const data = { id: this.beatmapId };
            const rawBeatmap = await this.apiCall("getBeatmapText", data, true);
            return rawBeatmap;
        }
        catch (ex) {
            throw "获取谱面失败";
        }
    }

    /**
     * @param {0|1|2|3} mode
     */
    async getApiDiff(mode) {
        try {
            let data = { id: this.beatmapId, m: mode };
            if (this.mods) data.mods = this.mods;
            let diff = await this.apiCall("difficulty", data);
            return diff;
        }
        catch (ex) {
            throw "获取谱面失败";
        }
    }

    /**
     * @param {0|1|2|3} mode
     */
    async getApiPPcal(mode) {
        try {
            let data = { id: this.beatmapId, m: mode };
            if (this.mods) data.mods = this.mods;
            switch (mode) {
                case 0:
                case 1:
                case 2: {
                    if (this.combo) data.combo = this.combo;
                    if (this.nmiss) data.miss = this.nmiss;
                    if (this.acc) data.acc = this.acc;
                    if (this.count50) data["50"] = this.count50;
                    if (this.count100) data["100"] = this.count100;
                    if (this.count300) data["300"] = this.count300;
                    break;
                }
                case 3: {
                    if (this.score) data.score = this.score;
                    break;
                }
            }
            let pp = await this.apiCall("cal", data);
            return pp;
        }
        catch (ex) {
            throw "获取谱面失败";
        }
    }

    calculateStatWithMods(values, mods) {
        return new ojsama.std_beatmap_stats(values).with_mods(mods);
    }

    async init(mode) {
        try {
            const rawBeatmap = await this.getMap();
            const { map } = await new ojsama.parser().feed(rawBeatmap);
            this.map = map;
            const sr = "star rating";
            const mc = "max combo";
            let stars = await this.getApiDiff(mode);
            this.stars = parseFloat(stars[sr]);
            this.maxCombo = parseInt(stars[mc]);
            this.pp = await this.getApiPPcal(mode);
            return this;
        }
        catch (ex) {
            console.log(ex);
            throw "下载谱面出错";
        }
    }
}

module.exports = MapCalculater;