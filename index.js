
var position = require('position')
  , query = require('query')
  , convert = require('color-convert')
  , Slider = require('colorslider')
  
  , utils = require('./utils')

function getColorAt(editor, pos) {
  var line = editor.getSession().doc.getLine(pos.row)
    , range
  range = utils.findHexAt(line, pos.column)
  if (range) return range
  range = utils.findExpandedAt(line, pos.column)
  if (range) return range
}

module.exports = function (editor, el) {
  var slider = new Slider()
    , range = null
    , mode = 'hex'
    , changing = false

  function change(color) {
    if (!range) return
    var r = editor.getSelectionRange()
      , s = editor.getSelection()
      , alpha = color.a !== 1 ? 'a' : ''
      , txt
    if (mode === 'hex') {
      txt = color['rgba']()[alpha ? 'toString' : 'toHex']()
    } else {
      txt = color[mode + alpha]().toString()
    }
    changing = true
    r.setStart(range.row, range.start)
    r.setEnd(range.row, range.end)
    try {
      s.setRange(r)
      editor.insert(txt)
    } catch (e) {
    }
    changing = false
    range.end = range.start + txt.length
  }

  slider.on('change', change)
  editor.getSession().selection.on('changeSelection', function (e) {
    if (changing) return
    var r = editor.getSelectionRange()
      , pos = r.start
      , color
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
    mode = color.type.slice(0, 3) // strip of the "a" from rgba and hsla
    var cursor = query('.ace_cursor', el)
    range = {row: pos.row, start: color.start, end: color.end}
    slider.set(color.text, true)
    slider.show(cursor)
  })
}
