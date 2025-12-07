meta:
  id: gdfl_group
  file-extension: gdfl
  endian: be
seq:
  - id: gdfl_magic
    contents: "GDFL"
  - id: group_magic
    contents: "\x01"
  - id: num_miis
    type: u1
  - id: miis
    type: mii
    repeat: expr
    repeat-expr: num_miis
types:
  mii:
    seq:
      - id: name
        type: strz
        encoding: ASCII
      - id: ver3_magic
        contents: "\x03"
      - id: contents
        size: 96