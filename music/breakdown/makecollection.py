import os
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

f = open(cid + ".collection", "rb")

songs = {}
name = ""

os.system("cls")

if len(f.read()) > 0:
	f.seek(0)
	name = ReadStrZ(f)
	print(name)
	
	for i in range(int.from_bytes(f.read(2), "big", signed=False)):
		song = {}
		
		song["name"] = ReadStrZ(f)
		song["made"] = ReadStrZ(f)
		
		id = ReadStrZ(f)
		songs[id] = song
		print(f"  [{id}] " + song["name"])
else:
	name = input("Friendly Collection Name: ")

f.close()

while True:
	match input("> "):
		case "exit":
			break
		case "new":
			songs[input("  ID: ")] = {
				"name": input("  Name: "),
				"made": input("  Song Creation Date (DD/MM/YYYY, e.g. 30/11/2025): ")
			}
		case "del":
			del songs[input("  ID: ")]
		case "save":
			f = open(cid + ".collection", "wb")
			
			WriteStrZ(f, name)
			
			f.write(len(songs).to_bytes(2, "big", signed=False))
			for songID in songs.keys():
				song = songs[songID]
				
				WriteStrZ(f, song["name"])
				WriteStrZ(f, song["made"])
				WriteStrZ(f, songID)
			f.close()