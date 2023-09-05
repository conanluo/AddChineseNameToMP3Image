import { words2Pinyins } from "./pinyinConvert.js";
import ID3 from "node-id3"
import fs from "fs"
import { getPicture } from './pictures.js'


let isTestMode = false

let songs = []
let path = `D:\\Desktop\\music`
let newPath = path + "_new"

path=`D:\\Users\\music\\00-11年music`
newPath=`f:\\music\\00-11_music`

fs.mkdir(newPath, () => {
    fs.readdir(path, (err, files) => {
        if (err) {
            return console.log("目录不存在", err);
        }
        songs = files
        let transferNumber=0//已转换歌的个数
        try {
            songs.forEach(element => {
                let fileName,music,singer
                //只转化MP3文件
                let elementSuffix = element.substring(element.length - 3).toUpperCase()//获取文件名最后3位
                if (elementSuffix != "MP3") return;

                //初始化文件名,歌手,歌名
                try{
                    fileName = element.replace(" ", "")
                    music = fileName.split("-")[1].replace(".mp3", "").replace(".MP3", "").replace(" ", "")
                    singer = fileName.split("-")[0].replace(" ", "")
                }catch(e){
                    console.log(fileName+"出错")
                    return
                }

                //转化并且复制歌曲
                let musicObj = {
                    music,
                    singer,
                    album: "2000-2011"
                }



                //转换歌曲
                console.log(`转换------${music}------${++transferNumber}`)
                let pathWithFileName=path+"\\"+element
                if (isTestMode) {//在test mode 中 只执行一次,省时间

                    editMusic(pathWithFileName,newPath,musicObj,0)
                    throw new Error("只执行一次,跳出循环")
                } else {
                    editMusic(pathWithFileName,newPath,musicObj,0)
                }


            })
        } catch (e) {console.log(e) }
        console.log(`\n转换完成,一共转换了${transferNumber}首歌`)
    })
})

/**
 * @param {string} pathWithFileName 源文件地址,含源MP3文件名字
 * @param {string} newPath 目的地址,不含新文件名字(函数自动生成)
 * @param {Object} obj {music,singer,[album]} {歌曲名,歌手,专辑} 以中文形式输入,内部有转拼音处理
 * @param {int} pictureStyle 可选，默认值是"样式16"，0是随机，其他参数值对应样式请参考http://www.conanluo.com/2022/08/12/18model_color_sample/
 * 
 */

function editMusic(pathWithFileName, newPath, obj, pictureStyle) {
    let music, singer, album, style, imgData, tag
    //初始化各个参数
    music = obj.music
    singer = obj.singer
    if (!obj.album) {//判断
        album = singer
    } else {
        album = obj.album
    }
    //初始化18样式
    let colorStyle = [
        {//1
            bgColor: "#5B8982",
            titleColor: "#BAC8A0",
            singerColor: "#FFFFFF",
            singerBgColor: "#BAC8A0"
        },
        {//2
            bgColor: "#45545F",
            titleColor: "#CEC6B6"
        },
        {//3
            bgColor: "#D47655",
            titleColor: "#E1F8E1"
        },
        {//4
            bgColor: "#223C5F",
            titleColor: "#E3927F"
        },
        {//5
            bgColor: "#825855",
            titleColor: "#F9ECDF"
        },
        {//6
            bgColor: "#FCDCDF",
            titleColor: "#687AA2"
        },
        {//7
            bgColor: "#331B40",
            titleColor: "#ADC7B5"
        },
        {//8
            bgColor: "#4F586B",
            titleColor: "#DDE2F1"
        },
        {//9
            bgColor: "#1E4173",
            titleColor: "#DFAA48"
        },
        {//10
            bgColor: "#A51840",
            titleColor: "#FDDDB7"
        },
        {//11
            bgColor: "#07553A",
            titleColor: "#CFD468"
        },
        {//12
            bgColor: "#0A164E",
            titleColor: "#F5D040"
        },
        {//13
            bgColor: "#023440",
            titleColor: "#F0EDCC"
        },
        {//14
            bgColor: "#42586E",
            titleColor: "#E3D4AF"
        },
        {//15
            bgColor: "#AE9AAB",
            titleColor: "#F2EBE7"
        },
        {//16
            bgColor: "#417CA9",
            titleColor: "#EDEBE4"
        },
        {//17
            bgColor: "#7379B0",
            titleColor: "#C6EDEC"
        },
        {//18
            bgColor: "#4E2236",
            titleColor: "#F26363",
            singerColor: "#4E2236",
            singerBgColor: "#E997A7"
        }
    ]

    //制作图片

    //判断是不是空值,空值为默认样式16
    if (pictureStyle===undefined) style = 16
    else style = pictureStyle

    let colorConfig//颜色配置
    //判定需要什么颜色,如果输入数字不在1-18,为随机样色
    if (style <= 0 || style > 18) colorConfig = colorStyle[myRandom(0, 17)]
    else colorConfig = colorStyle[style - 1]

    imgData = getPicture(music, singer, colorConfig)

    //制作tag  
    let image, raw; //tag的2个元素
    image = { "mime": "image/jpeg", "type": { "id": 3, "name": "front cover" }, "imageBuffer": imgData }
    raw = { "TALB": "", "TPE1": "", "TIT2": "Hippie", "APIC": { "mime": "image/jpeg", "type": { "id": 3, "name": "front cover" }, "imageBuffer": imgData } }


    //歌名,歌手拼音
    let pyMusic, pySinger
    pyMusic = words2Pinyins(music,true)
    pySinger = words2Pinyins(singer,true)
    tag = {
        title: pyMusic,
        artist: pySinger,//歌手
        album,//专辑
        genre: "",//流派
        composer: "121",
        image,
        raw

    }

    //复制

    try{
        fs.copyFileSync(pathWithFileName, newPath + "/" + pyMusic + ".mp3",fs.constants.COPYFILE_EXCL)
    }catch(e){
        pyMusic=pyMusic+1
        fs.copyFileSync(pathWithFileName, newPath + "/" + pyMusic + ".mp3")
        tag.title=pyMusic+1
    }
    //修改文件
    let outPrint = ID3.update(tag, newPath + "/" + pyMusic + ".mp3")
}

function myRandom(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
}