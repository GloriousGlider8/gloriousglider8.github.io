meta:
  id: song
  file-extension: song
  endian: be
seq:
  - id: num_tracks
    type: u1
  - id: tracks
    type: track
    repeat: expr
    repeat-expr: num_tracks
types:
  track:
    seq:
      - id: id
        type: strz
        encoding: ASCII
      - id: name
        type: strz
        encoding: ASCII
      - id: mimetype
        type: strz
        encoding: ASCII
      - id: compressed
        type: u1
      - id: len_content
        type: u4
      - id: content
        size: len_content
      - id: publisher
        type: strz
        encoding: ASCII
      - id: product
        type: strz
        encoding: ASCII
      - id: path
        type: strz
        encoding: ASCII
      - id: patch
        type: strz
        encoding: ASCII