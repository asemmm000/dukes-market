# 🏛️ Dukes Market

لعبة مزايدة سرية متعددة اللاعبين مبنية على Node.js + Socket.IO + MongoDB.

تنافس مع 2-6 لاعبين على قطع أثرية نادرة عبر 5 جولات، باستخدام:
- مزايدة عمياء (رقم سري + بطاقات مال)
- تحالفات سرية قابلة للخيانة
- جواسيس، سكاكين، وأربعة لصوص محترفين (نينجا، ساحر، شبح، محتال)

## التشغيل محلياً

```bash
npm install
cp .env.example .env   # ضع MONGO_URI الخاص بك
npm start
```

## النشر على Railway

1. اربط الريبو بمشروع Railway
2. أضف متغير البيئة `MONGO_URI`
3. Railway سيوفر `PORT` تلقائياً — لا حاجة لإعداد إضافي

## البنية

```
game/         منطق اللعبة (GameRoom, deck, constants)
models/       نماذج MongoDB
public/       الواجهة الأمامية (HTML/CSS/JS بدون build)
server.js     نقطة الدخول (Express + Socket.IO)
```