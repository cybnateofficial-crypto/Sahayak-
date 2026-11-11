# TWA APK (Play Store) — Turn PWA into real APK in 2 mins

Your PWA is already installable via Chrome (instant). For a Play Store APK, use Bubblewrap:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://5173-isie2geom4uuz4qjlveit.e2b.app/manifest.json
bubblewrap build   # → app-release-signed.apk
```

Or via PWABuilder: https://www.pwabuilder.com → enter your URL → Package for Android.

The web build (dist/) is ready to deploy to Vercel instantly:
vercel --prod --cwd web

Both give you a real APK that wraps the PWA + adds Play Store signing.
