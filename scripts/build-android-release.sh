#!/usr/bin/env bash
# Builds a signed release .aab for one store app. Usage: scripts/build-android-release.sh <app-id> [versionCode]
# Needs ~/.neptune-keys/keystore.env (KS, ALIAS, PW) and JDK 21 + Android SDK.
set -euo pipefail
APP=$1; VC=${2:-1}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
source ~/.neptune-keys/keystore.env
export ANDROID_HOME=${ANDROID_HOME:-$HOME/Library/Android/sdk}
cd "$ROOT" && node scripts/stage-app.mjs "$APP"
cd "store/dist/$APP"
npm install --no-audit --no-fund >/dev/null
npx cap add android >/dev/null
mkdir -p assets && cp "$ROOT/brand/apps/$APP-1024.png" assets/icon-only.png
npx capacitor-assets generate --android >/dev/null
rm -rf android/app/src/main/res/mipmap-anydpi-v26
M=android/app/src/main/AndroidManifest.xml
sed -i '' 's#<uses-permission android:name="android.permission.INTERNET" />#<uses-permission android:name="android.permission.INTERNET" />\
    <uses-permission android:name="android.permission.CAMERA" />\
    <uses-feature android:name="android.hardware.camera" android:required="false" />#' $M
sed -i '' '/name="AppTheme.NoActionBar"/a\
        <item name="android:windowLightStatusBar">true</item>' android/app/src/main/res/values/styles.xml
G=android/app/build.gradle
sed -i '' "s/versionCode 1/versionCode $VC/;s/versionName \"1.0\"/versionName \"1.0\"/" $G
python3 - "$G" <<'P'
import sys,re
p=sys.argv[1];s=open(p).read()
s=s.replace("    buildTypes {","    signingConfigs {\n        release {\n            storeFile file(System.getenv('NEP_KS'))\n            storePassword System.getenv('NEP_PW')\n            keyAlias System.getenv('NEP_ALIAS')\n            keyPassword System.getenv('NEP_PW')\n        }\n    }\n    buildTypes {",1)
s=s.replace("        release {\n            minifyEnabled false","        release {\n            signingConfig signingConfigs.release\n            minifyEnabled false",1)
open(p,'w').write(s)
P
npx cap sync android >/dev/null
cd android && NEP_KS="$KS" NEP_PW="$PW" NEP_ALIAS="$ALIAS" ./gradlew --no-daemon bundleRelease -q
ls -lh app/build/outputs/bundle/release/app-release.aab
