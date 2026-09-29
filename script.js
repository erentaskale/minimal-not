const not = document.getElementById("not");
const menu = document.getElementById("menu");
const durum = document.getElementById("durum");
const sayac = document.getElementById("sayac");
const kayitDurumu = document.getElementById("kayitDurumu");
const bildirim = document.getElementById("bildirim");

// Tarayıcı depolaması (gizli modda engellenebilir, o yüzden try/catch)
function oku(anahtar) {
  try {
    return localStorage.getItem(anahtar);
  } catch (e) {
    return null;
  }
}

function yaz(anahtar, deger) {
  try {
    localStorage.setItem(anahtar, deger);
    return true;
  } catch (e) {
    return false;
  }
}

// Kaydırma konumunu koru: yazı boyutu ya da pencere değişince
// ekranda aynı bölüm kalsın, sayfa başka yere atlamasın
let kaydirmaOrani = 0;

function oranHesapla() {
  const alan = not.scrollHeight - not.clientHeight;
  kaydirmaOrani = alan > 0 ? not.scrollTop / alan : 0;
}

function oranUygula() {
  const alan = not.scrollHeight - not.clientHeight;
  not.scrollTop = kaydirmaOrani * alan;
}

not.addEventListener("scroll", oranHesapla);
window.addEventListener("resize", oranUygula);

// Yazı boyutu (hatırlanır)
let boyut = Number(oku("boyut")) || 18;
let olcek = 1; // bazı fontlar aynı boyutta küçük görünür, onları biraz büyütürüz

function boyutUygula() {
  not.style.fontSize = boyut * olcek + "px";
}

boyutUygula();

function boyutAyarla(fark) {
  const yeni = fark === 0 ? 18 : Math.min(40, Math.max(12, boyut + fark));
  if (yeni === boyut) return;
  oranHesapla();
  boyut = yeni;
  boyutUygula();
  oranUygula();
  yaz("boyut", boyut);
  not.focus({ preventScroll: true });
}

document.getElementById("buyut").addEventListener("click", () => boyutAyarla(2));
document.getElementById("kucult").addEventListener("click", () => boyutAyarla(-2));

// Tema: karanlık / aydınlık (hatırlanır)
document.getElementById("tema").addEventListener("click", () => {
  const aydinlik = document.documentElement.classList.toggle("aydinlik");
  yaz("tema", aydinlik ? "aydinlik" : "karanlik");
  not.focus({ preventScroll: true });
});

// Font seçici: listeden seçilen font sadece ekrandaki görünümü değiştirir
const fontlar = [
  { id: "jetbrains", ad: "JetBrains Mono", tur: "Kod", aile: '"JetBrains Mono", Consolas, monospace', olcek: 1 },
  { id: "courier", ad: "Courier Prime", tur: "Daktilo", aile: '"Courier Prime", "Courier New", monospace', olcek: 1.05 },
  { id: "inter", ad: "Inter", tur: "Modern", aile: '"Inter", "Segoe UI", sans-serif', olcek: 1 },
  { id: "lora", ad: "Lora", tur: "Klasik", aile: '"Lora", Georgia, serif', olcek: 1.05 },
  { id: "nunito", ad: "Nunito", tur: "Yumuşak", aile: '"Nunito", "Segoe UI", sans-serif', olcek: 1.03 },
  { id: "caveat", ad: "Caveat", tur: "El yazısı", aile: '"Caveat", cursive', olcek: 1.35 }
];

const fontPaneli = document.getElementById("fontPaneli");
const fontButonu = document.getElementById("fontSec");

fontlar.forEach((font) => {
  const secenek = document.createElement("button");
  secenek.dataset.font = font.id;
  secenek.style.fontFamily = font.aile;
  secenek.innerHTML = "<span>" + font.ad + "</span><small>" + font.tur + "</small>";
  secenek.addEventListener("click", () => {
    fontUygula(font.id);
    yaz("font", font.id);
    fontPaneliKapat();
    bildir("Font: " + font.ad);
    not.focus({ preventScroll: true });
  });
  fontPaneli.appendChild(secenek);
});

function fontUygula(id) {
  const font = fontlar.find((f) => f.id === id) || fontlar[0];
  oranHesapla();
  not.style.fontFamily = font.aile;
  olcek = font.olcek;
  boyutUygula();
  oranUygula();
  fontPaneli.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("secili", b.dataset.font === font.id);
  });
}

function fontPaneliKapat() {
  fontPaneli.classList.remove("acik");
  fontButonu.setAttribute("aria-expanded", "false");
}

fontButonu.addEventListener("click", (e) => {
  e.stopPropagation();
  const acik = fontPaneli.classList.toggle("acik");
  fontButonu.setAttribute("aria-expanded", String(acik));
});

// Panel dışına tıklayınca, Esc'ye basınca ya da yazmaya başlayınca kapan
document.addEventListener("click", (e) => {
  if (!fontPaneli.contains(e.target)) fontPaneliKapat();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fontPaneliKapat();
});
not.addEventListener("input", fontPaneliKapat);

fontUygula(oku("font"));

// Kelime ve karakter sayacı
function sayaciGuncelle() {
  const metin = not.value;
  const kelime = metin.trim() ? metin.trim().split(/\s+/).length : 0;
  sayac.textContent = kelime + " kelime · " + metin.length + " karakter";
}

// Otomatik kayıt: yazmayı bırakınca not tarayıcıda saklanır
let kayitZamanlayici;

function otomatikKaydet() {
  clearTimeout(kayitZamanlayici);
  kayitDurumu.textContent = "";
  kayitZamanlayici = setTimeout(() => {
    if (yaz("not", not.value)) kayitDurumu.textContent = " · kaydedildi";
  }, 500);
}

// Odak modu: yazarken menü ve sayaç gizlenir, 1 sn durunca geri gelir
let odakZamanlayici;

function odakModu() {
  menu.classList.add("gizli");
  durum.classList.add("gizli");
  clearTimeout(odakZamanlayici);
  odakZamanlayici = setTimeout(() => {
    menu.classList.remove("gizli");
    durum.classList.remove("gizli");
  }, 1000);
}

not.addEventListener("input", () => {
  sayaciGuncelle();
  otomatikKaydet();
  odakModu();
});

// Kısa bildirim
let bildirimZamanlayici;

function bildir(mesaj) {
  bildirim.textContent = mesaj;
  bildirim.classList.add("goster");
  clearTimeout(bildirimZamanlayici);
  bildirimZamanlayici = setTimeout(() => bildirim.classList.remove("goster"), 2200);
}

// Dosya adı: ilk satır başlık olur, yoksa tarih kullanılır
function dosyaAdi() {
  const ilkSatir = not.value.split("\n").find((satir) => satir.trim()) || "";
  const baslik = ilkSatir
    .replace(/^#+\s*/, "")
    .replace(/[\\/:*?"<>|]/g, "")
    .trim()
    .slice(0, 40)
    .trim();
  return baslik || "not-" + new Date().toISOString().slice(0, 10);
}

// İndirme: notu dosyaya çevirip indir
function indir(uzanti) {
  if (!not.value.trim()) {
    bildir("Not boş, indirilecek bir şey yok");
    return;
  }
  const ad = dosyaAdi() + "." + uzanti;
  const dosya = new Blob([not.value], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(dosya);
  link.download = ad;
  link.click();
  URL.revokeObjectURL(link.href);
  bildir(ad + " indirildi");
  not.focus({ preventScroll: true });
}

document.getElementById("txt").addEventListener("click", () => indir("txt"));
document.getElementById("md").addEventListener("click", () => indir("md"));

// Klavye kısayolları
document.addEventListener("keydown", (e) => {
  const ctrl = e.ctrlKey || e.metaKey;

  if (ctrl && e.key.toLowerCase() === "s") {
    e.preventDefault();
    indir(e.shiftKey ? "txt" : "md");
  } else if (ctrl && (e.key === "+" || e.key === "=")) {
    e.preventDefault();
    boyutAyarla(2);
  } else if (ctrl && e.key === "-") {
    e.preventDefault();
    boyutAyarla(-2);
  } else if (ctrl && e.key === "0") {
    e.preventDefault();
    boyutAyarla(0);
  }
});

// Ctrl + tekerlek: tarayıcıyı değil, yazıyı büyüt/küçült
window.addEventListener("wheel", (e) => {
  if (!e.ctrlKey) return;
  e.preventDefault();
  boyutAyarla(e.deltaY < 0 ? 2 : -2);
}, { passive: false });

// Tab tuşu: sonraki butona geçmek yerine girinti ekle
not.addEventListener("keydown", (e) => {
  if (e.key !== "Tab" || e.ctrlKey || e.altKey) return;
  e.preventDefault();
  if (!document.execCommand("insertText", false, "  ")) {
    not.setRangeText("  ", not.selectionStart, not.selectionEnd, "end");
    not.dispatchEvent(new Event("input"));
  }
});

// Klavye sesi: ses dosyası yok, her tık tarayıcıda anlık üretilir
let sesAcik = oku("ses") !== "kapali";
let sesMotoru = null;
let gurultu = null;

document.documentElement.classList.toggle("sessiz", !sesAcik);

function sesHazirla() {
  if (sesMotoru) return;
  sesMotoru = new (window.AudioContext || window.webkitAudioContext)();

  // Kısa bir "hışırtı" (beyaz gürültü): tuşun tık sesi bundan süzülür
  const uzunluk = Math.floor(sesMotoru.sampleRate * 0.08);
  gurultu = sesMotoru.createBuffer(1, uzunluk, sesMotoru.sampleRate);
  const veri = gurultu.getChannelData(0);
  for (let i = 0; i < uzunluk; i++) veri[i] = Math.random() * 2 - 1;
}

// Tuş türüne göre ses karakteri: [tık frekansı, gövde frekansı, uzunluk, güç]
const tusSesleri = {
  normal:    [2600, 150, 0.035, 1.0],
  bosluk:    [1500, 95,  0.05,  1.15],
  enter:     [1200, 80,  0.07,  1.35],
  silme:     [3200, 180, 0.03,  0.8]
};

function tikla(tur) {
  if (!sesAcik) return;
  sesHazirla();
  if (sesMotoru.state === "suspended") sesMotoru.resume();

  const [tikFrekans, govdeFrekans, sure, guc] = tusSesleri[tur];
  const simdi = sesMotoru.currentTime;
  const oynama = 0.85 + Math.random() * 0.3; // her tık birbirinin aynısı olmasın

  // 1) Tık: gürültüyü süzerek keskin, kısa bir "tak"
  const kaynak = sesMotoru.createBufferSource();
  kaynak.buffer = gurultu;
  const suzgec = sesMotoru.createBiquadFilter();
  suzgec.type = "bandpass";
  suzgec.frequency.value = tikFrekans * oynama;
  suzgec.Q.value = 1.4;
  const tikSeviye = sesMotoru.createGain();
  tikSeviye.gain.setValueAtTime(0.0001, simdi);
  tikSeviye.gain.exponentialRampToValueAtTime(0.22 * guc, simdi + 0.002);
  tikSeviye.gain.exponentialRampToValueAtTime(0.0001, simdi + sure);
  kaynak.connect(suzgec).connect(tikSeviye).connect(sesMotoru.destination);
  kaynak.start(simdi);
  kaynak.stop(simdi + sure + 0.01);

  // 2) Gövde: tuşun dibe vurduğu tok "tok" sesi
  const govde = sesMotoru.createOscillator();
  govde.type = "triangle";
  govde.frequency.setValueAtTime(govdeFrekans * oynama * 1.4, simdi);
  govde.frequency.exponentialRampToValueAtTime(govdeFrekans * oynama, simdi + sure);
  const govdeSeviye = sesMotoru.createGain();
  govdeSeviye.gain.setValueAtTime(0.0001, simdi);
  govdeSeviye.gain.exponentialRampToValueAtTime(0.16 * guc, simdi + 0.003);
  govdeSeviye.gain.exponentialRampToValueAtTime(0.0001, simdi + sure * 1.3);
  govde.connect(govdeSeviye).connect(sesMotoru.destination);
  govde.start(simdi);
  govde.stop(simdi + sure * 1.3 + 0.01);
}

not.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.repeat && e.key !== "Backspace") return; // tuşa basılı tutunca makineli tüfek olmasın

  if (e.key === " ") tikla("bosluk");
  else if (e.key === "Enter") tikla("enter");
  else if (e.key === "Backspace" || e.key === "Delete") tikla("silme");
  else if (e.key.length === 1 || e.key === "Tab") tikla("normal");
});

document.getElementById("ses").addEventListener("click", () => {
  sesAcik = !sesAcik;
  document.documentElement.classList.toggle("sessiz", !sesAcik);
  yaz("ses", sesAcik ? "acik" : "kapali");
  if (sesAcik) tikla("normal");
  bildir(sesAcik ? "Klavye sesi açık" : "Klavye sesi kapalı");
  not.focus({ preventScroll: true });
});

// Açılış: kayıtlı notu geri yükle
not.value = oku("not") || "";
sayaciGuncelle();
not.setSelectionRange(not.value.length, not.value.length);
not.scrollTop = not.scrollHeight;
oranHesapla();

// İlk çizimden sonra tema geçiş animasyonlarını aç
requestAnimationFrame(() => {
  requestAnimationFrame(() => document.documentElement.classList.add("hazir"));
});
