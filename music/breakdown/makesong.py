import os
import gzip as g
import io

def ReadStrZ(f: io.BufferedReader) -> str:
	"""ASCII only!"""
	x = ""
	while True:
		b: bytes = f.read(1)
		if b == b"\x00" or len(b) == 0:
			break
		x += b.decode("ascii")
	return x

def WriteStrZ(f: io.BufferedWriter, s: str):
	"""ASCII only!"""
	f.write(s.encode("ascii") + b"\x00")

os.chdir(os.path.dirname(__file__))

cid = input("Collection ID: ")
sid = input("Song ID: ")

f = open(cid + "/" + sid + ".song", "rb")

tracks = {}

os.system("cls")

if len(f.read()) > 0:
	f.seek(0)
	
	for i in range(int.from_bytes(f.read(1), "big", signed=False)):
		id = ReadStrZ(f)

		track = {
			"name": ReadStrZ(f),
			"mimetype": ReadStrZ(f),
			"compressed": int.from_bytes(f.read(1), "big", signed=False) == 1,
			"content": f.read(int.from_bytes(f.read(4), "big", signed=False)),
			"publisher": ReadStrZ(f),
			"product": ReadStrZ(f),
			"path": ReadStrZ(f),
			"patch": ReadStrZ(f)
		}
  
		tracks[id] = track
  
		print(f"  [{id}] {track["name"]} - {track["patch"]} ({len(track["content"]) / 1024} KiB)")

f.close()

while True:
	match input("> "):
		case "exit":
			break
		case "save":
			f = open(cid + "/" + sid + ".song", "wb")
			
			f.write(len(tracks).to_bytes(1, "big", signed=False))
			for id in tracks.keys():
				track = tracks[id]
				WriteStrZ(f, id)
    
				WriteStrZ(f, track["name"])
				WriteStrZ(f, track["mimetype"])
				f.write(b"\x01" if track["compressed"] else b"\x00")
				f.write(len(track["content"]).to_bytes(4, "big", signed=False))
				f.write(track["content"])
    
				WriteStrZ(f, track["publisher"])
				WriteStrZ(f, track["product"])
				WriteStrZ(f, track["path"])
				WriteStrZ(f, track["patch"])
			
			f.close()
		case "new":
			id = input("  ID: ")

			tracks[id] = {}
   
			f = open(input("  Content Path: "), "rb")
			buf = f.read()
   
			diff = len(g.compress(buf)) - len(buf)
			print(f"  Compression difference: {"+" if diff > 0 else ""}{diff / 1024} KiB")
   
			tracks[id]["compressed"] = input("  Compressed (y/n): ") == "y"
   
			if tracks[id]["compressed"]:
				tracks[id]["content"] = g.compress(buf)
			else:
				tracks[id]["content"] = buf
   
			f.close()
   
			tracks[id]["name"] = input("  Instrument Name (e.g. Synth Lead, not Amped Square Expresso): ")
			tracks[id]["mimetype"] = input("  Mime Type: ")
   
			tracks[id]["publisher"] = input("  VST Publisher: ")
			tracks[id]["product"] = input("  VST Product: ")
			tracks[id]["path"] = input("  VST Path: ")
			tracks[id]["patch"] = input("  VST Patch: ")
		case "del":
			del tracks[input("  ID: ")]