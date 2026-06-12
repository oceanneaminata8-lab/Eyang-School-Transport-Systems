# Android APK Branding

Android uses two different images:

- **App icon:** shown on the phone home screen and app drawer.
- **Splash image:** shown briefly while the APK starts.

## Simple Option: One Logo

Create a `frontend/resources` directory and add:

- `logo.png` or `icon.png`: square PNG, at least `1024 x 1024`.

The generator uses this logo for the launcher icon and centers it on the startup splash screen.

## Custom Option: Separate Icon and Splash

For full control, add these files to `frontend/resources`:

- `icon-only.png`: at least `1024 x 1024`.
- `icon-foreground.png`: at least `1024 x 1024`.
- `icon-background.png`: at least `1024 x 1024`.
- `splash.png`: at least `2732 x 2732`.

Keep important splash content near the center so portrait and landscape crops remain readable.

## Generate Android Assets

From the `frontend` directory, install the Capacitor asset generator once:

```powershell
npm install --save-dev @capacitor/assets
```

Generate the launcher icons and splash images:

```powershell
npx @capacitor/assets generate --android
```

This updates the Android assets under:

```text
android/app/src/main/res/mipmap-*/
android/app/src/main/res/drawable*/
```

## Build the Updated APK

```powershell
npm run build
npx cap sync android
npx cap open android
```

In Android Studio, select:

```text
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

The Android manifest already points to `@mipmap/ic_launcher`, `@mipmap/ic_launcher_round`, and `@drawable/splash`, so generated assets are picked up automatically.
