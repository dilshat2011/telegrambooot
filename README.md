# 🏛️ Ashıq Byudjet — Ishtirak Etiwshi Byudjet

Puqaralar jobalarǵa dawıs beretuǵın platforma.

---

## 📁 Fayl dúzilisi

```
web-sayt-tapsirmalar/
├── index.html          ← Asosiy sahifa
├── style.css           ← Dizayn
├── script.js           ← Frontend logika
├── netlify.toml        ← Netlify sozlamalari
└── netlify/
    └── functions/      ← Backend (Serverless Functions)
        ├── send-otp.js
        ├── verify-otp.js
        └── vote.js
```

---

## 🚀 Iske túsiriw

### 1. Node.js ornatıń (eger joq bolsa)
https://nodejs.org dan júklep ornatıń

### 2. Paketlerdi ornatıń
```bash
npm install
```

### 3. Netlify CLI ornatıń (lokal iske túsiriw ushın)
```bash
npm install -g netlify-cli
```

### 4. Lokal iske túsiriw
```bash
netlify dev
```

### 5. Sayttı ashıń
Brauzerde: **http://localhost:8888**

---

## 🔐 Kiriw hám dawıs beriw

1. **Saytqa ótiń**: http://localhost:8888
2. **Telefon kiritiń**: Login formasına telefon nomerińizdi kiritiń.
3. **Kodtı kiritiń**: Kod jiberildi dep xabar shıqqannan soń, tastıyqlaw kodın kiritiń.
4. **Dawıs beriń**: Jobalardı kóriń hám dawıs beriń!

---

## 📡 API Endpointlar

| Method | URL | Tavsif |
|--------|-----|--------|
| POST | `/api/send-otp` | OTP jiberiw |
| POST | `/api/verify-otp` | OTP tekseriw |
| POST | `/api/vote` | Dawıs beriw |

---

## ⚙️ Demo rejim

Eger hákisiy backend (Netlify Functions) islemese:
- Islegen 4 xanalı kod qabıl etiledi.
- Dawıslar brauzer xatirasında (localStorage) saqlanadı.

---

## 📞 Baylanıs

Tel: +998 71 203 00 00

