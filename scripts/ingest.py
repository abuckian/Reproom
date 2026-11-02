# Pulls new anonymous reviews from the ntfy.sh inbox topic, validates them, appends to reviews.json.
import json, urllib.request, re, sys
TOPIC = "reproom-reviews-7f3k9q2xw8"
TRADES = {"Bath","Windows","Roofing","Siding","HVAC","Solar","Pest","Internet"}
data = json.load(open("reviews.json"))
seen = {r["rid"] for r in data} | set(json.load(open("removed.json")))
raw = urllib.request.urlopen(f"https://ntfy.sh/{TOPIC}/json?poll=1&since=all", timeout=30).read().decode()
def clean(s, n): return re.sub(r"\s+", " ", str(s or "")).strip()[:n]
def num(v, lo, hi):
    v = float(v)
    if not lo <= v <= hi: raise ValueError
    return round(v, 1)
added = 0
for line in raw.splitlines():
    try:
        ev = json.loads(line)
        if ev.get("event") != "message": continue
        r = json.loads(ev["message"])
        rid = clean(r.get("rid"), 40)
        if not re.fullmatch(r"[a-z0-9]{8,40}", rid) or rid in seen: continue
        rec = {"rid": rid, "time": ev["time"],
               "company": clean(r["company"], 80), "trade": r["trade"], "city": clean(r.get("city"), 60),
               "leads": num(r["leads"], 0, 60), "close": num(r["close"], 0, 100), "comm": num(r["comm"], 0, 50),
               "emp": r["emp"], "train": bool(r["train"]), "gas": bool(r["gas"]),
               "role": r.get("role") if r.get("role") in ("In-home appointments","Door to door") else "In-home appointments", "stars": int(num(r["stars"], 1, 5)), "text": clean(r["text"], 2000)}
        if not rec["company"] or not rec["text"] or rec["trade"] not in TRADES or rec["emp"] not in ("W-2", "1099"): continue
        data.append(rec); seen.add(rid); added += 1
    except Exception:
        continue
json.dump(data, open("reviews.json", "w"), indent=1)
print(f"added {added}")
