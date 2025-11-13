hljs.registerLanguage('fusion', () => ({
    case_insensitive: false,
    keywords: {
      keyword: 'for if while class enum public protected internal new const static case switch is assert return',
      literal: "false true null void",
      type: "short ushort int uint long string byte bool",
      title: "Console Math Convert Encoding"
    },
    contains: [
      {
        className: 'string',
        begin: '"',
        end: '"'
      }, {
        className: 'string',
        begin: "'",
        end: "'"
      }, {
        className: "number",
        begin: "[0-9]+?"
      }, {
        className: "selector-class",
        begin: "(?<=\\bclass\\s+?)[A-Za-z0-9_]+"
      }, {
        className: "selector-class",
        begin: "(?<=\\benum\\s+?)[A-Za-z0-9_]+"
      }, {
        className: "keyword",
        begin: "\\bnative\\b",
        contains: [
          {
            className: "unformatted",
            begin: "(?<=native) {\n.*?(?:\\n.*?)+?}",
            subLanguage: false
          }
        ],
        relevance: 10
      }, {
        className: 'doctag',
        begin: "\\/\\/\\/.*?\n"
      }, {
        className: "comment",
        begin: "//",
        end: "\n"
      }, {
        className: "comment",
        begin: "/\\*",
        end: "\\*/"
      }, {
        className: "special",
        begin: "#[a-zA-Z _0-9-]+?\n"
      }, {
        className: "type",
        begin: "(?<!\\.)\\b[A-Z][A-Za-z0-9_]*?\\b"
      }
    ]
}))
