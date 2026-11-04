"""Arma la versión final de la landing en UN solo archivo HTML, listo para publicar o enviar.

Toma propuesta-2-voz/index.html y deja dentro del archivo:
  - los estilos (<link rel="stylesheet">) y los scripts (<script src>) locales,
  - los logos y fotos como data URI, también los que arma el JavaScript (casos y beneficio),
  - el PDF de las bases, para que el botón «Bases del concurso» descargue sin otro archivo.
Las tipografías (Google Fonts) se siguen cargando desde internet.

Uso (desde la carpeta proyectos/activa-startup-ia):
    python armar_final.py
Resultado: final/activa-startup-ia.html
"""
import base64, mimetypes, re
from pathlib import Path

AQUI = Path(__file__).resolve().parent
ORIGEN = AQUI / 'propuesta-2-voz' / 'index.html'
DESTINO = AQUI / 'final' / 'activa-startup-ia.html'


def data_uri(ruta: Path) -> str:
    tipo = mimetypes.guess_type(ruta.name)[0] or 'application/octet-stream'
    if ruta.suffix == '.svg':
        tipo = 'image/svg+xml'
    return f'data:{tipo};base64,' + base64.b64encode(ruta.read_bytes()).decode()


def armar() -> None:
    html = ORIGEN.read_text(encoding='utf-8')
    base = ORIGEN.parent

    # Estilos locales
    def css(m):
        ruta = (base / m.group(1)).resolve()
        return f'<style>/* {ruta.name} */\n{ruta.read_text(encoding="utf-8")}\n</style>'
    html = re.sub(r'<link rel="stylesheet" href="((?:\.\./)+[^"]+\.css)">', css, html)

    # Scripts locales (conserva los atributos data-*, que postulacion.js lee de document.currentScript)
    def js(m):
        attrs, src = m.group(1) + m.group(3), m.group(2)
        ruta = (base / src).resolve()
        codigo = ruta.read_text(encoding='utf-8').replace('</script', '<\\/script')
        return f'<script{attrs}>/* {ruta.name} */\n{codigo}\n</script>'
    html = re.sub(r'<script([^>]*?) src="((?:\.\./)+[^"]+\.js)"([^>]*)></script>', js, html)

    # Imágenes que arma el JavaScript: pasan por IMG(), que busca en un mapa con todas las fotos
    imgs = {f'fotos/{f.name}': data_uri(f) for f in sorted((AQUI / 'img' / 'fotos').glob('*.jpg'))}
    html = html.replace('../img/fotos/${foto}.jpg', "${IMG('fotos/' + foto + '.jpg')}")
    html = html.replace('../img/${a.foto}', '${IMG(a.foto)}')
    mapa = '<script>window.__IMG = ' + repr(imgs).replace("'", '"') + ';\nconst IMG = (p) => window.__IMG[p] || p;</script>\n'
    html = html.replace('</head>', mapa + '</head>', 1)

    # Imágenes y PDF con ruta fija
    def archivo(m):
        ruta = (base / m.group(2)).resolve()
        return m.group(1) + data_uri(ruta) + m.group(3) if ruta.exists() else m.group(0)
    html = re.sub(r'((?:src|href)=")((?:\.\./)+(?:img|bases)/[^"$]+\.(?:png|svg|jpg|pdf))(")', archivo, html)

    # El atributo download necesita un nombre cuando el enlace es un data URI
    html = html.replace('" download>', '" download="Bases_Activa_Startup_EBCT_con_IA.pdf">')

    restos = sorted(set(re.findall(r'(?:src|href)="(\.\./[^"]+)"', html)))
    DESTINO.parent.mkdir(exist_ok=True)
    DESTINO.write_text(html, encoding='utf-8')
    print(f'Listo: {DESTINO.relative_to(AQUI)} ({DESTINO.stat().st_size / 1024 / 1024:.1f} MB)')
    if restos:
        print('Enlaces relativos que quedaron sin incluir:', *restos, sep='\n  ')


if __name__ == '__main__':
    armar()
