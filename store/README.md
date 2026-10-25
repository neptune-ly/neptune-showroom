# Store packaging — Neptune Showroom developer group

Four store apps (see `apps.json`): Neptune Mobile, Neptune Vega, Neptune Mobile for Telco, Neptune Vega for Telco.
Mizan is a channel inside Mobile and Vega, not a store app. Web products (Hub, Plus, Mizan portal and landing, Vega console) are hosted, not packaged.

## Build steps (on your Mac, with your developer accounts)
```sh
node scripts/stage-app.mjs all              # stages store/dist/<id>/www + capacitor config + resources
cd store/dist/neptune-mobile
npm install
npx cap add ios && npx cap add android      # already verified to generate on Linux; building needs Xcode / Android SDK
npx capacitor-assets generate --iconBackgroundColor '#07315F'   # icons/splash from resources/ (or use brand/apps/*.png)
npx cap sync && npx cap open ios            # archive in Xcode;  npx cap open android -> bundle (.aab) in Android Studio
```
Replace the placeholder bundle ids in `apps.json` with ids registered under the Neptune Showroom accounts first.
Icons: `brand/apps/<id>-1024.png` (store, full-bleed square), `-maskable-512.png` (Android adaptive), 180/192/512 for PWA.

## Cloud builds (no Mac or Android Studio needed)
`.github/workflows/build-apps.yml` (Actions → Build apps → Run workflow) builds:
- **Android:** a debug-signed `.apk` per app, downloadable from the run's Artifacts. Install on a phone by enabling "install unknown apps".
- **iOS:** unsigned simulator builds, which prove the Xcode projects build.

## Connecting App Store Connect and Google Play (for signed store builds and uploads)
Never paste keys into chat. Create them yourself and store them as **GitHub repository secrets** (Settings → Secrets and variables → Actions):
- App Store Connect: an API key (Users and Access → Integrations → App Store Connect API): `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_PRIVATE_KEY` (the .p8 contents); plus a distribution certificate (.p12 and its password) and a provisioning profile per app.
- Google Play: a service account JSON (Play Console → Setup → API access) as `PLAY_SERVICE_ACCOUNT_JSON`, and an upload keystore (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`).
With those in place, signed release and upload jobs can be added to the workflow.

## Add before submitting
- iOS `Info.plist`: `NSCameraUsageDescription` (Polaris liveness and passport capture), Face ID description if used. Android: `CAMERA` permission.
- Privacy policy URL, support URL, marketing URL, age rating, App Privacy / Data safety answers: state that no data is collected or transmitted (everything is simulated and on-device).
- Reviewer notes with a short walkthrough and the fact that the app is a demonstration with simulated data (Apple guideline 4.2 minimum functionality and 4.3 spam are the main rejection risks for demo apps; keep the in-app "Demonstration — simulated data" labelling and the richer flows visible).
- Screenshots: 6.7" and 6.5" iPhone, 12.9" iPad if supporting iPad, Android phone and 7/10" tablet. Capture from `*/_shots` flows or re-shoot at device sizes.
- Native review of French and Arabic copy in `listings/` (drafts, limits already respected: name 30, subtitle 30, short 80, promo 170, keywords 100, description 4000).
- Do not claim certified biometrics or liveness. The Polaris module is demo-grade.

## Not verified here
No Xcode or Android SDK in this environment, so nothing has been compiled, signed, or run on a device or simulator.
