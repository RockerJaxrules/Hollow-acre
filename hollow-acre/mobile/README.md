# Hollow Acre: phone app

The same game, packaged as a real Android app with [Capacitor](https://capacitorjs.com). It saves on the phone and works offline
(multiplayer needs internet).

**Easiest:** download the APK that GitHub builds for every change (repository → Actions → "Hollow Acre apps" → the latest run →
`HollowAcre-android.apk`), copy it to an Android phone and open it. Android will ask you to allow installing apps from that source.

**Build it yourself** (needs Node 20, Java 17 and Android Studio):

1. `npm install`
2. `npm run android`
3. `cd android && ./gradlew assembleDebug` (or open the `android` folder in Android Studio and press Run)

**iPhone:** on a Mac with Xcode, run `npm run ios`, then open `ios/App/App.xcworkspace` in Xcode. Installing on a phone or
publishing to the App Store needs an Apple developer account.

For Google Play, build a signed release (`./gradlew bundleRelease`) with your own signing key.
