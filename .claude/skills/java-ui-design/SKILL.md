---
name: java-ui-design
description: >
  Expert Java UI/UX design skill covering JavaFX, Swing, and Gluon Mobile (iOS/Android).
  Use this skill whenever the user asks to build, design, style, or improve any Java graphical
  user interface — including desktop apps, enterprise Swing applications, mobile apps with
  Gluon/JavaFX, UI components, layouts, themes, animations, or anything visual in Java.
  Also trigger for: "make it look modern", "add dark mode", "design a login screen in Java",
  "JavaFX layout", "Swing form", "Java mobile UI", "FXML", "Scene Builder", "FlatLaf",
  "MaterialFX", or any request involving Java + screens/windows/views/components/widgets.
  Output scales to the request: full working apps, isolated components, prototypes, or
  design guidance + code skeletons — whichever best matches the user's ask.
---

# Java UI/UX Design Skill

A comprehensive guide for designing and building polished, production-ready Java UIs across
three target platforms: **JavaFX (modern desktop)**, **Swing (legacy/enterprise)**, and
**Gluon Mobile (iOS & Android)**.

---

## 1. Understand the Request First

Before writing any code, identify:

| Signal | Framework |
|---|---|
| "JavaFX", "FXML", "Scene Builder", "modern desktop" | → JavaFX |
| "Swing", "JFrame", "JPanel", "legacy", "enterprise" | → Swing |
| "mobile", "Android", "iOS", "phone app", "Gluon" | → Gluon Mobile |
| Ambiguous / new project | → Recommend JavaFX (it's the modern default) |

Then decide **output level**:
- **Full app**: complete runnable code with layout + event logic
- **Component**: isolated reusable control or panel
- **Prototype / skeleton**: structure + comments, no deep logic
- **Design guidance**: patterns, library recs, UX advice

---

## 2. Framework Quick Reference

### JavaFX (Modern Desktop)
- **Architecture**: Scene Graph → Stage → Scene → Nodes
- **Layout panes**: `VBox`, `HBox`, `BorderPane`, `GridPane`, `StackPane`, `AnchorPane`
- **Separation of concerns**: FXML for layout, CSS for styling, Java/Kotlin controller for logic (MVC)
- **Tooling**: Scene Builder (drag-and-drop FXML editor)
- **Styling**: CSS with `-fx-` prefixed properties; supports dark/light themes
- **Threading rule**: All UI updates must happen on the **JavaFX Application Thread**; use `Platform.runLater()` for background→UI updates
- **Modern themes**: AtlantaFX, MaterialFX, BootstrapFX (add as Maven/Gradle dep)
- **Animation**: `Timeline`, `Transition`, `FadeTransition`, `TranslateTransition`

**Minimal JavaFX app structure:**
```java
public class MyApp extends Application {
    @Override
    public void start(Stage stage) {
        VBox root = new VBox(10);
        root.setPadding(new Insets(20));
        root.getStylesheets().add(getClass().getResource("style.css").toExternalForm());

        Button btn = new Button("Click Me");
        btn.getStyleClass().add("primary-button");
        btn.setOnAction(e -> System.out.println("Clicked"));

        root.getChildren().add(btn);
        stage.setScene(new Scene(root, 600, 400));
        stage.setTitle("My App");
        stage.show();
    }
    public static void main(String[] args) { launch(args); }
}
```

**Maven dependency (JavaFX 21+):**
```xml
<dependency>
    <groupId>org.openjfx</groupId>
    <artifactId>javafx-controls</artifactId>
    <version>21.0.2</version>
</dependency>
<dependency>
    <groupId>org.openjfx</groupId>
    <artifactId>javafx-fxml</artifactId>
    <version>21.0.2</version>
</dependency>
```

---

### Swing (Legacy / Enterprise)
- **Architecture**: AWT → Swing components (all prefixed `J`)
- **Threading rule (critical)**: ALL Swing UI work must run on the **Event Dispatch Thread (EDT)**
  ```java
  SwingUtilities.invokeLater(() -> new MyFrame().setVisible(true));
  ```
- **Background work**: Use `SwingWorker<T, V>` — never block the EDT with I/O or computation
- **Layout managers** (prefer over absolute positioning):
  - `BorderLayout` — 5-region (North/South/East/West/Center), good for app shells
  - `GridBagLayout` — flexible grid, verbose but powerful
  - `MigLayout` *(3rd party, highly recommended)* — concise, powerful
  - `BoxLayout` — single axis stacking
- **Modern look**: Use **FlatLaf** for a flat, modern L&F (used by IntelliJ, JetBrains IDEs)
  ```java
  FlatLightLaf.setup(); // or FlatDarkLaf.setup()
  // Maven: com.formdev:flatlaf:3.4
  ```
- **MVC in Swing**: Use `AbstractTableModel` / `DefaultListModel` for data; `PropertyChangeSupport` to notify view from model
- **Accessibility**: Set `setName()`, `setToolTipText()`, use `JLabel.setLabelFor()`
- **HiDPI**: Java 9+ improved; use vector/SVG icons and avoid hardcoded pixel sizes

**Minimal Swing app structure:**
```java
public class MyFrame extends JFrame {
    public MyFrame() {
        setTitle("My App");
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setSize(600, 400);

        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JButton btn = new JButton("Click Me");
        btn.addActionListener(e -> JOptionPane.showMessageDialog(this, "Hello!"));

        panel.add(new JLabel("Welcome"), BorderLayout.NORTH);
        panel.add(btn, BorderLayout.SOUTH);
        add(panel);
    }
    public static void main(String[] args) {
        FlatLightLaf.setup();
        SwingUtilities.invokeLater(() -> new MyFrame().setVisible(true));
    }
}
```

---

### Gluon Mobile (iOS & Android)
- **Based on**: JavaFX + GraalVM Native Image compiled to native iOS/Android binaries
- **Key libraries**:
  - **Glisten**: Mobile-optimized JavaFX controls (NavigationDrawer, AppBar, BottomNavigation)
  - **Attach**: Device hardware APIs (GPS, camera, accelerometer, storage) — platform-agnostic
  - **Gluon Maps**: Map integration
- **Build tool**: Gluon Client Maven plugin → compiles to native image via GraalVM
- **Project bootstrap**: Use https://start.gluon.io/ to generate a project
- **Design rules for mobile**:
  - Minimum touch target: **44×44 dp**
  - Use `ScrollPane` liberally — screens scroll, don't truncate
  - Avoid hover-dependent interactions (no mouse on touch)
  - Use `AppBar` + `NavigationDrawer` or `BottomNavigation` for navigation
  - Adapt layout with `Screen.getPrimary().getBounds()` for screen size detection
- **Testing**: Simulate on desktop first with mouse events; deploy to device for final validation
- **IDE support**: Gluon plugin for IntelliJ IDEA, Eclipse, NetBeans

**Maven dependency:**
```xml
<dependency>
    <groupId>com.gluonhq</groupId>
    <artifactId>charm-glisten</artifactId>
    <version>6.2.3</version>
</dependency>
```

---

## 3. UX/UI Design Principles (Apply to All Frameworks)

### Visual Hierarchy
- Use size, weight, and spacing to guide attention (largest/boldest = most important)
- Group related elements with whitespace and borders
- Consistent padding: 8px / 16px / 24px grid

### Color & Theming
- Always support both **light and dark modes** in 2025
- Define a palette: primary, secondary, surface, on-surface, error
- JavaFX: override CSS variables in a root style rule
- Swing: customize `UIManager` properties or use FlatLaf theme customization

### Typography
- Limit to 2 font families max (one for headings, one for body)
- Minimum body font: 13–14px desktop, 16px mobile
- Never use text as the only differentiator (pair with icons or color)

### Feedback & Responsiveness
- Every button click must produce visible feedback (ripple, hover, active state)
- Loading states: use `ProgressIndicator` / `ProgressBar` — never freeze the UI
- Validation: show errors inline near the field, not just in a dialog

### Accessibility
- All interactive elements must be keyboard-navigable
- Labels for every form field (`setLabelFor` in Swing, `setPromptText` + explicit label in JavaFX)
- Color contrast ratio: minimum 4.5:1 for body text (WCAG AA)
- Tooltips on icon-only buttons

### Layout Do's and Don'ts
| Do | Don't |
|---|---|
| Use layout managers / panes | Hardcode pixel positions |
| Test on multiple screen resolutions | Assume a fixed screen size |
| Use `VBox`/`HBox` spacing for rhythm | Pile components with zero padding |
| Separate UI code from business logic (MVC) | Put logic inside `ActionListener` / `setOnAction` |

---

## 4. Output Mode Guidance

### Full Working App
- Provide all necessary imports
- Include `main()` entry point
- Wire up at least one real interaction (button → action)
- Add a comment block explaining how to run it

### Component / Snippet
- Self-contained class or method
- Show how to add it to a parent container
- Include relevant CSS if styling is involved

### Design Guidance (no code)
- Provide wireframe description, layout hierarchy, and component names
- Suggest library/Look-and-Feel choices
- Note threading and accessibility rules relevant to the case

### Prototyping Advice
- For JavaFX: recommend Scene Builder + FXML workflow
- For Swing: recommend MigLayout + FlatLaf for fastest modern-looking result
- For mobile: start at start.gluon.io, test on desktop first

---

## 5. Third-Party Library Cheat Sheet

| Need | Library | Framework |
|---|---|---|
| Modern flat theme | FlatLaf | Swing |
| Material Design controls | MaterialFX | JavaFX |
| Bootstrap-style theme | BootstrapFX | JavaFX |
| Atlantic modern theme | AtlantaFX | JavaFX |
| Mobile controls | Glisten (Gluon) | JavaFX/Mobile |
| Flexible layout | MigLayout | Swing |
| Charts | JFreeChart | Swing |
| Charts | JavaFX built-in / TilesFX | JavaFX |
| Rich text editor | RSyntaxTextArea | Swing |
| Gauges / dials | Medusa | JavaFX |
| Icon packs | Ikonli (FontAwesome, Material) | Both |

---

## 6. Reference Files

For deeper dives, read the relevant reference:
- `references/javafx-patterns.md` — FXML structure, CSS theming, MVC wiring, animation patterns
- `references/swing-patterns.md` — EDT rules, SwingWorker patterns, FlatLaf config, common layouts
- `references/mobile-patterns.md` — Gluon project structure, Attach APIs, mobile UX rules, build pipeline

Load these **only when the request requires deep detail** on that specific framework.
