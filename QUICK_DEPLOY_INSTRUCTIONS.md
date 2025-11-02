# 🚀 Quick Deploy Instructions

## Fastest Way to Deploy (5 Minutes!)

### Option 1: Render (Recommended - Free)

#### Deploy Backend:

1. **Go to**: https://render.com → Sign up
2. **New Web Service** → Connect GitHub repo
3. **Configure**:
   - Name: `precision-farm-backend`
   - Root: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Deploy** → Wait 5-10 minutes
5. **Copy URL**: `https://your-backend.onrender.com`

#### Deploy Frontend:

1. **New Static Site** → Connect GitHub
2. **Configure**:
   - Root: `.`
   - Build: `npm install && npm run build`
   - Publish: `dist`
3. **Environment Variable**:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
4. **Deploy** → Done!

---

### Option 2: Vercel (Frontend) + Railway (Backend)

#### Deploy Backend to Railway:

1. **Go to**: https://railway.app → Sign up
2. **New Project** → Deploy from GitHub
3. **Select**: `backend` folder
4. **Railway auto-detects**: Python + FastAPI
5. **Deploy** → Get URL

#### Deploy Frontend to Vercel:

1. **Go to**: https://vercel.com → Sign up
2. **Import Project** → GitHub repo
3. **Framework**: Vite (auto-detected)
4. **Environment Variable**:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
5. **Deploy** → Done!

---

## ⚙️ Pre-Deployment Checklist

- [x] API URLs updated to use `API_ENDPOINTS`
- [x] `src/config/api.ts` created
- [x] All hardcoded URLs removed
- [x] Deployment configs added
- [ ] Database migration run
- [ ] ML models in `backend/models/`
- [ ] Environment variables ready

---

## 🔧 Quick Environment Variables

### Frontend (.env.production):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_API_URL=https://your-backend.onrender.com
```

### Backend:
No environment variables needed for now!

---

## ✅ After Deploying

1. **Test**: Visit your frontend URL
2. **Check Console**: No CORS errors
3. **Test Features**:
   - Upload crop image
   - Get crop recommendations
   - View field efficiency
   - Check harvest planning

---

## 🆘 If Something Breaks

### Backend not starting?
- Check logs in Render/Railway dashboard
- Ensure `requirements.txt` is correct
- Verify Python version is 3.12

### Frontend can't connect?
- Check `VITE_API_URL` is correct
- Verify backend is running
- Check CORS settings in backend

### ML models missing?
- Ensure models are committed to Git
- Check `backend/models/` exists
- Verify file paths in code

---

## 📊 Deployment Summary

### Free Tier Costs:
- **Render**: Free (limited)
- **Vercel**: Free
- **Railway**: Free trial
- **Supabase**: Free tier
- **Total**: ₹0/month ✅

### Paid (Recommended):
- **Railway**: $5/month
- **Vercel**: Free
- **Supabase**: Free
- **Total**: ₹400/month (~$5)

---

## 🎉 Done!

Your Precision Farm Pro is now live! 🚜🌾

**Example URLs**:
- Frontend: `https://precision-farm.vercel.app`
- Backend: `https://precision-farm.railway.app`
- API: `https://precision-farm-backend.onrender.com`

