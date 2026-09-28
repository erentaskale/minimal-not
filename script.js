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
not.style.fontSize = boyut + "px";

function boyutAyarla(fark) {
  const yeni = fark === 0 ? 18 : Math.min(40, Math.max(12, boyut + fark));
  if (yeni === boyut) return;
  oranHesapla();
  boyut = yeni;
  not.style.fontSize = boyut + "px";
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
