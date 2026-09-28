const not = document.getElementById("not");
const menu = document.getElementById("menu");

// Yazı boyutu
let boyut = 18;

function boyutAyarla(fark) {
  boyut = Math.min(40, Math.max(12, boyut + fark));
  not.style.fontSize = boyut + "px";
  not.focus();
}

document.getElementById("buyut").addEventListener("click", () => boyutAyarla(2));
document.getElementById("kucult").addEventListener("click", () => boyutAyarla(-2));

// Tema: karanlık / aydınlık, seçim tarayıcıda hatırlanır
const temaButonu = document.getElementById("tema");

function temaUygula(aydinlik) {
  document.documentElement.classList.toggle("aydinlik", aydinlik);
  temaButonu.textContent = aydinlik ? "☾" : "☀";
}

try {
  temaUygula(localStorage.getItem("tema") === "aydinlik");
} catch (e) {}

temaButonu.addEventListener("click", () => {
  const aydinlik = !document.documentElement.classList.contains("aydinlik");
  temaUygula(aydinlik);
  try {
    localStorage.setItem("tema", aydinlik ? "aydinlik" : "karanlik");
  } catch (e) {}
  not.focus();
});

// Odak modu: yazarken menü gizlenir, 1 sn durunca geri gelir
let zamanlayici;

not.addEventListener("input", () => {
  menu.classList.add("gizli");
  clearTimeout(zamanlayici);
  zamanlayici = setTimeout(() => menu.classList.remove("gizli"), 1000);
});

// Kaydetme: notu dosyaya çevirip indir
function kaydet(uzanti) {
  const tarih = new Date().toISOString().slice(0, 10);
  const dosya = new Blob([not.value], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(dosya);
  link.download = "not-" + tarih + "." + uzanti;
  link.click();
  URL.revokeObjectURL(link.href);
  not.focus();
}

document.getElementById("txt").addEventListener("click", () => kaydet("txt"));
document.getElementById("md").addEventListener("click", () => kaydet("md"));
