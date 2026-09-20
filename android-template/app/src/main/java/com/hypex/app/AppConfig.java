package com.hypex.app;

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
