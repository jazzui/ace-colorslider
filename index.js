
var position = require('position')
  , query = require('query')
  , convert = require('color-convert')
  , Slider = require('colorslider')

function hexColor(text) {
  return {r:0, g:0, b:0}
}

function rgbColor(parts) {
  return {r:255, g:0, b:0}
}

function hslColor(parts) {
  return {r:255, g:255, b:0}
}

function findHexAt(line, pos.column) {
  var hash = line.slice(0, pos.column).lastIndexOf('#')
  if (hash === -1 || hash < pos.column - 7) return
  var sub = line.slice(hash)
  if (line.slice(hash, pos.column).indexOf(' ') !== -1) return
  var match = sub.match(/^#[a-fA-F0-9]{3,6}/)
  if (!match) return
  return {
    start: hash,
    end: hash + match.length,
    type: 'hex',
    color: hexColor(match),
    text: match
  }
}

function findExpandedAt(line, pos.column) {
  var lp = line.slice(0, pos.column).lastIndexOf('(')
  if (lp === -1) return
  var rp = line.slice(pos.column).indexOf(')')
  if (rp === -1) return
  // TODO: change first to 4 to enable rgba
  var ln = line[lp-1] === 'a' ? 3 : 3
  var bef = line.slice(lp-ln,lp).toLowerCase()
  if (['rbg', 'rgba', 'hsl', 'hsla'].indexOf(bef) === -1) return
  var inner = line.slice(lp + 1, pos.column + rp)
    , parts = inner.replace(/ /g, '').match(/^(\d+),(\d+)%?,(\d+)%?(,\d*\.?\d+)?/)
  if (!parts) return
  return {
    start: lp - bef.length,
    end: pos.column + rp + 1,
    text: bef + '(' + inner + ')',
    color: bef[0] === 'r' ? rgbColor(parts) : hslColor(parts)
  }
}

function getColorAt(editor, pos) {
  var line = e.getSession().doc.getLine(pos.row)
    , range
  range = findHexAt(line, pos.column)
  if (range) return range
  range = findExpandedAt(line, pos.column)
  if (range) return range
}

module.exports = function (editor, el) {
  var slider = new Slider()
    , range = null
    , changing = false

  function change(color) {
    console.log('gotchange', number, range)
    if (!range) return
    var r = editor.getSelectionRange()
      , s = editor.getSelection()
      , txt = number + ''
    changing = true
    r.setStart(range.row, range.start)
    r.setEnd(range.row, range.end)
    try {
      console.log('set', r, txt, range)
      s.setRange(r)
      editor.insert(txt)
    } catch (e) {
      console.log('failed!', e, range, txt, number)
    }
    changing = false
    range.end = range.start + txt.length
  }

  slider.on('change', change)
  editor.getSession().selection.on('changeSelection', function (e) {
    if (changing) return
    var r = editor.getSelectionRange()
      , pos = r.start
      , num
    if (!r.isEmpty()) {
      range = null
      try {
        slider.hide()
      } catch (e) {}
      return
    }
    try {
      color = getColorAt(editor, pos)
    } catch (e) {
      range = null
      try {
        slider.hide()
      } catch (e) {}
      return
    }
    if (!color) {
      range = null
      try {
        slider.hide()
      } catch (e) {}
      return
    }
    console.log('got number', color)
    var cursor = query('.ace_cursor', el)
    range = {row: pos.row, start: color.start, end: color.end}
    slider.set(color.color, true)
    slider.show(cursor)
    console.log('change', this, e)
  })
}
