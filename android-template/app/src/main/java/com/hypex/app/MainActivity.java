package com.hypex.app;

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
            // Check if raw/splash.mp4 exists or stream from assets
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

        // Schedule minimum duration dismiss
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
        // File Chooser
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

        // Permissions Request
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
                // Captured OAuth Callback (e.g. hypexapp://oauth-callback?token=XYZ)
                String authQuery = data.getQuery();
                if (authQuery != null) {
                    // Inject session to WebView or load OAuth finish URL
                    String targetAuthUrl = config.url + (config.url.contains("?") ? "&" : "?") + authQuery;
                    webView.loadUrl(targetAuthUrl);
                }
            } else if ("https".equalsIgnoreCase(scheme)) {
                // App Link navigation
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
        // 1. Fullscreen Custom View Dismiss
        if (customView != null) {
            if (customViewCallback != null) {
                customViewCallback.onCustomViewHidden();
            }
            return;
        }

        // 2. WebView History Back
        if ("history".equalsIgnoreCase(config.backButton) && webView.canGoBack()) {
            webView.goBack();
            return;
        }

        // 3. Confirm Exit Toast
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

    // ==========================================
    // ChromeClient: File Chooser, Geolocation, Video
    // ==========================================
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

        // Fullscreen HTML5 Video
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

    // ==========================================
    // WebViewClient: Navigation, Schemes & OAuth
    // ==========================================
    private class AdvancedWebViewClient extends WebViewClient {

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            String url = uri.toString();
            String scheme = uri.getScheme();

            if (scheme == null) return false;

            // 1. External Intents (tel:, mailto:, sms:, whatsapp:, market:)
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

            // 2. Google OAuth & Auth Providers Detection (Bypass Google 403 disallowed_useragent)
            if (isOAuthUrl(url)) {
                openInCustomTab(url);
                return true;
            }

            // 3. External Links Routing
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
            // Secure policy: Never proceed on invalid SSL certificates
            handler.cancel();
            Toast.makeText(MainActivity.this, "Güvenlik Hatası: Geçersiz SSL Sertifikası.", Toast.LENGTH_LONG).show();
            showOfflineScreen();
        }
    }
}
