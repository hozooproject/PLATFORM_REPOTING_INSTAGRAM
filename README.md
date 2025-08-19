# PLATFORM_REPOTING_INSTAGRAM
METODE BANNED INSTAGRAM

this is for run termux 
____________________________________________________________

pkg update && pkg update 

pkg install git -y

git clone https://github.com/hozooproject/PLATFORM_REPOTING_INSTAGRAM

cd PLATFORM_REPOTING_INSTAGRAM

pkg install nodejs -y

pkg install npm -y 

npm i fs

npm i  path

npm i axios 

npm i uuid

npm i open 

npm i chalk

npm i ora

npm i  cli-progress

npm i moment 

npm i weather-js

node BAN.js

____________________________________________________________

this is for run linux 
____________________________________________________________

sudo apt update && apt upgrade 

sudo apt install nodejs -y

sudo apt install npm -y

sudo apt install git -y

npm i fs

npm i  path

npm i axios 

npm i uuid

npm i open 

npm i chalk

npm i ora

npm i  cli-progress

npm i moment 

npm i weather-js

chmod +x BAN.js

./BAN.js


____________________________________________________________

<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Instagram BANNED (HTML/CSS)</title>
<style>
  :root{
    --size: 320px;           /* Ubah ukuran ikon di sini */
    --radius: 64px;          /* Lengkungan sudut ikon */
    --stamp-rotate: -15deg;  /* Putar stempel */
  }

  * { box-sizing: border-box; }
  body{
    margin:0;
    min-height:100svh;
    display:grid;
    place-items:center;
    background:#f3f3f3;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  }

  .stage{
    position:relative;
    width:min(90vw, var(--size));
    aspect-ratio: 1 / 1;
  }

  /* Ikon Instagram (kotak gradien) */
  .ig{
    width:100%;
    height:100%;
    border-radius: var(--radius);
    background:
      radial-gradient(120% 120% at 90% 0%, #ffd776 0 30%, transparent 31%),
      radial-gradient(120% 120% at 0% 100%, #c32aa3 0 45%, transparent 46%),
      linear-gradient(135deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5);
    filter: saturate(1.05);
    box-shadow:
      0 18px 40px rgba(0,0,0,.25),
      inset 0 0 0 1px rgba(255,255,255,.25);
    position:relative;
    overflow:hidden;
  }

  /* Garis kamera putih (rounded square) */
  .ig::before{
    content:"";
    position:absolute;
    inset:14% 14%;
    border-radius: 28%;
    border: clamp(8px, 3.5vw, 14px) solid #fff;
  }

  /* Titik lensa */
  .ig::after{
    content:"";
    position:absolute;
    width:14%;
    aspect-ratio:1/1;
    right:22%;
    top:22%;
    border-radius:50%;
    background:#fff;
  }

  /* Stempel BANNED */
  .stamp{
    position:absolute;
    inset:0;
    display:grid;
    place-items:center;
    pointer-events:none;
  }
  .stamp span{
    display:inline-block;
    padding: clamp(10px, 2.2vw, 16px) clamp(18px, 4.2vw, 28px);
    font-weight:900;
    font-size: clamp(26px, 9vw, 72px);
    letter-spacing:.04em;
    text-transform: uppercase;
    border: clamp(6px, 1.5vw, 10px) solid #e51313;
    color:#e51313;
    background:#111;
    transform: rotate(var(--stamp-rotate));
    box-shadow: 0 10px 24px rgba(0,0,0,.35);
    mix-blend-mode: normal;
  }

  /* Label pinggir (opsional) */
  .credit{
    position:fixed;
    bottom:10px; left:0; right:0;
    text-align:center;
    font-size:12px;
    color:#777;
  }
</style>
</head>
<body>
  <div class="stage" role="img" aria-label="Logo Instagram dengan stempel BANNED">
    <div class="ig"></div>
    <div class="stamp"><span>BANNED!</span></div>
  </div>
  <div class="credit">HTML/CSS re-creation • ubah teks/warna via CSS variabel</div>
</body>
</html>
