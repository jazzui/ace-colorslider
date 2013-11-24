
var convert = require('color-convert')

module.exports = {
  hexColor: hexColor,
  rgbColor: rgbColor,
  hslColor: hslColor,
  findHexAt: findHexAt,
  findExpandedAt: findExpandedAt
}

function rgbToHsl(color) {
  var res
  if (convert.rgb2hsl) {
    res = convert.rgb2hsl(color.r, color.g, color.b)
  } else {
    res = convert.RGBtoHSL(color.r, color.g, color.b)
    res[0] *= 360
    res[1] *= 100
    res[2] *= 100
  }
  return {
    h: parseInt(res[0]),
    s: parseInt(res[1]),
    l: parseInt(res[2])
  }
}

function hexColor(text) {
  if (text[0]=='#') text = text.slice(1)
  if (text.length === 3) {
    text = text[0] + text[0] + text[1] + text[1] + text[2] + text[2]
  }
  return {
    r:parseInt(text.slice(0, 2), 16),
    g:parseInt(text.slice(2, 4), 16),
    b:parseInt(text.slice(4, 6), 16),
    a:text.length === 8 ? parseInt(text.slice(6, 8), 16)/255 : 1
  }
}

function rgbNum(txt) {
  var p = false
  if (txt[txt.length - 1] === '%') {
    p = true
    txt = txt.slice(0, -1)
  }
  var num = parseInt(txt, 10)
  if (p) num = parseInt(num / 100.0 * 255, 10)
  return num
}

function rgbColor(parts) {
  return {
    r: rgbNum(parts[0]),
    g: rgbNum(parts[1]),
    b: rgbNum(parts[2])
  }
}

function hslColor(parts) {
  var h = parseInt(parts[0], 10)
    , s = parseInt(parts[1], 10)
    , v = parseInt(parts[2], 10)
  var rgb
  if (convert.hsl2rgb) {
    rgb = convert.hsl2rgb(h, s, v)
  } else {
    rgb = convert.HSLtoRGB(h/360, s/100, v/100)
  }
  return {
    r: rgb[0],
    g: rgb[1],
    b: rgb[2]
  }
}

function findHexAt(line, column) {
  var hash = line.slice(0, column + 1).lastIndexOf('#')
  if (hash === -1 || hash < column - 7) return
  var sub = line.slice(hash)
  if (line.slice(hash, column).indexOf(' ') !== -1) return
  var match = sub.match(/^#[a-fA-F0-9]{3,8}/)
  if (!match) return
  match = match[0]
  return {
    start: hash,
    end: hash + match.length,
    type: 'hex',
    color: hexColor(match),
    text: match
  }
}

function findExpandedAt(line, column) {
  var lp = line.slice(0, column + 5).lastIndexOf('(')
  if (lp === -1) return
  var rp = line.slice(column-1).indexOf(')')
  if (rp === -1) return
  // TODO: change first to 4 to enable rgba
  var ln = line[lp-1] === 'a' ? 3 : 3
  var bef = line.slice(lp-ln,lp).toLowerCase()
  if (['rgb', 'rgba', 'hsl', 'hsla'].indexOf(bef) === -1) return
  var inner = line.slice(lp + 1, column + rp - 1)
    , parts = inner.replace(/ /g, '').match(/^(\d+%?),(\d+%?),(\d+%?)/) // (,\d*\.?\d+)?/)
  if (!parts) return
  parts = parts.slice(1)
  return {
    start: lp - bef.length,
    end: column + rp,
    type: bef,
    text: bef + '(' + inner + ')',
    color: bef[0] === 'r' ? rgbColor(parts) : hslColor(parts)
  }
}

