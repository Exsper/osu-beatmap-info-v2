"use strict";

const utils = require("./utils");
const MapCalculater = require("./MapCalculater");

class BeatmapObject {
    constructor(beatmap, options) {

        this.beatmapId = parseInt(beatmap.beatmap_id);
        this.beatmapSetId = beatmap.beatmapset_id;
        this.mode = parseInt(beatmap.mode);
        this.artist = beatmap.artist;
        this.title = beatmap.title;
        this.diff = beatmap.version;
        this.creator = beatmap.creator;
        this.approved = utils.getApprovedString(beatmap.approved);
        this.bpm = parseFloat(beatmap.bpm);
        this.length = parseInt(beatmap.hit_length);
        // this.maxCombo = parseInt(beatmap.max_combo);
        this.cs = parseFloat(beatmap.diff_size);
        this.ar = parseFloat(beatmap.diff_approach);
        this.od = parseFloat(beatmap.diff_overall);
        this.hp = parseFloat(beatmap.diff_drain);
        // this.stars = parseFloat(beatmap.difficultyrating);

        this.playmode = options.m || this.mode;

        this.options = options;
        /*
        m: options.m,
        mods: options.mods,
        combo: options.combo,
        nmiss: options.countmiss,
        count50: options.count50,
        count100: options.count100,
        count300: options.count300,
        score: options.score,
        acc: options.acc
        */
    }

    async calculateWithMods() {
        let mapCalculater = new MapCalculater(this.beatmapId, this.options);
        let resultPP = await mapCalculater.init(this.playmode);
        let resultStat = mapCalculater.calculateStatWithMods({ ar: this.ar, od: this.od, hp: this.hp, cs: this.cs }, this.options.mods);

        const map = mapCalculater.map;
        if (map.artist_unicode == "") map.artist_unicode = map.artist;
        if (map.title_unicode == "") map.title_unicode = map.title;
        this.beatmapTitle = "谱面 " + this.beatmapId + " " + map.artist_unicode + " - " + map.title_unicode + " (" + map.creator + ") [" + map.version + "]";

        this.stars = resultPP.stars;
        this.maxCombo = resultPP.maxCombo;
        switch (this.playmode) {
            case 0: {
                this.ppString = "pp: " + mapCalculater.pp.pp.toFixed(2) + "pp (aim: " + mapCalculater.pp.Aim.toFixed(0) + "  spd: " + mapCalculater.pp.Speed.toFixed(0) + "  acc: " + mapCalculater.pp.Accuracy.toFixed(0) + ")";
                break;
            }
            case 1: {
                this.ppString = "pp: " + mapCalculater.pp.pp.toFixed(2) + "pp (acc: " + mapCalculater.pp.Accuracy.toFixed(0) + "  strain: " + mapCalculater.pp.Strain.toFixed(0) + ")";
                break;
            }
            case 2: {
                this.ppString = "pp: " + mapCalculater.pp.pp.toFixed(2) + "pp";
                break;
            }
            case 3: {
                this.ppString = "pp: " + mapCalculater.pp.pp.toFixed(2) + "pp (acc: " + mapCalculater.pp.Accuracy.toFixed(0) + "  strain: " + mapCalculater.pp.Strain.toFixed(0) + ")";
                break;
            }
        }

        this.cs = resultStat.cs;
        this.ar = resultStat.ar;
        this.od = resultStat.od;
        this.hp = resultStat.hp;
        this.bpm = this.bpm * resultStat.speed_mul;
        this.length = this.length / resultStat.speed_mul;
        return this
    }

    async toString() {

        await this.calculateWithMods();
        let output = "";
        output = output + this.beatmapTitle + "\n";
        output = output + "set： " + this.beatmapSetId + " 模式： " + utils.getModeString(this.mode) + " 状态： " + this.approved + "\n";
        output = output + "CS" + this.cs.toFixed(1) + "  AR" + this.ar.toFixed(1) + "  OD" + this.od.toFixed(1) + "  HP" + this.hp.toFixed(1) + "\n";
        if (this.playmode !== 3) output = output + "BPM: " + this.bpm.toFixed(0) + " stars: " + this.stars.toFixed(2) + "★ max Combo：" + this.maxCombo + "  时长： " + utils.gethitLengthString(this.length) + "\n";
        else output = output + "BPM: " + this.bpm.toFixed(0) + " stars: " + this.stars.toFixed(2) + "★  时长： " + utils.gethitLengthString(this.length) + "\n";
        output = output + "\n结算 模式: ";
        output = output + utils.getModeString(this.playmode);
        if (this.playmode !== 3) {
            output = output + "  combo: ";
            (this.options.combo) ? output = output + this.options.combo : output = output + this.maxCombo;
        }
        output = output + "  ";
        (this.options.acc) ? output = output + this.options.acc + "%" : output = output + "自动计算acc";
        output = output + "  ";
        (this.options.nmiss) ? output = output + this.options.nmiss + " miss" : output = output + "0 miss";
        if (this.options.count50) output = output + "  " + this.options.count50 + "x50 ";
        if (this.options.count100) output = output + "  " + this.options.count100 + "x100 ";
        if (this.options.count300) output = output + "  " + this.options.count300 + "x300 ";
        if (this.options.score) output = output + "  得分：" + this.options.score;
        output = output + "\n";
        output = output + "使用mod：" + utils.getScoreModsString(this.options.mods) + "\n";
        output = output + this.ppString + "\n";
        output = output + "osu.ppy.sh/b/" + this.beatmapId;
        return output;
    }

    async toStringSimple() {
        await this.calculateWithMods();
        let output = "";
        output = output + this.beatmapSetId + " " + this.artist + " - " + this.title + "[" + this.diff + "] // " + this.creator + "\n";
        output = output + "★" + this.stars.toFixed(2) + " BPM: " + this.bpm.toFixed(0) + "\n";
        output = output + "CS/AR/OD/HP: " + this.cs.toFixed(1) + " / " + this.ar.toFixed(1) + " / " + this.od.toFixed(1) + " / " + this.hp.toFixed(1) + "\n";
        if (this.playmode !== 3) output = output + "Length: " + utils.gethitLengthString(this.length) + "(" + this.maxCombo + "x)\n";
        else output = output + "Length: " + utils.gethitLengthString(this.length) + "\n";
        output = output + "osu.ppy.sh/b/" + this.beatmapId;
        return output;
    }
}

module.exports = BeatmapObject;