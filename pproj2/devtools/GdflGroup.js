// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kaitai-struct/KaitaiStream'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('kaitai-struct/KaitaiStream'));
  } else {
    root.GdflGroup = factory(root.KaitaiStream);
  }
}(typeof self !== 'undefined' ? self : this, function (KaitaiStream) {
var GdflGroup = (function() {
  function GdflGroup(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  GdflGroup.prototype._read = function() {
    this.gdflMagic = this._io.readBytes(4);
    if (!((KaitaiStream.byteArrayCompare(this.gdflMagic, [71, 68, 70, 76]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([71, 68, 70, 76], this.gdflMagic, this._io, "/seq/0");
    }
    this.groupMagic = this._io.readBytes(1);
    if (!((KaitaiStream.byteArrayCompare(this.groupMagic, [1]) == 0))) {
      throw new KaitaiStream.ValidationNotEqualError([1], this.groupMagic, this._io, "/seq/1");
    }
    this.numMiis = this._io.readU1();
    this.miis = [];
    for (var i = 0; i < this.numMiis; i++) {
      this.miis.push(new Mii(this._io, this, this._root));
    }
  }

  var Mii = GdflGroup.Mii = (function() {
    function Mii(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Mii.prototype._read = function() {
      this.name = KaitaiStream.bytesToStr(this._io.readBytesTerm(0, false, true, true), "ASCII");
      this.ver3Magic = this._io.readBytes(1);
      if (!((KaitaiStream.byteArrayCompare(this.ver3Magic, [3]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([3], this.ver3Magic, this._io, "/types/mii/seq/1");
      }
      this.contents = this._io.readBytes(96);
    }

    return Mii;
  })();

  return GdflGroup;
})();
return GdflGroup;
}));
