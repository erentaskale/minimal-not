# Minimal Not

Karanlık temalı, dikkat dağıtmayan, minimalist not alma uygulaması. Sahibi: Eren (erentaskale).

- **Canlı:** https://erentaskale.github.io/minimal-not/ (GitHub Pages, `main` dalından otomatik yayınlanır)
- **Repo:** https://github.com/erentaskale/minimal-not
- **Teknoloji:** Saf HTML + CSS + JavaScript. Framework, derleme adımı, backend yok.

## Dosyalar

| Dosya | İçerik |
|---|---|
| `index.html` | İskelet: yazı alanı (`#not`), sağ menü (`#menu`), durum çubuğu, bildirim. `<head>`'de temayı açılışta uygulayan küçük bir script var. |
| `style.css` | Görünüm. Renkler `:root` üzerinde CSS değişkenleri (`--arka`, `--yazi`...), aydınlık tema `:root.aydinlik`. Font `--font`, ölçek `--olcek` değişkeninden gelir. |
| `script.js` | Davranış: yazı boyutu, tema, font döngüsü, klavye sesi, otomatik kayıt, odak modu, indirme, silme, kısayollar. |
| `favicon.svg` | Sekme ikonu |

## Özellikler

Karanlık/aydınlık tema · 6 fontluk döngü ("Aa" butonu) · Web Audio ile üretilen klavye sesi · Otomatik kayıt (localStorage) · Kelime/karakter sayacı · Odak modu (yazarken menü gizlenir, 1 sn sonra döner) · .txt/.md indirme (ilk satır dosya adı olur) · İki aşamalı silme (Ctrl+Z ile geri alınır) · Kaydırma konumu korunur · Klavye kısayolları · Telefon uyumu

## Kod kuralları

- Değişken, fonksiyon ve CSS sınıf adları **Türkçe** (`boyutAyarla`, `temaUygula`, `.gizli`). Yeni kod da böyle olmalı.
- localStorage'a doğrudan değil, `oku()` / `yaz()` yardımcılarıyla erişilir (gizli modda hata vermesin diye try/catch içerirler).
- Renkler her zaman CSS değişkeniyle verilir, iki temada da tanımlanır.
- Animasyonlar `prefers-reduced-motion` ile kapatılabilir durumda kalmalı.
- Yorumlar kısa ve Türkçe.

## Yerelde çalıştırma

`index.html`'e çift tıklamak yeterli. Tarayıcı paneli için: `python -m http.server 5173` (ayarı `.claude/launch.json`'da, `.gitignore`'da).
