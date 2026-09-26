/**
 * HYPEX App Builder - Embedded Android Studio Template Data
 * Provides offline & CORS-free template project files for client-side JSZip exporting.
 */
window.ANDROID_TEMPLATE_FILES = {
    "build.gradle": `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
    }
}

tasks.register('clean', Delete) {
    delete rootProject.buildDir
}
`,

    "settings.gradle": `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "HYPEXApp"
include ':app'
`,

    "gradle.properties": `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true
`,

    "app/build.gradle": `plugins {
    id 'com.android.application'
}

android {
    namespace '__PACKAGE_NAME__'
    compileSdk __COMPILE_SDK__

    defaultConfig {
        applicationId '__PACKAGE_NAME__'
        minSdk __MIN_SDK__
        targetSdk __TARGET_SDK__
        versionCode __VERSION_CODE__
        versionName '__VERSION_NAME__'

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables.useSupportLibrary = true
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
    implementation 'androidx.webkit:webkit:1.10.0'
    implementation 'androidx.browser:browser:1.8.0'
    implementation 'androidx.core:core-splashscreen:1.0.1'
}
`,

    "app/proguard-rules.pro": `# Add project specific ProGuard rules here.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public void openFileChooser(...);
}
-dontwarn androidx.webkit.**
-keep class com.google.android.material.** { *; }
`,

    "app/src/main/AndroidManifest.xml": `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="__PACKAGE_NAME__">

    <!-- Core Internet & Network Status -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <!-- Optional Hardware & Media Permissions (Controlled by config) -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- File Management & Downloads -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" tools:ignore="ScopedStorage" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />

    <!-- Hardware Feature Requirements (Non-mandatory so devices without camera can install) -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    <uses-feature android:name="android.hardware.microphone" android:required="false" />
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.HYPEXApp"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config"
        android:hardwareAccelerated="true"
        tools:targetApi="__TARGET_SDK__">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout"
            android:screenOrientation="__SCREEN_ORIENTATION__"
            android:windowSoftInputMode="adjustResize"
            android:launchMode="singleTask">

            <!-- Standard Main Launcher Intent -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- OAuth Custom Scheme Deep Link Callback (e.g. hypexapp://oauth-callback) -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="__OAUTH_SCHEME_NAME__" />
            </intent-filter>

            <!-- HTTPS App Link Filter -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="__WEB_HOST__" />
            </intent-filter>

        </activity>

        <!-- File Provider for Camera Photo Capture & File Uploads -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="__PACKAGE_NAME__.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>

</manifest>
`,

    "app/src/main/res/values/colors.xml": `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#00E599</color>
    <color name="accent">#00E599</color>
    <color name="status_bar_color">__STATUS_BAR_COLOR__</color>
    <color name="splash_bg_color">__SPLASH_BG_COLOR__</color>
    <color name="offline_bg">#06080F</color>
</resources>
`,

    "app/src/main/res/values/strings.xml": `<resources>
    <string name="app_name">__APP_NAME__</string>
    <string name="offline_title">İnternet Bağlantısı Yok</string>
    <string name="offline_desc">Lütfen internet bağlantınızı kontrol edip tekrar deneyin.</string>
    <string name="offline_retry">Tekrar Dene</string>
    <string name="exit_prompt">Çıkmak için tekrar dokunun</string>
</resources>
`,

    "app/src/main/res/values/styles.xml": `<resources>
    <style name="Theme.HYPEXApp" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary</item>
        <item name="colorPrimaryDark">@color/status_bar_color</item>
        <item name="colorAccent">@color/accent</item>
        <item name="android:statusBarColor">@color/status_bar_color</item>
        <item name="android:navigationBarColor">#000000</item>
        <item name="android:windowBackground">@color/splash_bg_color</item>
    </style>
</resources>
`,

    "app/src/main/res/layout/activity_main.xml": `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/rootContainer"
    android:layoutWidth="match_parent"
    android:layoutHeight="match_parent"
    android:background="@color/splash_bg_color">

    <!-- 1. Main Web Content Layer with Pull-To-Refresh -->
    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipeRefreshLayout"
        android:layoutWidth="match_parent"
        android:layoutHeight="match_parent">

        <WebView
            android:id="@+id/mainWebView"
            android:layoutWidth="match_parent"
            android:layoutHeight="match_parent"
            android:background="#000000" />

    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>

    <!-- Top Loading Progress Bar -->
    <ProgressBar
        android:id="@+id/webProgressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layoutWidth="match_parent"
        android:layoutHeight="3dp"
        android:layout_gravity="top"
        android:indeterminate="false"
        android:max="100"
        android:progressDrawable="@android:drawable/progress_horizontal"
        android:visibility="gone" />

    <!-- 2. Offline Fallback Error Layout -->
    <LinearLayout
        android:id="@+id/offlineLayout"
        android:layoutWidth="match_parent"
        android:layoutHeight="match_parent"
        android:background="@color/offline_bg"
        android:gravity="center"
        android:orientation="vertical"
        android:padding="24dp"
        android:visibility="gone">

        <ImageView
            android:layoutWidth="80dp"
            android:layoutHeight="80dp"
            android:layout_marginBottom="16dp"
            android:src="@drawable/ic_offline_wifi"
            app:tint="@color/primary" />

        <TextView
            android:layoutWidth="wrap_content"
            android:layoutHeight="wrap_content"
            android:text="@string/offline_title"
            android:textColor="#FFFFFF"
            android:textSize="20sp"
            android:textStyle="bold" />

        <TextView
            android:layoutWidth="wrap_content"
            android:layoutHeight="wrap_content"
            android:layout_marginTop="8dp"
            android:gravity="center"
            android:text="@string/offline_desc"
            android:textColor="#94A3B8"
            android:textSize="14sp" />

        <com.google.android.material.button.MaterialButton
            android:id="@+id/btnRetry"
            android:layoutWidth="wrap_content"
            android:layoutHeight="wrap_content"
            android:layout_marginTop="24dp"
            android:backgroundTint="@color/primary"
            android:text="@string/offline_retry"
            android:textColor="#06080F"
            android:textStyle="bold"
            app:cornerRadius="12dp" />

    </LinearLayout>

    <!-- 3. Fullscreen Video / Custom View Container for HTML5 Video -->
    <FrameLayout
        android:id="@+id/customViewContainer"
        android:layoutWidth="match_parent"
        android:layoutHeight="match_parent"
        android:background="#000000"
        android:visibility="gone" />

    <!-- 4. Native Splash Screen Overlay Layer -->
    <FrameLayout
        android:id="@+id/splashContainer"
        android:layoutWidth="match_parent"
        android:layoutHeight="match_parent"
        android:background="@color/splash_bg_color">

        <!-- Video Splash View (for MP4 videos) -->
        <VideoView
            android:id="@+id/splashVideoView"
            android:layoutWidth="match_parent"
            android:layoutHeight="match_parent"
            android:layout_gravity="center"
            android:visibility="gone" />

        <!-- Image / Logo Splash View -->
        <LinearLayout
            android:id="@+id/splashImageLayout"
            android:layoutWidth="wrap_content"
            android:layoutHeight="wrap_content"
            android:layout_gravity="center"
            android:gravity="center"
            android:orientation="vertical"
            android:visibility="visible">

            <ImageView
                android:id="@+id/splashImageView"
                android:layoutWidth="120dp"
                android:layoutHeight="120dp"
                android:src="@mipmap/ic_launcher" />

            <ProgressBar
                android:layoutWidth="32dp"
                android:layoutHeight="32dp"
                android:layout_marginTop="20dp"
                android:indeterminate="true" />
        </LinearLayout>

    </FrameLayout>

</FrameLayout>
`,

    "app/src/main/res/xml/network_security_config.xml": `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>
`,

    "app/src/main/res/xml/data_extraction_rules.xml": `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <include domain="sharedpref" path="."/>
        <exclude domain="database" path="."/>
    </cloud-backup>
    <device-transfer>
        <include domain="sharedpref" path="."/>
    </device-transfer>
</data-extraction-rules>
`,

    "app/src/main/res/xml/file_paths.xml": `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="my_images" path="Android/data/__PACKAGE_NAME__/files/Pictures" />
    <cache-path name="my_cache" path="." />
</paths>
`,

    "app/src/main/res/drawable/ic_offline_wifi.xml": `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="64dp"
    android:height="64dp"
    android:viewportWidth="24"
    android:viewportHeight="24"
    android:tint="#00E599">
  <path
      android:fillColor="@android:color/white"
      android:pathData="M23.64,7c-0.45,-0.34 -4.93,-4 -11.64,-4C5.28,3 0.81,6.66 0.36,7l10.08,12.56c0.8,1 2.32,1 3.12,0L23.64,7zM3.48,7.97C5.97,6.17 9.07,5.08 12,5.08c2.93,0 6.03,1.09 8.52,2.89L12,18.59 3.48,7.97z"/>
  <path
      android:fillColor="@android:color/white"
      android:pathData="M1.39,4.22l2.27,2.27 1.41,-1.41L2.81,2.81 1.39,4.22zM21.19,22.61l1.41,-1.41 -2.27,-2.27 -1.41,1.41 2.27,2.27z"/>
</vector>
`,

    "WebAppInterface.java": `package __PACKAGE_NAME__;

import android.content.Context;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

public class WebAppInterface {
    private final Context mContext;

    public WebAppInterface(Context context) {
        this.mContext = context;
    }

    @JavascriptInterface
    public void showToast(String message) {
        Toast.makeText(mContext, message, Toast.LENGTH_SHORT).show();
    }

    @JavascriptInterface
    public void vibrate(long milliseconds) {
        try {
            Vibrator v = (Vibrator) mContext.getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) {
                v.vibrate(milliseconds);
            }
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public String getAppVersion() {
        return AppConfig.getInstance(mContext).versionName;
    }

    @JavascriptInterface
    public boolean isNativeApp() {
        return true;
    }
}
`,

    "AppConfig.java": `package __PACKAGE_NAME__;

import android.content.Context;
import org.json.JSONObject;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class AppConfig {
    private static AppConfig instance;

    public String url = "https://hypex.tech";
    public String appName = "HYPEX Web";
    public String packageName = "tech.hypex.app";
    public String versionName = "1.0.0";
    public int versionCode = 1;
    public String orientation = "portrait";
    public String statusBarColor = "#06080F";
    public boolean splashEnabled = true;
    public String splashType = "video"; // "video" or "image"
    public String splashScaleMode = "center";
    public String splashBgColor = "#06080F";
    public double splashDuration = 2.5;

    // Permissions
    public boolean permJavascript = true;
    public boolean permDomStorage = true;
    public boolean permCookies = true;
    public boolean permPullToRefresh = true;
    public boolean permCamera = true;
    public boolean permMic = true;
    public boolean permLocation = true;
    public boolean permNotifications = true;
    public boolean permFileUpload = true;
    public boolean permFileDownload = true;

    // Navigation & OAuth
    public String externalLinks = "custom_tabs"; // "custom_tabs", "external_browser", "in_app"
    public String backButton = "history"; // "history", "confirm_exit", "exit"
    public String oauthScheme = "hypexapp";
    public String oauthMode = "custom_tabs";
    public String customUserAgent = "HYPEX_Android/1.0";

    public static synchronized AppConfig getInstance(Context context) {
        if (instance == null) {
            instance = new AppConfig();
            instance.loadFromAssets(context);
        }
        return instance;
    }

    private void loadFromAssets(Context context) {
        try {
            InputStream is = context.getAssets().open("app_config.json");
            int size = is.available();
            byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();
            String json = new String(buffer, StandardCharsets.UTF_8);
            JSONObject obj = new JSONObject(json);

            if (obj.has("url")) this.url = obj.optString("url", this.url);
            if (obj.has("appName")) this.appName = obj.optString("appName", this.appName);
            if (obj.has("packageName")) this.packageName = obj.optString("packageName", this.packageName);
            if (obj.has("versionName")) this.versionName = obj.optString("versionName", this.versionName);
            if (obj.has("versionCode")) this.versionCode = obj.optInt("versionCode", this.versionCode);
            if (obj.has("orientation")) this.orientation = obj.optString("orientation", this.orientation);
            if (obj.has("statusBarColor")) this.statusBarColor = obj.optString("statusBarColor", this.statusBarColor);
            if (obj.has("splashEnabled")) this.splashEnabled = obj.optBoolean("splashEnabled", this.splashEnabled);
            if (obj.has("splashType")) this.splashType = obj.optString("splashType", this.splashType);
            if (obj.has("splashScaleMode")) this.splashScaleMode = obj.optString("splashScaleMode", this.splashScaleMode);
            if (obj.has("splashBgColor")) this.splashBgColor = obj.optString("splashBgColor", this.splashBgColor);
            if (obj.has("splashDuration")) this.splashDuration = obj.optDouble("splashDuration", this.splashDuration);

            if (obj.has("permissions")) {
                JSONObject perms = obj.getJSONObject("permissions");
                this.permJavascript = perms.optBoolean("javascript", true);
                this.permDomStorage = perms.optBoolean("domStorage", true);
                this.permCookies = perms.optBoolean("cookies", true);
                this.permPullToRefresh = perms.optBoolean("pullToRefresh", true);
                this.permCamera = perms.optBoolean("camera", true);
                this.permMic = perms.optBoolean("mic", true);
                this.permLocation = perms.optBoolean("location", true);
                this.permNotifications = perms.optBoolean("notifications", true);
                this.permFileUpload = perms.optBoolean("fileUpload", true);
                this.permFileDownload = perms.optBoolean("fileDownload", true);
            }

            if (obj.has("externalLinks")) this.externalLinks = obj.optString("externalLinks", this.externalLinks);
            if (obj.has("backButton")) this.backButton = obj.optString("backButton", this.backButton);
            if (obj.has("oauthScheme")) this.oauthScheme = obj.optString("oauthScheme", this.oauthScheme);
            if (obj.has("oauthMode")) this.oauthMode = obj.optString("oauthMode", this.oauthMode);
            if (obj.has("customUserAgent")) this.customUserAgent = obj.optString("customUserAgent", this.customUserAgent);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
`,

    "MainActivity.java": `package __PACKAGE_NAME__;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.PermissionRequest;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Toast;
import android.widget.VideoView;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.browser.customtabs.CustomTabsIntent;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.content.FileProvider;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.google.android.material.button.MaterialButton;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    private AppConfig config;
    private WebView webView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private ProgressBar progressBar;
    private FrameLayout splashContainer;
    private VideoView splashVideoView;
    private LinearLayout splashImageLayout;
    private LinearLayout offlineLayout;
    private MaterialButton btnRetry;
    private FrameLayout customViewContainer;
    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;

    // File Chooser & Camera
    private ValueCallback<Uri[]> mFilePathCallback;
    private String mCameraPhotoPath;
    private ActivityResultLauncher<Intent> fileChooserLauncher;

    // Permissions Request Launcher
    private ActivityResultLauncher<String[]> permissionsLauncher;
    private GeolocationPermissions.Callback mGeoCallback;
    private String mGeoOrigin;
    private PermissionRequest mWebRTCRequest;

    // Back Button Timing
    private long backPressedTime = 0;
    private boolean isPageLoaded = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        config = AppConfig.getInstance(this);

        // Configure Screen Orientation
        applyOrientationConfig();

        // Apply Status Bar Theme
        applyStatusBarColor();

        setContentView(R.layout.activity_main);

        // Bind Views
        webView = findViewById(R.id.mainWebView);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
        progressBar = findViewById(R.id.webProgressBar);
        splashContainer = findViewById(R.id.splashContainer);
        splashVideoView = findViewById(R.id.splashVideoView);
        splashImageLayout = findViewById(R.id.splashImageLayout);
        offlineLayout = findViewById(R.id.offlineLayout);
        btnRetry = findViewById(R.id.btnRetry);
        customViewContainer = findViewById(R.id.customViewContainer);

        // Setup File Chooser & Permission Launchers
        setupActivityResultLaunchers();

        // Setup UI Listeners & Retry Button
        btnRetry.setOnClickListener(v -> reloadPage());

        // Configure Swipe to Refresh
        setupSwipeRefresh();

        // Initialize Native WebView
        setupWebView();

        // Handle Splash Screen Execution
        setupSplashScreen();

        // Handle Deep Link or OAuth Callback in Intent
        handleDeepLinkIntent(getIntent());

        // Check & Request Startup Permissions if enabled
        requestNecessaryPermissions();
    }

    private void applyOrientationConfig() {
        if ("portrait".equalsIgnoreCase(config.orientation)) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        } else if ("landscape".equalsIgnoreCase(config.orientation)) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        } else {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
        }
    }

    private void applyStatusBarColor() {
        try {
            Window window = getWindow();
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            int color = Color.parseColor(config.statusBarColor);
            window.setStatusBarColor(color);
        } catch (Exception ignored) {}
    }

    private void setupSwipeRefresh() {
        if (config.permPullToRefresh) {
            swipeRefreshLayout.setEnabled(true);
            swipeRefreshLayout.setColorSchemeColors(Color.parseColor("#00F2FE"), Color.parseColor("#8B5CF6"));
            swipeRefreshLayout.setOnRefreshListener(() -> {
                if (isNetworkAvailable()) {
                    webView.reload();
                } else {
                    swipeRefreshLayout.setRefreshing(false);
                    showOfflineScreen();
                }
            });
        } else {
            swipeRefreshLayout.setEnabled(false);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();

        // Core JS & Storage
        settings.setJavaScriptEnabled(config.permJavascript);
        settings.setDomStorageEnabled(config.permDomStorage);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        // Security: Disallow mixed HTTP in HTTPS
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        // Cookies
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(config.permCookies);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(webView, config.permCookies);
        }

        // Cache Mode
        if (isNetworkAvailable()) {
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        } else {
            settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        }

        // Viewport & Zoom
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);

        // User Agent
        if (config.customUserAgent != null && !config.customUserAgent.isEmpty()) {
            String defaultUA = settings.getUserAgentString();
            settings.setUserAgentString(defaultUA + " " + config.customUserAgent);
        }

        // Geolocation
        settings.setGeolocationEnabled(config.permLocation);

        // Media Playback
        settings.setMediaPlaybackRequiresUserGesture(false);

        // JavaScript Bridge Interface
        webView.addJavascriptInterface(new WebAppInterface(this), "HYPEXNative");

        // WebChromeClient for File Choosing, Permissions & Alerts
        webView.setWebChromeClient(new AdvancedChromeClient());

        // WebViewClient for Navigation, Error Catching & OAuth
        webView.setWebViewClient(new AdvancedWebViewClient());

        // Download Listener
        if (config.permFileDownload) {
            webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
                handleDownload(url, contentDisposition, mimeType);
            });
        }

        // Initial Load
        if (isNetworkAvailable()) {
            webView.loadUrl(config.url);
        } else {
            showOfflineScreen();
        }
    }

    private void setupSplashScreen() {
        if (!config.splashEnabled) {
            splashContainer.setVisibility(View.GONE);
            return;
        }

        splashContainer.setVisibility(View.VISIBLE);
        try {
            splashContainer.setBackgroundColor(Color.parseColor(config.splashBgColor));
        } catch (Exception ignored) {}

        if ("video".equalsIgnoreCase(config.splashType)) {
            int videoResId = getResources().getIdentifier("splash", "raw", getPackageName());
            if (videoResId != 0) {
                splashImageLayout.setVisibility(View.GONE);
                splashVideoView.setVisibility(View.VISIBLE);
                Uri videoUri = Uri.parse("android.resource://" + getPackageName() + "/" + videoResId);
                splashVideoView.setVideoURI(videoUri);
                splashVideoView.setOnCompletionListener(mp -> dismissSplashScreen());
                splashVideoView.setOnErrorListener((mp, what, extra) -> {
                    dismissSplashScreen();
                    return true;
                });
                splashVideoView.start();
                return;
            }
        }

        // Fallback or Image Splash
        splashVideoView.setVisibility(View.GONE);
        splashImageLayout.setVisibility(View.VISIBLE);

        long durationMs = (long) (config.splashDuration * 1000);
        new Handler(Looper.getMainLooper()).postDelayed(this::dismissSplashScreen, durationMs);
    }

    private void dismissSplashScreen() {
        if (splashContainer.getVisibility() == View.VISIBLE) {
            splashContainer.animate()
                    .alpha(0f)
                    .setDuration(400)
                    .withEndAction(() -> splashContainer.setVisibility(View.GONE))
                    .start();
        }
    }

    private void setupActivityResultLaunchers() {
        fileChooserLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (mFilePathCallback == null) return;
                    Uri[] results = null;

                    if (result.getResultCode() == Activity.RESULT_OK) {
                        Intent data = result.getData();
                        if (data == null || data.getData() == null) {
                            if (mCameraPhotoPath != null) {
                                results = new Uri[]{Uri.parse(mCameraPhotoPath)};
                            }
                        } else {
                            String dataString = data.getDataString();
                            if (dataString != null) {
                                results = new Uri[]{Uri.parse(dataString)};
                            }
                        }
                    }
                    mFilePathCallback.onReceiveValue(results);
                    mFilePathCallback = null;
                }
        );

        permissionsLauncher = registerForActivityResult(
                new ActivityResultContracts.RequestMultiplePermissions(),
                result -> {
                    Boolean fineLoc = result.get(Manifest.permission.ACCESS_FINE_LOCATION);
                    if (fineLoc != null && fineLoc && mGeoCallback != null && mGeoOrigin != null) {
                        mGeoCallback.invoke(mGeoOrigin, true, false);
                    }
                    if (mWebRTCRequest != null) {
                        mWebRTCRequest.grant(mWebRTCRequest.getResources());
                        mWebRTCRequest = null;
                    }
                }
        );
    }

    private void requestNecessaryPermissions() {
        List<String> list = new ArrayList<>();
        if (config.permCamera && ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            list.add(Manifest.permission.CAMERA);
        }
        if (config.permMic && ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            list.add(Manifest.permission.RECORD_AUDIO);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && config.permNotifications) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                list.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }
        if (!list.isEmpty()) {
            permissionsLauncher.launch(list.toArray(new String[0]));
        }
    }

    private void handleDownload(String url, String contentDisposition, String mimeType) {
        try {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setMimeType(mimeType);
            request.allowScanningByMediaScanner();
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);

            String fileName = "downloaded_file";
            if (contentDisposition != null && contentDisposition.contains("filename=")) {
                fileName = contentDisposition.replaceFirst("(?i)^.*filename=\"?([^\"]+)\"?.*$", "$1");
            }
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);

            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            if (dm != null) {
                dm.enqueue(request);
                Toast.makeText(this, "İndirme başlatıldı: " + fileName, Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            Toast.makeText(this, "İndirme hatası: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeepLinkIntent(intent);
    }

    private void handleDeepLinkIntent(Intent intent) {
        if (intent == null) return;
        Uri data = intent.getData();
        if (data != null) {
            String scheme = data.getScheme();
            if (scheme != null && scheme.equalsIgnoreCase(config.oauthScheme)) {
                String authQuery = data.getQuery();
                if (authQuery != null) {
                    String targetAuthUrl = config.url + (config.url.contains("?") ? "&" : "?") + authQuery;
                    webView.loadUrl(targetAuthUrl);
                }
            } else if ("https".equalsIgnoreCase(scheme)) {
                webView.loadUrl(data.toString());
            }
        }
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm != null) {
            NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
            return activeNetwork != null && activeNetwork.isConnected();
        }
        return false;
    }

    private void showOfflineScreen() {
        webView.setVisibility(View.GONE);
        offlineLayout.setVisibility(View.VISIBLE);
        dismissSplashScreen();
    }

    private void hideOfflineScreen() {
        offlineLayout.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
    }

    private void reloadPage() {
        if (isNetworkAvailable()) {
            hideOfflineScreen();
            webView.reload();
        } else {
            Toast.makeText(this, R.string.offline_title, Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onBackPressed() {
        if (customView != null) {
            if (customViewCallback != null) {
                customViewCallback.onCustomViewHidden();
            }
            return;
        }

        if ("history".equalsIgnoreCase(config.backButton) && webView.canGoBack()) {
            webView.goBack();
            return;
        }

        if ("confirm_exit".equalsIgnoreCase(config.backButton)) {
            if (backPressedTime + 2000 > System.currentTimeMillis()) {
                super.onBackPressed();
            } else {
                Toast.makeText(this, R.string.exit_prompt, Toast.LENGTH_SHORT).show();
                backPressedTime = System.currentTimeMillis();
            }
            return;
        }

        super.onBackPressed();
    }

    private class AdvancedChromeClient extends WebChromeClient {

        @Override
        public void onProgressChanged(WebView view, int newProgress) {
            if (newProgress < 100) {
                progressBar.setVisibility(View.VISIBLE);
                progressBar.setProgress(newProgress);
            } else {
                progressBar.setVisibility(View.GONE);
                swipeRefreshLayout.setRefreshing(false);
            }
        }

        @Override
        public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
            if (!config.permFileUpload) return false;

            if (mFilePathCallback != null) {
                mFilePathCallback.onReceiveValue(null);
            }
            mFilePathCallback = filePathCallback;

            Intent takePictureIntent = null;
            if (config.permCamera && ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                File photoFile = null;
                try {
                    String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
                    File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
                    photoFile = File.createTempFile("IMG_" + timeStamp + "_", ".jpg", storageDir);
                    mCameraPhotoPath = "file:" + photoFile.getAbsolutePath();
                } catch (IOException ex) {
                    photoFile = null;
                }

                if (photoFile != null) {
                    Uri photoURI = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", photoFile);
                    takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI);
                } else {
                    takePictureIntent = null;
                }
            }

            Intent contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
            contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);
            contentSelectionIntent.setType("*/*");

            Intent[] intentArray = takePictureIntent != null ? new Intent[]{takePictureIntent} : new Intent[0];
            Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
            chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
            chooserIntent.putExtra(Intent.EXTRA_TITLE, "Dosya Seç");
            chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray);

            fileChooserLauncher.launch(chooserIntent);
            return true;
        }

        @Override
        public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
            if (!config.permLocation) {
                callback.invoke(origin, false, false);
                return;
            }
            if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                mGeoCallback = callback;
                mGeoOrigin = origin;
                permissionsLauncher.launch(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION});
            } else {
                callback.invoke(origin, true, false);
            }
        }

        @Override
        public void onPermissionRequest(PermissionRequest request) {
            mWebRTCRequest = request;
            List<String> needed = new ArrayList<>();
            for (String res : request.getResources()) {
                if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(res)) needed.add(Manifest.permission.CAMERA);
                if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(res)) needed.add(Manifest.permission.RECORD_AUDIO);
            }
            if (!needed.isEmpty()) {
                permissionsLauncher.launch(needed.toArray(new String[0]));
            } else {
                request.grant(request.getResources());
            }
        }

        @Override
        public void onShowCustomView(View view, CustomViewCallback callback) {
            if (customView != null) {
                callback.onCustomViewHidden();
                return;
            }
            customView = view;
            customViewCallback = callback;
            customViewContainer.addView(view, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
            customViewContainer.setVisibility(View.VISIBLE);
            webView.setVisibility(View.GONE);
        }

        @Override
        public void onHideCustomView() {
            if (customView == null) return;
            customViewContainer.removeView(customView);
            customView = null;
            customViewContainer.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            if (customViewCallback != null) customViewCallback.onCustomViewHidden();
        }
    }

    private class AdvancedWebViewClient extends WebViewClient {

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            String url = uri.toString();
            String scheme = uri.getScheme();

            if (scheme == null) return false;

            if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                    startActivity(intent);
                    return true;
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Bu işlem için uygun uygulama bulunamadı.", Toast.LENGTH_SHORT).show();
                    return true;
                }
            }

            if (isOAuthUrl(url)) {
                openInCustomTab(url);
                return true;
            }

            Uri baseUri = Uri.parse(config.url);
            boolean isSameHost = uri.getHost() != null && uri.getHost().equalsIgnoreCase(baseUri.getHost());

            if (!isSameHost) {
                if ("custom_tabs".equalsIgnoreCase(config.externalLinks)) {
                    openInCustomTab(url);
                    return true;
                } else if ("external_browser".equalsIgnoreCase(config.externalLinks)) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                    startActivity(intent);
                    return true;
                }
            }

            return false;
        }

        private boolean isOAuthUrl(String url) {
            String lower = url.toLowerCase();
            return lower.contains("accounts.google.com/o/oauth2") ||
                    lower.contains("appleid.apple.com/auth/authorize") ||
                    lower.contains("github.com/login/oauth/authorize") ||
                    lower.contains("facebook.com/v") && lower.contains("/dialog/oauth") ||
                    lower.contains("auth0.com/authorize");
        }

        private void openInCustomTab(String url) {
            try {
                CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
                builder.setShowTitle(true);
                builder.setToolbarColor(Color.parseColor(config.statusBarColor));
                CustomTabsIntent customTabsIntent = builder.build();
                customTabsIntent.launchUrl(MainActivity.this, Uri.parse(url));
            } catch (Exception e) {
                Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                startActivity(browserIntent);
            }
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
            hideOfflineScreen();
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            isPageLoaded = true;
            dismissSplashScreen();
            swipeRefreshLayout.setRefreshing(false);
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            super.onReceivedError(view, request, error);
            if (request.isForMainFrame()) {
                showOfflineScreen();
            }
        }

        @Override
        public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
            handler.cancel();
            Toast.makeText(MainActivity.this, "Güvenlik Hatası: Geçersiz SSL Sertifikası.", Toast.LENGTH_LONG).show();
            showOfflineScreen();
        }
    }
}
`
};
