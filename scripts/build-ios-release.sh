#!/usr/bin/env bash
# Builds a signed App Store .ipa for one store app. Usage: scripts/build-ios-release.sh <app-id> [buildNumber]
# Archives unsigned, then the export step signs with the Apple Distribution identity in the keychain (Xcode account creates the App Store profile).
set -euo pipefail
APP=$1; BN=${2:-1}; TEAM=${TEAM:-63CGQAWDJ8}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT" && node scripts/stage-app.mjs "$APP"
cd "store/dist/$APP"
npm install --no-audit --no-fund >/dev/null
npx cap add ios --packagemanager SPM >/dev/null
mkdir -p assets && cp "$ROOT/brand/apps/$APP-1024.png" assets/icon-only.png
npx capacitor-assets generate --ios >/dev/null
P=ios/App/App/Info.plist
/usr/libexec/PlistBuddy -c "Add :NSCameraUsageDescription string The camera is used to scan a QR code in this demo." $P
/usr/libexec/PlistBuddy -c "Add :ITSAppUsesNonExemptEncryption bool false" $P
npx cap sync ios >/dev/null
# Apple requires iOS 15+ from April 2027 (ITMS-90068); Capacitor 7 generates 14.
sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = 14.0/IPHONEOS_DEPLOYMENT_TARGET = 15.0/' ios/App/App.xcodeproj/project.pbxproj
sed -i '' 's/\.iOS(\.v14)/.iOS(.v15)/' ios/App/CapApp-SPM/Package.swift
cat > /tmp/export-$APP.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>method</key><string>app-store-connect</string>
<key>teamID</key><string>$TEAM</string>
<key>signingStyle</key><string>automatic</string>
<key>destination</key><string>upload</string>
</dict></plist>
EOF
cd ios/App
xcodebuild -project App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' \
  -archivePath build/App.xcarchive archive -allowProvisioningUpdates \
  DEVELOPMENT_TEAM=$TEAM CODE_SIGNING_ALLOWED=NO CURRENT_PROJECT_VERSION=$BN MARKETING_VERSION=1.0
xcodebuild -exportArchive -archivePath build/App.xcarchive -exportPath build/upload \
  -exportOptionsPlist /tmp/export-$APP.plist -allowProvisioningUpdates
echo UPLOAD-DONE
