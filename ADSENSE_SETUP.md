# Google AdSense Setup Guide for Penguin Tap Game

## Quick Setup Steps

### 1. Get Your AdSense Client ID
1. Go to [Google AdSense](https://www.google.com/adsense)
2. Sign up or log in to your account
3. Get your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)

### 2. Update the Code
Replace the placeholder in these files:

**File: `/index.html`**
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR_CLIENT_ID"
     crossorigin="anonymous"></script>
```

**File: `/src/components/AdSense.tsx`**
```typescript
data-ad-client="YOUR_CLIENT_ID"
```

### 3. Ad Placement Strategy
The game currently has ads in these positions:
- **Top Banner**: 728x90 (desktop) / 320x100 (mobile)
- **Bottom Banner**: 728x90 (desktop) / 320x100 (mobile)

### 4. AdSense Policies for Games
✅ **Allowed**:
- Casual games with ads
- Family-friendly content
- Non-intrusive ad placement

❌ **Not Allowed**:
- Click fraud or encouraging clicks
- Adult content
- Copyrighted penguin images (use original/AI-generated)

### 5. Optimization Tips
- Use responsive ads for mobile
- Place ads where users naturally pause
- Test different ad formats
- Monitor CTR and RPM metrics

### 6. Testing
- Use AdSense test mode during development
- Check ad loading in different browsers
- Verify mobile responsiveness
- Test with real AdSense account (not during development)

## Important Notes
- **Don't click your own ads** - this will get your account banned
- **Wait for approval** - Google reviews all sites before serving real ads
- **Traffic requirements** - You need substantial traffic for good earnings
- **Content quality** - Ensure your game provides value to users

## Alternative Ad Networks (if AdSense doesn't work)
- Media.net
- PropellerAds
- Infolinks
- BuySellAds
- Direct sponsorships