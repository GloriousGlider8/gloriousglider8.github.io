from markdown_it import MarkdownIt
import glob
import os

md = MarkdownIt()

with open("docgen/base.html", "r") as f:
    BASE = f.read()

for f in glob.glob("docgen/fu-mii/*.md"):
    with open(f, "r") as fi:
        c = fi.read()
    with open(os.path.join("fu-mii", os.path.basename(f).replace(".md", ".html")), "w") as fi:
        fi.write(BASE.replace("{MDHTML}", md.render(c)).replace("{TITLE}", os.path.basename(f).removesuffix(".md").capitalize()))