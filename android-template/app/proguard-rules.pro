# Proguard rules for HYPEX Android WebView
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-dontwarn android.webkit.**
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public void openFileChooser(...);
}
