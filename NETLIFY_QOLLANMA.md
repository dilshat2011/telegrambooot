# 🏛️ Ashıq Byudjet — Netlify Deploy Qılıw Qollanması

---

## 📁 Fayl dúzilisi

```
web-sayt-tapsirmalar/
├── index.html                        ← Bas bet (Qoraqolpoq tilinde)
├── style.css                         ← Dizayn
├── script.js                         ← Frontend logikası
├── netlify.toml                      ← Netlify sazlaması
├── package.json                      ← Netlify Functions ushın paketler
└── netlify/
    └── functions/
        ├── send-otp.js               ← OTP jiberiw
        ├── verify-otp.js             ← OTP tekserиw
        ├── vote.js                   ← Dawıs beriw
        └── projects.js               ← Jobalar dizimi
```

---

## 🌐 1-QADAM: GitHub ga jüklew

1. **[github.com](https://github.com)** da akkaunt ashıń (bepul)
2. Jańa repository jaratiń: `ashiq-byudjet`
3. Barlıq fayllarıńızdı júklep qoyıń

**Yamasa GitHub Desktop ilovası arqalı:**
1. [desktop.github.com](https://desktop.github.com) dan júklep ornatıń
2. "Add existing repository" → papkańızdı saylań
3. "Publish repository" túymesın basıń

---

## ⚡ 2-QADAM: Netlify ga deploy etiw

1. **[netlify.com](https://netlify.com)** ga kiriń (GitHub akkaunt menen)
2. **"Add new site"** → **"Import an existing project"**
3. **GitHub** nı saylań → repozitoriyańızdı tabıń
4. Sazlamalar:
   - **Build command:** (bos qaldırıń)
   - **Publish directory:** `.` (nuqta)
5. **"Deploy site"** basıń

Netlify sizge URL beredi, mısalı:
```
https://ashiq-byudjet.netlify.app
```

---

## 🔑 3-QADAM: Environment Variables (Sır sozlamalar)

Netlify dashboard da:
**Site settings → Environment variables → Add variable**

| O'zgaruvchi | Qıymeti | Mısal |
|---|---|---|
| `OTP_SECRET` | Islegen quramalı sóz | `mysecret2025xyz` |

---

## ✅ 4-QADAM: Testlaw

### Sayt testı:
1. `https://ashiq-byudjet.netlify.app` nı ashıń
2. **"Kiriw"** túymesın basıń
3. Telefon nomerin kiritiń → Kod jiberildi dep xabar shıǵıwı kerek
4. Kodtı kiritiń → Sistemage kiriw → Dawıs beriw

---

## ❓ Kóp ushırasatıǵın máseleler

| Mashqala | Sheshim |
|---|---|
| Kod kelmeyapti | Backend (Functions) isleyotganini tekserіń |
| Functions islemeyt | Netlify da env variable bar ekenin tekserіń |
| Sayt ashılmaydi | netlify.toml faylı to'g'ri ekenin tekserіń |

---

## 📞 Baylanıs

- 📞 Tel: +998 71 203 00 00
- 🌐 Sayt: ashiq-byudjet.netlify.app
