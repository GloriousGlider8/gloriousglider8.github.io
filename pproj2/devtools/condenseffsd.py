import glob
import os
import io

def WriteStrZ(f: io.BufferedWriter, s: str):
	"""ASCII only!"""
	f.write(s.encode("ascii") + b"\x00")

os.chdir(os.path.dirname(__file__))

ffsds = glob.glob("ffsdinput/*.ffsd")

out = open("group.gdfl", "wb")

out.write(b"GDFL\x01")
out.write(len(ffsds).to_bytes(1, "big", signed=False))

for ffsd in ffsds:
   f = open(ffsd, "rb")
   
   assert len(f.read()) == 96
   f.seek(0)
   
   WriteStrZ(out, os.path.basename(ffsd).removesuffix(".ffsd"))
   out.write(b"\x03")
   out.write(f.read())
   
   f.close()

out.close()