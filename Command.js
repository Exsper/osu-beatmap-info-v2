"use strict";

const utils = require("./utils");
const BeatmapObject = require("./BeatmapObject");
const ApiRequest = require("./ApiRequest");
const SayobotSearch = require("./sayobotSearch");

class Command {
    constructor(message) {
        this.message = message;

        this.beatmapId;
        this.options = {};
        this.help = "！calpp [谱面ID/谱面名[难度],] (+mod) (连击cb) (ACC%) (个数x50) (个数x100) (个数x300) (个数miss) (mania分数s) (:模式)\n\
        示例：\n\
        ！calpp 114514 +EZHD 353cb 98.88% 1x50 3x100 400x300 1miss\n\
        ！calpp peppy I love you[hard], +HDFL 998765s :3";
    }

    /**
     * 拆出指令和参数
     * @param {RegExp} commandReg 
     * @returns {Boolean} 消息是否符合指令形式
     */
    cutCommand() {
        const mr = /^([a-zA-Z]+)\s/i.exec(this.message);
        if (mr === null) return false;
        else {
            this.commandString = mr[1].toLowerCase();
            this.argString = this.message.substring(this.commandString.length).trim() + " ";
            return true;
        }
    }

    /**
     * 模式字符串转mod
     * @param {String} modeString 模式字符串
     * @returns {0|1|2|3}
     */
    getMode(modeString) {
        let s = modeString.toString().trim().toLowerCase();
        if (s === "0" || s === "1" || s === "2" || s === "3") return parseInt(s);
        else if (s.indexOf("std") >= 0) return 0;
        else if (s.indexOf("standard") >= 0) return 0;
        else if (s.indexOf("click") >= 0) return 0;
        else if (s.indexOf("泡泡") >= 0) return 0;
        else if (s.indexOf("taiko") >= 0) return 1;
        else if (s.indexOf("鼓") >= 0) return 1;
        else if (s.indexOf("catch") >= 0) return 2;
        else if (s.indexOf("ctb") >= 0) return 2;
        else if (s.indexOf("接") >= 0) return 2;
        else if (s.indexOf("mania") >= 0) return 3;
        else if (s.indexOf("key") >= 0) return 3;
        else if (s.indexOf("骂娘") >= 0) return 3;
        else if (s.indexOf("琴") >= 0) return 3;
        else if (s === "s") return 0;
        else if (s === "t") return 1;
        else if (s === "c") return 2;
        else if (s === "m") return 3;
        else return 0;
    }

    /**
     * 分析argString
     * ！calpp peppy I love you[hard], +EZHD 353cb 98.88% 1x50 3x100 400x300 1miss 998765s :3
     */
    async getArgObject() {
        let ar;
        ar = /^([0-9]+)/.exec(this.argString);
        if (ar) this.beatmapId = parseInt(ar[1]);
        else {
            ar = /^(.+)[,，]/.exec(this.argString);
            if (ar) {
                let keyword = ar[1];
                let diffname = "";
                let br = /.+\[(.*)\]/.exec(keyword);
                if (br) {
                    diffname = br[1];
                    keyword = keyword.split("[")[0];
                }
                let beatmapSetId = await SayobotSearch.searchList(keyword);
                this.beatmapId = await SayobotSearch.search(beatmapSetId, diffname);
            }
            else throw this.help;
        }

        ar = /[:：]([^+＋:：%,，]+)\s/i.exec(this.argString);
        if (ar) this.options.m = this.getMode(ar[1]);

        ar = /[+＋]([a-zA-Z0-9]+)\s/i.exec(this.argString);
        if (ar) this.options.mods = utils.getEnabledModsValue(ar[1]);

        ar = /([0-9]+)cb\s/.exec(this.argString);
        if (ar) this.options.combo = parseInt(ar[1]);

        ar = /([0-9]{1,}[.]?[0-9]*?)%\s/.exec(this.argString);
        if (ar) this.options.acc = parseFloat(ar[1]);

        ar = /([0-9]+)miss\s/.exec(this.argString);
        if (ar) this.options.nmiss = parseInt(ar[1]);

        ar = /([0-9]+)x50\s/.exec(this.argString);
        if (ar) this.options.count50 = parseInt(ar[1]);
        ar = /([0-9]+)x100\s/.exec(this.argString);
        if (ar) this.options.count100 = parseInt(ar[1]);
        ar = /([0-9]+)x300\s/.exec(this.argString);
        if (ar) this.options.count300 = parseInt(ar[1]);

        ar = /([0-9]+)s\s/.exec(this.argString);
        if (ar) this.options.score = parseInt(ar[1]);

    }

    async apply(toMappoolRowCmd, toCalPPStringCmd, apiKey) {
        try {
            if (!this.cutCommand()) return "";
            if ((this.commandString !== toMappoolRowCmd) && (this.commandString !== toCalPPStringCmd)) return "";
            await this.getArgObject();
            let beatmapInfo = await ApiRequest.getBeatmapsById(this.beatmapId, apiKey);
            if (beatmapInfo.length <= 0) return "查询不到该beatmap（谱面setId：" + this.beatmapId + "）";
            let beatmapObject = new BeatmapObject(beatmapInfo[0], this.options);
            if (this.commandString === toMappoolRowCmd) return await beatmapObject.toStringSimple();
            if (this.commandString === toCalPPStringCmd) return await beatmapObject.toString();
            return "";
        }
        catch (ex) {
            return ex;
        }
    }

}

module.exports = Command;