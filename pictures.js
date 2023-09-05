import { createCanvas, loadImage } from 'canvas'

/**
 * 生成一个200×200的图片buffer 二进制字符串
 * @param {string} title 歌曲名字
 * @param {string} singer 歌手名字
 * @param {object} colorConfig 可选,颜色配置对象{bgColor, titleColor, [ singerColor, singerBgColor ]}
 * @return {string} 图片的buffer
 */
function getPicture(title, singer, colorConfig) {
    let picBuf = "";
    //初始化配置
    let bgColor, titleColor,singerColor,singerBgColor;
    if (!colorConfig) colorConfig = {}
    if (!colorConfig.bgColor) {//背景颜色
        bgColor = "#417CA9"
    } else {
        bgColor = colorConfig.bgColor
    }
    if (!colorConfig.titleColor) {//歌曲颜色
        titleColor = "#EDEBE4"
    } else {
        titleColor = colorConfig.titleColor
    }
    if (!colorConfig.singerColor) {//歌手颜色
        singerColor = bgColor
    } else {
        singerColor = colorConfig.singerColor
    }
    if (!colorConfig.singerBgColor) {//歌手名背景颜色
        singerBgColor = titleColor
    } else {
        singerBgColor = colorConfig.singerBgColor
    }


    //设置画布大小200×200
    let width = 200, height = 200
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    //画背景
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    //设置画笔
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    //歌曲名
    ctx.fillStyle = titleColor;
    ctx.font = '70px Sans';
    ctx.fillText(title, width / 2, 10, 180);

    //歌手,歌手名外面包着一个圆角矩形
    ctx.font = '30px Sans';
    //歌手名外的圆角矩形
    fillRoundRect(ctx, 45, 145, 110, 40, 15, singerBgColor)
    //歌手名
    ctx.fillStyle = singerColor;
    ctx.fillText(singer, width / 2, height / 4 * 3, 100);

    loadImage("./Folder.jpg").then(bg => {
        ctx.drawImage(bg, 0, 0, 200, 200);
    })

    //输入jpeg格式文件的buffer
    picBuf = canvas.toBuffer("image/jpeg")

    return picBuf

    /**该方法用来绘制一个有填充色的圆角矩形 
     *@param context:canvas的上下文环境 
     *@param x:左上角x轴坐标 
     *@param y:左上角y轴坐标 
     *@param width:矩形的宽度 
     *@param height:矩形的高度 
     *@param radius:圆的半径 
     *@param fillColor:填充颜色 
     **/
    function fillRoundRect(context, x, y, width, height, radius, /*optional*/ fillColor) {
        //圆的直径必然要小于矩形的宽高          
        if (2 * radius > width || 2 * radius > height) { return false; }

        context.save();
        context.translate(x, y);
        //绘制圆角矩形的各个边  
        drawRoundRectPath(context, width, height, radius);
        context.fillStyle = fillColor || "#000"; //若是给定了值就用给定的值否则给予默认值  
        context.fill();
        context.restore();
    }
    function drawRoundRectPath(context, width, height, radius) {
        context.beginPath(0);
        //从右下角顺时针绘制，弧度从0到1/2PI  
        context.arc(width - radius, height - radius, radius, 0, Math.PI / 2);
        //矩形下边线  
        context.lineTo(radius, height);
        //左下角圆弧，弧度从1/2PI到PI  
        context.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);
        //矩形左边线  
        context.lineTo(0, radius);
        //左上角圆弧，弧度从PI到3/2PI  
        context.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);
        //上边线  
        context.lineTo(width - radius, 0);
        //右上角圆弧  
        context.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);
        //右边线  
        context.lineTo(width, height - radius);
        context.closePath();
    }
}

export {getPicture}