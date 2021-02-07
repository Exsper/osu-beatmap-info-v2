class utils {
    // enabled_mods转为mods数组
    static getScoreMods(enabledMods) {
        let raw_mods = parseInt(enabledMods);
        const Mods = {
            'None': 0,
            'NoFail': 1,
            'Easy': 1 << 1,
            'TouchDevice': 1 << 2,
            'Hidden': 1 << 3,
            'HardRock': 1 << 4,
            'SuddenDeath': 1 << 5,
            'DoubleTime': 1 << 6,
            'Relax': 1 << 7,
            'HalfTime': 1 << 8,
            'Nightcore': 1 << 9, // DoubleTime
            'Flashlight': 1 << 10,
            'Autoplay': 1 << 11,
            'SpunOut': 1 << 12,
            'Relax2': 1 << 13, // Autopilot
            'Perfect': 1 << 14, // SuddenDeath
            'Key4': 1 << 15,
            'Key5': 1 << 16,
            'Key6': 1 << 17,
            'Key7': 1 << 18,
            'Key8': 1 << 19,
            'FadeIn': 1 << 20,
            'Random': 1 << 21,
            'Cinema': 1 << 22,
            'Target': 1 << 23,
            'Key9': 1 << 24,
            'KeyCoop': 1 << 25,
            'Key1': 1 << 26,
            'Key3': 1 << 27,
            'Key2': 1 << 28,
            'ScoreV2': 1 << 29,
            'Mirror': 1 << 30,
            'KeyMod': 521109504,
            'FreeModAllowed': 522171579,
            'ScoreIncreaseMods': 1049662
        };
        let modsArr = [];
        for (const mod in Mods) {
            if (raw_mods & Mods[mod]) modsArr.push(mod);
        }
        return modsArr;
    }

    /**
     * 计算mods数值（指令+号后面的）
     * @param {String} modsString mods字符串，都是两个字母缩写
     * @returns {Number} mods value
     */
    static getEnabledModsValue(modsString) {
        let mods = {
            NM: 0, // None
            NF: 1,
            EZ: 2,
            TD: 4, //TouchDevice
            HD: 8,
            HR: 16,
            SD: 32,
            DT: 64,
            RX: 128, // Relax
            HT: 256,
            NC: 512, // Only set along with DoubleTime. i.e: NC only gives 576
            FL: 1024,
            //Autoplay : 2048,
            SO: 4096,
            AP: 8192,    // Autopilot
            PF: 16384, // Only set along with SuddenDeath. i.e: PF only gives 16416  
            '4K': 32768,
            '5K': 65536,
            '6K': 131072,
            '7K': 262144,
            '8K': 524288,
            FI: 1048576,
            RD: 2097152, //Random
            //Cinema : 4194304,
            //Target : 8388608,
            '9K': 16777216,
            //KeyCoop : 33554432,
            '1K': 67108864,
            '3K': 134217728,
            '2K': 268435456,
            V2: 536870912, //ScoreV2
            MR: 1073741824 // Mirror
            //KeyMod : Key1 | Key2 | Key3 | Key4 | Key5 | Key6 | Key7 | Key8 | Key9 | KeyCoop,
            //FreeModAllowed : NoFail | Easy | Hidden | HardRock | SuddenDeath | Flashlight | FadeIn | Relax | Relax2 | SpunOut | KeyMod,
            //ScoreIncreaseMods : Hidden | HardRock | DoubleTime | Flashlight | FadeIn
        };
        let sum = 0;
        let i = 0;
        let length = modsString.length;
        while (i + 2 <= length) {
            let s = modsString.substring(i, i + 2);
            if (mods[s] !== undefined) {
                if (s === 'NC') sum = sum + mods.DT;
                else if (s === 'PF') sum = sum + mods.SD;
                sum = sum + mods[s];
            }
            i += 2;
        }
        return sum;
    }

    // enabled_mods转为字符串
    static getScoreModsString(enabledMods) {
        const modsArr = this.getScoreMods(enabledMods);
        let abbMods = [];
        let hasV2 = false;
        let hasRelax = false;
        for (let i = 0; i < modsArr.length; i++) {
            switch (modsArr[i]) {
                case "Hidden": { abbMods.push("HD"); break; }
                case "HardRock": { abbMods.push("HR"); break; }
                case "DoubleTime": { abbMods.push("DT"); break; }
                case "Nightcore": { abbMods.push("NC"); break; }
                case "Flashlight": { abbMods.push("FL"); break; }
                case "Easy": { abbMods.push("EZ"); break; }
                case "HalfTime": { abbMods.push("HT"); break; }
                case "NoFail": { abbMods.push("NF"); break; }
                case "SpunOut": { abbMods.push("SO"); break; }
                case "SuddenDeath": { abbMods.push("SD"); break; }
                case "Perfect": { abbMods.push("PF"); break; }
                case "Autopilot": { abbMods.push("AP"); break; }
                case "TouchDevice": { abbMods.push("TD"); break; }
                case "FadeIn": { abbMods.push("FI"); break; }
                case "Random": { abbMods.push("RD"); break; }
                case "Mirror": { abbMods.push("MR"); break; }
                case "Key1": { abbMods.push("1K"); break; }
                case "Key2": { abbMods.push("2K"); break; }
                case "Key3": { abbMods.push("3K"); break; }
                case "Key4": { abbMods.push("4K"); break; }
                case "Key5": { abbMods.push("5K"); break; }
                case "Key6": { abbMods.push("6K"); break; }
                case "Key7": { abbMods.push("7K"); break; }
                case "Key8": { abbMods.push("8K"); break; }
                case "Key9": { abbMods.push("9K"); break; }
                case "ScoreV2": { hasV2 = true; break; }
                case "Relax": { hasRelax = true; break; }
                // default: { abbMods.push(modsArr[i]); break; }
            }
        }
        // 有NC时去掉DT
        const indexDT = abbMods.indexOf("DT");
        const indexNC = abbMods.indexOf("NC");
        if (indexNC >= 0) abbMods.splice(indexDT, 1);
        // 有PF时去掉SD
        const indexSD = abbMods.indexOf("SD");
        const indexPF = abbMods.indexOf("PF");
        if (indexPF >= 0) abbMods.splice(indexSD, 1);

        let modsString = abbMods.join("");
        if (!modsString) modsString = "None"
        // V2放后面
        if (hasV2) modsString = modsString + ", ScoreV2";
        // relax放最后面
        if (hasRelax) modsString = modsString + ", Relax";
        return modsString;
    }

    // mode转string
    static getModeString(mode) {
        if (mode !== 0 && mode !== "0" && !mode) return "当你看到这条信息说明代码有漏洞惹";
        let modeString = mode.toString();
        if (modeString === "0") return "Standard";
        else if (modeString === "1") return "Taiko";
        else if (modeString === "2") return "Catch";
        else if (modeString === "3") return "Mania";
        else return "未知";
    }
    // approved状态转string
    static getApprovedString(approved) {
        if (approved === "4") return "loved";
        else if (approved === "3") return "qualified";
        else if (approved === "2") return "approved";
        else if (approved === "1") return "ranked";
        else if (approved === "0") return "pending";
        else if (approved === "-1") return "WIP";
        else if (approved === "-2") return "graveyard";
        else return "未知";
    }

    // 将秒数转化为分钟：秒
    static gethitLengthString(hitlength) {
        const hl = parseInt(hitlength);
        let min = Math.floor(hl / 60).toString();
        let sec = Math.floor(hl % 60).toString();
        if (min.length === 1) min = "0" + min;
        if (sec.length === 1) sec = "0" + sec;
        return min + ":" + sec;
    }
    
}


module.exports = utils;