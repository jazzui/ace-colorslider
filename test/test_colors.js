
var expect = require('expect.js')
  , utils = require('../utils')


describe('findHexAt', function () {
  it('should find a hex at any place within the hex', function () {
    for (var i=0; i<'#abcabc'.length + 1; i++) {
      expect(utils.findHexAt('h #010a13 other', 'h '.length + i)).to.eql({
        start: 'h '.length,
        end: 'h #010a13'.length,
        type: 'hex',
        color: {r: 1, g: 10, b: 19},
        text: '#010a13'
      })
    }
  })
  it('should not find a hex before the hex', function () {
    for (var i=0; i<5; i++) {
      expect(utils.findHexAt('amsdsh #z10a13 other', i)).to.not.be.ok()
    }
  })
  it('should not find a hex after the hex', function () {
    for (var i=10; i<20; i++) {
      expect(utils.findHexAt('a #z10a13 and thingsd yoiu asd other', i)).to.not.be.ok()
    }
  })
  it('should not find a malformed hex', function () {
    for (var i=0; i<'#zbcabc'.length + 1; i++) {
      expect(utils.findHexAt('h #z10a13 other', 'h '.length + i)).to.not.be.ok()
    }
  })
})

describe('findExpandedAt', function () {
  it('should find a simple expanded color', function () {
    var txt = 'rgb(100, 200, 101)'
    expect(utils.findExpandedAt(txt, 2)).to.eql({
      start: 0,
      end: txt.length,
      type: 'rgb',
      color: {
        r: 100,
        g: 200,
        b: 101
      },
      text: txt
    })
  })
  it('should find a percentage expanded color', function () {
    var txt = 'rgb(100, 20%, 100%)'
    expect(utils.findExpandedAt(txt, 2)).to.eql({
      start: 0,
      end: txt.length,
      type: 'rgb',
      color: {
        r: 100,
        g: 51,
        b: 255
      },
      text: txt
    })
  })
  it('should find an hsl color', function () {
    var txt = 'hsl(340, 100%, 60%)'
    expect(utils.findExpandedAt(txt, 2)).to.eql({
      start: 0,
      end: txt.length,
      type: 'hsl',
      color: {
        r: 255,
        g: 51,
        b: 119
      },
      text: txt

    })
  })
})

describe('colorString', function () {
  var color = {
    r: 255, g: 51, b: 119
  }
  it('should handle hex', function () {
    expect(utils.colorString(color, 'hex')).to.equal('#ff3377')
  })
  it('should handle rgb', function () {
    expect(utils.colorString(color, 'rgb')).to.equal('rgb(255, 51, 119)')
  })
  it('should handle hsl', function () {
    expect(utils.colorString(color, 'hsl')).to.equal('hsl(340, 100%, 60%)')
  })
})

