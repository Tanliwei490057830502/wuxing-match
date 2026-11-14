import json, sys
base = sys.argv[1]
irg = json.load(open(f"{base}/Unihan_IRGSources.json"))["Unihan_IRGSources"]
var = json.load(open(f"{base}/Unihan_Variants.json"))["Unihan_Variants"]
rads = json.load(open(f"{base}/CJKRadicals.json"))["CJKRadicals"]
cp = lambda u: chr(int(u[2:].split("<")[0], 16))
info = {cp(r["codepoint"]): r for r in irg}
trad = {}
for r in var:
    if "kTraditionalVariant" in r:
        trad[cp(r["codepoint"])] = [cp(x) for x in r["kTraditionalVariant"].split()]
def total(c):
    r = info.get(c);  return int(r["kTotalStrokes"].split()[0]) if r and "kTotalStrokes" in r else None
# Kangxi radical stroke counts by radical number (official ranges)
RANGES = [(1,6,1),(7,29,2),(30,60,3),(61,94,4),(95,117,5),(118,146,6),(147,166,7),(167,175,8),(176,186,9),(187,194,10),(195,200,11),(201,204,12),(205,208,13),(209,210,14),(211,211,15),(212,213,16),(214,214,17)]
rad_strokes = {n: k for a, b, k in RANGES for n in range(a, b + 1)}
KEEP_SELF = set("于余范后")
def in_big5(ch):
    try:
        ch.encode("big5"); return True
    except Exception:
        return False
# naming conventions where the name form differs from the rule above
FORCE_TRAD = {"杰": "傑", "叶": "葉", "强": "強", "万": "萬"}
FORCE_STROKES = {"斌": (12, "斌"), "万": (15, "萬")}
NUM = {"一":1,"二":2,"三":3,"四":4,"五":5,"六":6,"七":7,"八":8,"九":9,"十":10}
def kangxi(c):
    if c in NUM: return NUM[c], c
    if c in FORCE_STROKES: return FORCE_STROKES[c]
    if c in FORCE_TRAD:
        c2 = FORCE_TRAD[c]; k, _ = kangxi(c2); return k, c2
    t = c
    if c in trad and c not in KEEP_SELF and not in_big5(c):
        others = [x for x in trad[c] if x != c and x in info]
        if others:
            t = min(others, key=lambda x: total(x) or 99)
    r = info.get(t)
    if not r or "kRSUnicode" in r is False: return None, t
    rs = r.get("kRSUnicode", "").split()[0] if r.get("kRSUnicode") else ""
    if not rs: return total(t), t
    rad, res = rs.split(".")
    if "'" in rad or "\"" in rad: return total(t), t
    res = int(res)
    if res <= 0: return total(t), t
    return rad_strokes[int(rad)] + res, t
chars = []
for hi in range(0xB0, 0xF8):
    for lo in range(0xA1, 0xFF):
        try:
            ch = bytes([hi, lo]).decode("gb2312")
            chars.append(ch)
        except Exception: pass
out = {}
for ch in chars:
    k, t = kangxi(ch)
    if k: out[ch] = (k, t)
print(len(chars), "GB2312 chars,", len(out), "with strokes", file=sys.stderr)
json.dump({c: [k, t] for c, (k, t) in out.items()}, open(sys.argv[2], "w"), ensure_ascii=False)
