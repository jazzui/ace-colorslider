
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
    console.log('gotchange', color, range)
    if (!range) return
    var r = editor.getSelectionRange()
      , s = editor.getSelection()
      , txt = utils.colorString(color, mode)
    changing = true
    r.setStart(range.row, range.start)
    r.setEnd(range.row, range.end)
    try {
      console.log('set', r, txt, range)
      s.setRange(r)
      editor.insert(txt)
    } catch (e) {
      console.log('failed!', e, range, txt, color)
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
    mode = color.type
    console.log('got number', color)
    var cursor = query('.ace_cursor', el)
    range = {row: pos.row, start: color.start, end: color.end}
    slider.set(color.color, true)
    slider.show(cursor)
    console.log('change', this, e)
  })
}
