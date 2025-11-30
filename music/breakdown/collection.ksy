meta:
  id: collection
  file-extension: collection
  endian: be
seq:
  - id: name
    type: strz
    encoding: ASCII
  - id: num_songs
    type: u2
  - id: songs
    type: song
    repeat: expr
    repeat-expr: num_songs
types:
  song:
    seq:
      - id: name
        type: strz
        encoding: ASCII
      - id: creation_mm_yyyy
        type: strz
        encoding: ASCII
      - id: id
        type: strz
        encoding: ASCII