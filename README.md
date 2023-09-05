[中文说明](https://github.com/conanluo/AddChineseNameToMP3Image/blob/main/readme.md)
### 1. There is a problem
I live in the United States, and my car has no Chinese display, so I don’t know what the name is when I listen to the song, so I want to write a program of `electron+vue` to convert my music files into pinyin.

### Chinese to pinyin dictionary
```
let dict={
     "a": "\u554a\u963f\u9515",
     "ai": "\u57c3\u6328\u54ce\u5509\u54c0...",
     "an": "\u978d\u6c28\u5b89\u4ffa\u6309\u6697...",
     ...
     ...
}
```

In this form, put the Chinese corresponding to the pinyin together. Then get such a data dictionary.

### Translate
Because the dictionary uses unicode encoding, so console.log("\u554a"), directly enter "ah" in the background
In other words, "\u554a"=="啊" is true.
According to this, we only need to traverse the dictionary.
If Eason Chan’s "The Lonely Brave Man" is compiled, it will be guyongzhe, but this is not very intuitive, so it is necessary to use camel case or to separate each word with a space. Because I don’t know what the central control of my car can display The effect, so I wrote both ways.

```
//First capitalize the beginning of each word, expand the prototype of String, and add a method for easy use
String.prototype.firstUpperCase = function(){
     return this.replace(/\b(\w)(\w*)/g, function($0, $1, $2) {
         return $1.toUpperCase() + $2.toLowerCase();
     });
}

/**
  * @param {string} zh : input text,
  * @param {boolean} isCapitalFirstLetter : whether the first letter is capitalized, the default is all lowercase
  * @return {string} Returns the escaped pinyin
  */
export function zh2pinyin(zh,isCapitalFirstLetter){
     let py="";
     for(let val in dict){
         if(dict[val].indexOf(zh)!=-1){
             py=isCapitalFirstLetter?val.firstUpperCase():val;
          break;
         }
      }
     return py==""?zh:py;
};

```

`zh2pinyin(zh,isCapitalFirstLetter)` is only a single text conversion, we also need to convert the entire song title.

```
/**
  * @param {string} words A string of words to be converted
  * @param {boolean} isNoSpace Whether there is a space, there is a space between each pinyin by default, if there is no space, the camel case will be used
  * @returns {string} Returns the transferred pinyin
  */
export function words2Pinyins(words,isNoSpace){
     let space=isNoSpace?"":" ";

     let pinyins="";
     let wordsArr=words. split("")
     wordsArr.forEach(word=>{//Traverse each word, escape and piece together.
         let sp=space // space after each word
         if(/^[0-9a-zA-Z\s+\.\`\']/.test(word)) sp="" //Whether it is an English number or " . ", if yes, no space is required.
         pinyins+=zh2pinyin(word,isNoSpace)+sp
     })
     return pinyins
}
```

Everything is ready and ready to use.

### Convert Traditional Chinese to Simplified Chinese
Wait~~~What?? Still have questions?
Yes, because Chinese has simplified and traditional characters, the songs obtained from some special channels may be in traditional characters. So I also need to write a method conversion

Because there is basically a one-to-one correspondence between traditional and simplified characters, so we don’t need to use a dictionary in the form of an object. We only need to arrange the traditional characters into a string one by one, and write them into two strings of simplified and traditional. Here Pack these two strings into an array.
```
let dictionarys = [
    '锕皑蔼碍爱嗳....',
	'錒皚藹礙愛噯....'
]
```

In order to reuse this method in the future, I write out the method of calling in complex and simplified
```
/**
  * @param {string} word input text
  * @param {boolean} isS2T Whether to convert Simplified Chinese to Traditional Chinese
  * @return {string} return the translated text
  */

function zhConvert(word,isS2T){
     let wordsPool=isS2T?dictionarys[0]:dictionarys[1] // original word pool
     let convertPool=isS2T?dictionarys[1]:dictionarys[0] // escape font pool
     let converted=word
     if(wordsPool.indexOf(word)!=-1){//Judge whether the word is in the original font, if so, escape
         converted=convertPool.charAt(wordsPool.indexOf(word))
     }
     return converted
}
```
For the convenience of use, I expose 2 functions separately, from traditional to simplified, and from simplified to traditional
```
/**
  * @param {string} word input text
  * @return {string} return the translated text
  */
function simplified2Traditional(word){
     return zhConvert(word,true)
}
/**
  * @param {string} word input text
  * @return {string} return the translated text
  */
function traditional2Simplified(word){
     return zhConvert(word)
}
export {simplified2Traditional, traditional2Simplified}
```
Finally, don’t forget to modify the zh2pinyin function, because the pinyin dictionaries are all simplified, so directly convert traditional to simplified

```
/**
  * @param {string} zh : input text,
  * @param {boolean} isCapitalFirstLetter : whether the first letter is capitalized, the default is all lowercase
  * @return {string} Returns the escaped pinyin
  */
export function zh2pinyin(zh,isCapitalFirstLetter){
     let py=zh;
     let zh2=traditional2Simplified(zh, true)//Convert traditional Chinese characters into simplified Chinese characters
     for(let val in dict){ //Look for the text to traverse and find the corresponding pinyin
         if(dict[val].indexOf(zh2)!=-1){
             py=isCapitalFirstLetter? val. firstUpperCase(): val;
          break
         }
      }
     return py;
};

```
Since then, the function of converting Chinese characters to pinyin has been completed


### 2. Modify the file
After completing the pinyin conversion, we will start to convert the information of our music files. Of course, to convert the information, we need to copy the files, after all, our files are to be placed in the car.

```
import { words2Pinyins } from "./pinyinConvert.js";
import fs from "fs"

let songs=[]

let path="d:\\desktop\\music" //folder to be converted
let newPath=paht+"_new" //After the conversion, modify the file in the form of copy to avoid polluting the source file.
fs.mkdir(newPath,()=>{
     fs.readdir(path,(err,files)=>{
         if(err){
             return console.log("The directory does not exist", err);
         }
         songs=files
         songs. forEach(element => {
             let music=words2Pinyins(element,true)
fs.copyFileSync(path+"/"+element, newPath+"/"+music)
             console. log(music)
         });
     })
})
```
Easily solve the file name modification, call it a day

### Three, an error occurred
I thought that writing such a simple thing could solve the display problem, but it turned out to be too young. It’s just because I didn’t understand the information of music files.
The player displays the information of the music file, not the file name. I just simply modify the file name. For those files that have no music information (tags information) at all, this way of writing can still be used. The problem is that most There will be nothing in the music file. So this way of writing is doomed to fail.

And these file information exists in the string at the end of the music file. In binary form. There are many patterns, such as id3, id4 and so on.

So I crawled the Internet to find some related apis, and I found 2 modules on [npm.io](https://npm.io). So I started the whole process.

One of them is node-id3
The other is jsmediatags

In the end I chose node-id3
```
npm i node-id3 --save
```

Finally
```
import { words2Pinyins } from "./pinyinConvert.js";
import ID3 from "node-id3"
import fs from "fs"

let songs=[]

let path=`d:\\desktop\\music`
let newPath=path+"_new"
//path=newPath
fs.mkdir(newPath,()=>{
     fs.readdir(path,(err,files)=>{
         if(err){
             return console.log("The directory does not exist", err);
         }
         //console. log(files)
         songs=files
         songs. forEach(element => {
             let music=words2Pinyins(element,true)
             fs.copyFileSync(path+"/"+element, newPath+"/"+music)
             console.log(music.replace(".mp3","").replace(".MP3",""))
             let tags={//Modified information, I wrote it dead here, because I don't want redundant information to affect the interface. Modify it according to your needs. title:music.replace(".mp3","").replace(".MP3" ,""),artist: "Eason Chan",
                 album: "1"
             } console.log(ID3.write(tags,newPath+"\\"+music))
         });
     })

     //console.log(ID3)
})
```

Get it done, let's see if it can be displayed. Everything is ready, and the next chapter will start to make desktop applications.

### Modify the picture
Modifying tags information One of the entertainment items is to modify pictures. I changed all my songs to my avatar. Of course, I still use node-id3 to modify tags information

The tags object in node-id3 uses APIC of `image` and `raw` to save image information.
```
tags={
...
image: {
...
"imageBuffer": "<Buffer 08 95...>",
...
},
...
raw: {
...
APIC: {
...
"imageBuffer": "<Buffer 08 95...>",
...
}
}
...
}
```
So we only need to read the pictures we need in binary form and write them to these two locations.

```
import ID3 from "node-id3"

//Read the image we need
fs.readFile(path+"\\myImage.jpg",(errImg,imgData)=>{
     if(errImg) throw errImg;
...
// I took all the original tags information and only modified the imageBuffer
let {image,raw} = ID3. read(path)
image.imageBuffer=imgData;
     raw.APIC.imageBuffer=imgData
let tags={
title:music.replace(".mp3","").replace(".MP3",""),
         artist: "Eason Chan",
image,
raw
}
...
})

```

That's it, the picture is embedded in the song file.

<font color="red"> Is there a link to the picture directly? Then there is no need to make every song so big. Sorry, I didn’t find node-id3 has modified this when I checked the documentation. So I will look for it later Find out if there are other APIs available, or write one for modification...But, with templates, who wants to reinvent the wheel?</font>
