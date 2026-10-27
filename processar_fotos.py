#!/usr/bin/env python3
"""Gera as versões redimensionadas (WebP) das fotos de produtos e o arquivo data/produtos.js.

Uso: python3 tools/processar_fotos.py <pasta_com_modelos> [<pasta_do_site>]
  <pasta_com_modelos> deve conter uma subpasta por modelo (nome da subpasta = nome do produto),
  cada uma com os .webp originais. Os originais não são alterados.
"""
import sys, re, json, unicodedata, os
from datetime import datetime
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor
from PIL import Image

SIZES = [480, 960, 1600]
QUALITY = 80
SUFIXOS = {"esportivo": "Esportivo", "esp": "Esportivo", "feminino": "Feminino"}

def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

def nome_bonito(pasta):
    toks = pasta.split()
    return " ".join(t if (t.isupper() and len(t) > 1) else t.capitalize() for t in toks)

def categoria(pasta):
    toks = pasta.lower().split()
    for t in toks:
        if t in SUFIXOS: return SUFIXOS[t]
    if toks and toks[0] == "brincos": return "Brincos"
    return None

def quando(f):
    m = re.search(r"(\d{2})-(\d{2})-(\d{4}),? (\d{2}) (\d{2}) (\d{2})", f.name)
    if m:
        d, mo, y, h, mi, s = map(int, m.groups())
        return datetime(y, mo, d, h, mi, s)
    return datetime.min

def converter(args):
    src, dst_base = args
    im = Image.open(src).convert("RGB")
    for w in SIZES:
        out = Path(f"{dst_base}-{w}.webp")
        if out.exists(): continue
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(out, "WEBP", quality=QUALITY, method=4)
    return True

def main():
    origem = Path(sys.argv[1]); site = Path(sys.argv[2] if len(sys.argv) > 2 else ".")
    destino = site / "img" / "produtos"
    jobs, produtos = [], []
    for pasta in sorted([p for p in origem.iterdir() if p.is_dir()], key=lambda p: p.name.lower()):
        fotos = sorted(pasta.glob("*.webp"), key=lambda f: (quando(f), f.name))
        if not fotos: print("SEM FOTOS:", pasta.name); continue
        pid = slug(pasta.name); (destino / pid).mkdir(parents=True, exist_ok=True)
        lista = []
        for i, f in enumerate(fotos, 1):
            jobs.append((str(f), str(destino / pid / f"{i:02d}"))); lista.append(f"{pid}/{i:02d}")
        p = {"id": pid, "nome": nome_bonito(pasta.name.strip())}
        c = categoria(pasta.name)
        if c: p["categoria"] = c
        p["fotos"] = lista; produtos.append(p)
    with ProcessPoolExecutor() as ex: list(ex.map(converter, jobs, chunksize=8))
    cab = (site / "data" / "produtos.js").read_text(encoding="utf-8").split("window.LPDB_PRODUTOS")[0]
    corpo = ",\n".join("  " + json.dumps(p, ensure_ascii=False) for p in produtos)
    (site / "data" / "produtos.js").write_text(cab + "window.LPDB_PRODUTOS = [\n" + corpo + "\n];\n", encoding="utf-8")
    print(len(produtos), "modelos;", len(jobs), "fotos")

if __name__ == "__main__": main()
