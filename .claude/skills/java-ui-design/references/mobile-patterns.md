# Gluon Mobile Patterns Reference

## Project Bootstrap

1. Go to **https://start.gluon.io/**
2. Select components:
   - **Glisten** — mobile-optimized controls
   - **Attach** — hardware APIs you need (GPS, Camera, Storage, etc.)
   - **Afterburner** (optional) — lightweight DI for MVP pattern
3. Download, import into IntelliJ (requires Gluon plugin)
4. Test on desktop first: `mvn javafx:run`
5. Build native: `mvn -Pios client:build client:run` (macOS only for iOS)
   or: `mvn -Pandroid client:build client:run`

### Maven plugin
```xml
<plugin>
    <groupId>com.gluonhq</groupId>
    <artifactId>gluonfx-maven-plugin</artifactId>
    <version>1.0.22</version>
    <configuration>
        <mainClass>com.example.MainApp</mainClass>
    </configuration>
</plugin>
```

---

## App Structure (Multiview Pattern)

```java
public class MainApp extends MobileApplication {
    public static final String HOME_VIEW = HOME;
    public static final String DETAIL_VIEW = "detail";

    @Override
    public void init() {
        addViewFactory(HOME_VIEW, HomeView::new);
        addViewFactory(DETAIL_VIEW, DetailView::new);
    }

    @Override
    public void postInit(Scene scene) {
        Skins.defaultSkin(scene); // apply Glisten default skin
    }
}
```

### View template
```java
public class HomeView extends View {
    public HomeView() {
        // AppBar is set per-view in onShowing()
        VBox content = new VBox(16);
        content.setPadding(new Insets(16));
        content.setAlignment(Pos.TOP_CENTER);

        Button nextBtn = new Button("Go to Detail");
        nextBtn.setOnAction(e ->
            MobileApplication.getInstance().switchView(MainApp.DETAIL_VIEW));

        content.getChildren().add(nextBtn);
        setCenter(new ScrollPane(content));
    }

    @Override
    protected void updateAppBar(AppBar appBar) {
        appBar.setNavIcon(MaterialDesignIcon.MENU.button(e ->
            MobileApplication.getInstance().getDrawer().open()));
        appBar.setTitleText("Home");
        appBar.getActionItems().add(
            MaterialDesignIcon.SEARCH.button(e -> System.out.println("search")));
    }
}
```

---

## Glisten Controls

### NavigationDrawer
```java
NavigationDrawer drawer = MobileApplication.getInstance().getDrawer();
NavigationDrawer.Item homeItem =
    new NavigationDrawer.Item("Home", MaterialDesignIcon.HOME.graphic());
NavigationDrawer.Item settingsItem =
    new NavigationDrawer.Item("Settings", MaterialDesignIcon.SETTINGS.graphic());

drawer.getItems().addAll(homeItem, settingsItem);
drawer.selectedItemProperty().addListener((obs, old, item) -> {
    if (item == homeItem)
        MobileApplication.getInstance().switchView(MainApp.HOME_VIEW);
    else if (item == settingsItem)
        MobileApplication.getInstance().switchView(MainApp.SETTINGS_VIEW);
});
```

### BottomNavigation
```java
BottomNavigation bottomNav = new BottomNavigation();
BottomNavigationButton homeBtn =
    new BottomNavigationButton("Home", MaterialDesignIcon.HOME.graphic());
BottomNavigationButton profileBtn =
    new BottomNavigationButton("Profile", MaterialDesignIcon.PERSON.graphic());
bottomNav.getActionItems().addAll(homeBtn, profileBtn);
setBottom(bottomNav);
```

### FloatingActionButton
```java
FloatingActionButton fab = new FloatingActionButton(
    MaterialDesignIcon.ADD.text,
    e -> System.out.println("FAB clicked")
);
fab.showOn(this); // attaches to bottom-right of current view
```

---

## Attach — Hardware APIs

### GPS / Location
```java
Position service = Services.get(PositionService.class).orElseThrow();
service.positionProperty().addListener((obs, old, pos) -> {
    double lat = pos.getLatitude();
    double lon = pos.getLongitude();
    Platform.runLater(() -> locationLabel.setText(lat + ", " + lon));
});
service.start();
```

### Storage
```java
StorageService storage = Services.get(StorageService.class).orElseThrow();
File privateDir = storage.getPrivateStorage().orElseThrow();
File dataFile = new File(privateDir, "data.json");
// Read/write normally
```

### Push Notifications (requires CloudLink)
```java
PushNotificationsService push =
    Services.get(PushNotificationsService.class).orElseThrow();
push.register("your-gcm-or-apns-sender-id");
```

---

## Mobile UX Rules

### Touch target sizes
```java
// Minimum 44x44 dp for any tappable element
button.setMinSize(44, 44);
```

### Responsive layout by screen size
```java
double screenW = Screen.getPrimary().getBounds().getWidth();
boolean isTablet = screenW >= 600;

if (isTablet) {
    // Two-column layout
    HBox layout = new HBox(16);
    layout.getChildren().addAll(sidePanel, contentArea);
    setCenter(layout);
} else {
    // Single column
    setCenter(contentArea);
}
```

### Keyboard avoidance (text fields)
```java
// Wrap form in a ScrollPane so it scrolls above keyboard
ScrollPane scroll = new ScrollPane(formPane);
scroll.setFitToWidth(true);
setCenter(scroll);
```

### Loading state
```java
ProgressIndicator spinner = new ProgressIndicator();
spinner.setMaxSize(48, 48);

// Show while loading
setCenter(spinner);

// Background task
Task<List<Item>> task = new Task<>() {
    @Override protected List<Item> call() { return fetchData(); }
};
task.setOnSucceeded(e -> {
    Platform.runLater(() -> {
        setCenter(buildListView(task.getValue()));
    });
});
new Thread(task).start();
```

---

## Build Pipeline Summary

| Target | Command | Requirements |
|---|---|---|
| Desktop (test) | `mvn javafx:run` | JDK 17+, JavaFX |
| Desktop native | `mvn -Pdesktop gluonfx:build` | GraalVM 22.3+ |
| Android | `mvn -Pandroid gluonfx:build` | Linux/macOS, Android SDK |
| iOS | `mvn -Pios gluonfx:build` | macOS only, Xcode 14+ |

### GraalVM reflection config
Gluon Substrate auto-generates most reflection config. For custom classes used reflectively (e.g., FXML controllers), add to `src/main/resources/META-INF/native-image/reflect-config.json`:
```json
[
  {
    "name": "com.example.HomeController",
    "allDeclaredConstructors": true,
    "allDeclaredMethods": true,
    "allDeclaredFields": true
  }
]
```

---

## Common Gotchas

| Issue | Fix |
|---|---|
| App works on desktop but crashes on device | Missing reflection config for FXML controllers |
| Fonts look wrong on iOS | Embed font file in resources, load with `Font.loadFont()` |
| Layout too small on tablets | Use screen size detection; set `prefWidth` relative to screen |
| Hardware API returns empty Optional | Add the Attach service dependency and required permissions in `AndroidManifest.xml` / iOS `Info.plist` |
| Long startup on Android | Normal for first run with GraalVM native; subsequent launches are fast |
