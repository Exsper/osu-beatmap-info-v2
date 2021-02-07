"use strict";

const Command = require("./Command");

class OsuBeatmapInfo {
    /**
     * @param {Object} params 
     * @param {String} params.apiKey osu Api token，必要
     * @param {String} [params.toMappoolRowCmd] 输出为mappool行格式的指令，默认为mappoolrow
     * @param {String} [params.toCalPPStringCmd] 输出为谱面详细信息的指令，默认为calpp
     * @param {Array<String>} [params.prefixs] 指令前缀，必须为单个字符，默认为[!,！]
     * @param {String} [params.prefix] 兼容旧版，指令前缀，必须为单个字符，默认为!
     * @param {String} [params.prefix2] 兼容旧版，备用指令前缀，必须为单个字符，默认为！
     */
    constructor(params) {
        this.apiKey = params.apiKey || "";
        this.toMappoolRowCmd = params.toMappoolRowCmd || "mappoolrow";
        this.toCalPPStringCmd = params.toCalPPStringCmd || "calpp";
        if (params.prefix || params.prefix2) {
            this.prefix = params.prefix || "!";
            this.prefix2 = params.prefix2 || "！";
            this.prefixs = [this.prefix, this.prefix2];
        }
        else {
            this.prefixs = params.prefixs || ["!", "！"];
        }
    }

    /**
     * 获得返回消息
     * @param {String} message 输入的消息
     */
    async apply(message) {
        try {
            if (!message.length || message.length < 2) return "";
            if (this.prefixs.indexOf(message.substring(0, 1)) < 0) return "";
            let cmd = new Command(message.substring(1).trim());
            let reply = await cmd.apply(this.toMappoolRowCmd, this.toCalPPStringCmd, this.apiKey);
            return reply;
        } catch (ex) {
            console.log(ex);
            return "";
        }
    }

}

module.exports = OsuBeatmapInfo;
// koishi插件
module.exports.name = 'osu-beatmap-info-v2';
module.exports.apply = (ctx, options) => {
    const ob = new OsuBeatmapInfo(options);
    ctx.middleware(async (meta, next) => {
        try {
            const message = meta.message;
            const userId = meta.userId;
            let reply = await ob.apply(userId, message);
            if (reply) {
                await meta.$send(`[CQ:at,qq=${userId}]` + '\n' + reply);
            } else return next();
        } catch (ex) {
            console.log(ex);
            return next();
        }
    })
}



