import { words2Pinyins } from "./pinyinConvert.js";
import ID3 from "node-id3"
import fs from "fs"
import { getPicture } from './pictures.js'


let isTestMode = false

let songs = []
let path = `D:\\Users\\music\\eason`
let newPath = path + "_new"
let imgPath = newPath + "\\Folder.jpg"
let imgReadPath = `D:\\Users\\music\\eason\\Folder.jpg`
let justone=1
//imgReadPath=imgPath



fs.mkdir(newPath, () => {
    fs.readdir(path, (err, files) => {
        if (err) {
            return console.log("目录不存在", err);
        }
        //console.log(files)
        songs = files
        songs.forEach(element => {
            let music = words2Pinyins(element, true).replace(/([^a-zA-Z0-9\s\.])+/g, "").replace("ChenYiXun", "").replace("Eason", "").replace(" Chan", "")
            music = music.replace("Official MV", "").replace("  ", " ").replace(/^([\s]+)/, "").replace(/^([0][0-4][0-9][\s]+)/, "")


            if (isTestMode) {//测试苦瓜这首歌,节省空间跟时间
                if (music == "1Ge2Ge3Ge4Ge.mp3") editMusic()

            } else {
                editMusic()
            }

            

            function editMusic() {//复制文件,修改文件主函数


                fs.copyFileSync(path + "/" + element, newPath + "/" + music)

                //console.log(music.replace(".mp3","").replace(".MP3",""))
                let image, raw ;
                image={"mime":"image/jpeg","type":{"id":3,"name":"front cover"},"imageBuffer":""}
                raw={"TALB":"","TPE1":"³ÂÞÈÑ¸","TIT2":"Hippie","APIC":{"mime":"image/jpeg","type":{"id":3,"name":"front cover"},"imageBuffer":""}}
                

                if(justone==1){
                    image.imageBuffer==""
                    raw.APIC.imageBuffer = ""
                    console.log(`img:`+JSON.stringify(image))
                    console.log(`raw:`+JSON.stringify(raw))
                    justone=0
                }

                let imgData = getPicture(element.replace(".mp3", "").replace(".MP3", ""), "陈奕迅")
                //imgData = iData

                image.imageBuffer = imgData;
                raw.APIC.imageBuffer = imgData

                console.log(`已完成---`+element.replace(".mp3", "").replace(".MP3", ""))

                let tags = {
                    title: music.replace(".mp3", "").replace(".MP3", ""),
                    artist: "Eason Chan",//歌手
                    album: "1",//专辑
                    genre: "",//流派
                    composer: "121",
                    image,
                    raw
                }
                if (music.split(".")[1] == "mp3" || music.split(".")[1] == "MP3") {
                    let outPrint = ID3.update(tags, newPath + "\\" + music)
                    //printCallback(element, outPrint)
                    //console.log(ID3.read(path+"\\"+"陈奕迅 - Hippie.mp3"))
                    //console.log(ID3.read(path+"\\"+"陈奕迅 - Hippie.mp3").image.imageBuffer.toString())
                }

            }
        });

    })

    //console.log(ID3)
})


