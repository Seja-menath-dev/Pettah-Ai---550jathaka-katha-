"use strict";

const textHeight = 60; // Changed font size to 60px
const textCanvas = document.createElement("canvas");
const maxWidth = (textCanvas.width = textCanvas.height = 1024);
const ctx = textCanvas.getContext("2d");
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.font = textHeight + "px Verdana";
ctx.textBaseline = "bottom";
ctx.fillStyle = "#fff"; // White text

function createMultilineText(ctx, textToWrite, maxWidth, text) {
  var currentText = textToWrite;
  var futureText;
  var subWidth = 0;
  var maxLineWidth = 0;

  var wordArray = textToWrite.split(" ");
  var wordsInCurrent, wordArrayLength;
  wordsInCurrent = wordArrayLength = wordArray.length;

  while (ctx.measureText(currentText).width > maxWidth && wordsInCurrent > 1) {
    wordsInCurrent--;
    currentText = futureText = "";
    for (var i = 0; i < wordArrayLength; i++) {
      if (i < wordsInCurrent) {
        currentText += wordArray[i];
        if (i + 1 < wordsInCurrent) currentText += " ";
      } else {
        futureText += wordArray[i];
        if (i + 1 < wordArrayLength) futureText += " ";
      }
    }
  }
  text.push(currentText);
  maxLineWidth = ctx.measureText(currentText).width;

  if (futureText) {
    subWidth = createMultilineText(ctx, futureText, maxWidth, text);
    if (subWidth > maxLineWidth) {
      maxLineWidth = subWidth;
    }
  }

  return maxLineWidth;
}

module.exports = {
  init(texture, textToWrite, paintingWidth = maxWidth) {
    var text = [];
    createMultilineText(
      ctx,
      textToWrite,
      Math.min(paintingWidth * maxWidth, maxWidth),
      text
    );

    ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    for (var i = 0; i < text.length; i++) {
      const yPosition = textCanvas.height - 30 - (text.length - i) * textHeight; // 30px from bottom
      ctx.fillText(text[i], 0, yPosition);
    }

    return texture({
      data: textCanvas,
      min: "mipmap",
      mipmap: "nice",
      flipY: true,
    });
  },
  draw(regl) {
    return regl({
      frag: `
            precision mediump float;
            uniform sampler2D tex;
            varying vec2 uv;
        
            void main () {
                vec4 color = texture2D(tex, uv);
                gl_FragColor = vec4(vec3(1.0), color.a);
            }`,
      vert: `
            precision highp float;
            uniform mat4 proj, view, model;
            uniform float yScale;
            attribute vec2 pos;
            varying vec2 uv;
            void main () {
                uv = pos;
                vec4 mpos = model * vec4(pos, 0.001, 1);
                mpos.y *= yScale;
                gl_Position = proj * view * mpos;
            }`,
      attributes: {
        pos: [0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0],
      },
      uniforms: {
        model: regl.prop("textmodel"),
        tex: regl.prop("text"),
      },
      count: 6,

      blend: {
        enable: true,
        func: {
          srcRGB: "src alpha",
          srcAlpha: "one minus src alpha",
          dstRGB: "one minus src alpha",
          dstAlpha: 1,
        },
        color: [0, 0, 0, 0],
      },
    });
  },
};
