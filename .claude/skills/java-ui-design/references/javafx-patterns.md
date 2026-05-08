# JavaFX Patterns Reference

## FXML + Controller MVC

### File structure
```
src/
├── main/java/com/example/
│   ├── MainApp.java          ← Application entry point
│   ├── MainController.java   ← FXML controller
│   └── model/
│       └── UserModel.java
└── main/resources/com/example/
    ├── main-view.fxml        ← Layout
    └── style.css             ← Styles
```

### FXML template
```xml
<?xml version="1.0" encoding="UTF-8"?>
<?import javafx.scene.layout.*?>
<?import javafx.scene.control.*?>
<BorderPane xmlns:fx="http://javafx.com/fxml"
            fx:controller="com.example.MainController"
            prefWidth="800" prefHeight="600">
    <top>
        <ToolBar>
            <Button text="New" onAction="#handleNew"/>
            <Separator/>
            <Button text="Save" onAction="#handleSave"/>
        </ToolBar>
    </top>
    <center>
        <TableView fx:id="dataTable">
            <columns>
                <TableColumn text="Name" fx:id="nameCol"/>
                <TableColumn text="Value" fx:id="valueCol"/>
            </columns>
        </TableView>
    </center>
    <bottom>
        <Label fx:id="statusLabel" text="Ready"/>
    </bottom>
</BorderPane>
```

### Controller template
```java
public class MainController implements Initializable {
    @FXML private TableView<MyItem> dataTable;
    @FXML private TableColumn<MyItem, String> nameCol;
    @FXML private Label statusLabel;

    private ObservableList<MyItem> items = FXCollections.observableArrayList();

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        nameCol.setCellValueFactory(new PropertyValueFactory<>("name"));
        dataTable.setItems(items);
    }

    @FXML
    private void handleNew() {
        // runs on JavaFX Application Thread — safe to update UI directly
        items.add(new MyItem("New Item"));
        statusLabel.setText("Item added");
    }

    @FXML
    private void handleSave() {
        // Long task → move off FX thread
        Task<Void> saveTask = new Task<>() {
            @Override protected Void call() throws Exception {
                updateMessage("Saving...");
                // ... do I/O work here ...
                return null;
            }
        };
        saveTask.messageProperty().addListener((obs, old, msg) ->
            statusLabel.setText(msg));
        new Thread(saveTask).start();
    }
}
```

---

## CSS Theming in JavaFX

### Applying a stylesheet
```java
scene.getStylesheets().add(
    getClass().getResource("/com/example/style.css").toExternalForm()
);
```

### CSS variables (JavaFX 18+)
```css
.root {
    -fx-base: #1e1e2e;           /* Background base */
    -fx-accent: #7c3aed;         /* Primary accent (purple) */
    -fx-focus-color: -fx-accent;
    -fx-font-family: "Segoe UI", sans-serif;
    -fx-font-size: 14px;
}

.button {
    -fx-background-color: -fx-accent;
    -fx-text-fill: white;
    -fx-background-radius: 6px;
    -fx-padding: 8px 16px;
    -fx-cursor: hand;
}

.button:hover {
    -fx-background-color: derive(-fx-accent, -10%);
}

.button:pressed {
    -fx-background-color: derive(-fx-accent, -20%);
    -fx-scale-x: 0.98;
    -fx-scale-y: 0.98;
}

/* Dark card panel */
.card {
    -fx-background-color: #2a2a3e;
    -fx-background-radius: 12px;
    -fx-padding: 16px;
    -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.4), 8, 0, 0, 2);
}
```

### Dark/Light mode toggle
```java
private boolean darkMode = false;

private void toggleTheme(Scene scene) {
    String dark = getClass().getResource("/dark.css").toExternalForm();
    String light = getClass().getResource("/light.css").toExternalForm();
    scene.getStylesheets().clear();
    scene.getStylesheets().add(darkMode ? light : dark);
    darkMode = !darkMode;
}
```

---

## Animation Patterns

### Fade in on load
```java
node.setOpacity(0);
FadeTransition ft = new FadeTransition(Duration.millis(300), node);
ft.setFromValue(0);
ft.setToValue(1);
ft.play();
```

### Slide in from side
```java
node.setTranslateX(-300);
TranslateTransition tt = new TranslateTransition(Duration.millis(250), node);
tt.setToX(0);
tt.setInterpolator(Interpolator.EASE_OUT);
tt.play();
```

### Chained animations
```java
SequentialTransition seq = new SequentialTransition(
    new FadeTransition(Duration.millis(200), header),
    new TranslateTransition(Duration.millis(300), content)
);
seq.play();
```

---

## Common Layout Recipes

### Navigation sidebar + content area
```java
HBox root = new HBox();
VBox sidebar = new VBox(8);
sidebar.setPrefWidth(200);
sidebar.getStyleClass().add("sidebar");

StackPane content = new StackPane();
HBox.setHgrow(content, Priority.ALWAYS);

root.getChildren().addAll(sidebar, content);
```

### Responsive form with GridPane
```java
GridPane form = new GridPane();
form.setHgap(12);
form.setVgap(10);
form.setPadding(new Insets(20));

ColumnConstraints labelCol = new ColumnConstraints(120);
ColumnConstraints fieldCol = new ColumnConstraints();
fieldCol.setHgrow(Priority.ALWAYS);
form.getColumnConstraints().addAll(labelCol, fieldCol);

// Row 0: Name
form.add(new Label("Name:"), 0, 0);
TextField nameField = new TextField();
form.add(nameField, 1, 0);
```

### Dashboard card grid
```java
TilePane tiles = new TilePane(16, 16);
tiles.setPrefColumns(3);
tiles.setPadding(new Insets(16));

for (String title : new String[]{"Revenue", "Users", "Orders"}) {
    VBox card = new VBox(8);
    card.getStyleClass().add("card");
    card.setPrefSize(200, 120);
    card.getChildren().addAll(new Label(title), new Label("—"));
    tiles.getChildren().add(card);
}
```

---

## AtlantaFX / MaterialFX Setup

### AtlantaFX (recommended modern theme)
```xml
<dependency>
    <groupId>io.github.palexdev</groupId>
    <artifactId>atlantafx-base</artifactId>
    <version>2.0.1</version>
</dependency>
```
```java
Application.setUserAgentStylesheet(new PrimerDark().getUserAgentStylesheet());
// Options: PrimerLight, PrimerDark, NordLight, NordDark, CupertinoLight, CupertinoDark
```

### Ikonli icons
```xml
<dependency>
    <groupId>org.kordamp.ikonli</groupId>
    <artifactId>ikonli-javafx</artifactId>
    <version>12.3.1</version>
</dependency>
<dependency>
    <groupId>org.kordamp.ikonli</groupId>
    <artifactId>ikonli-materialdesign2-pack</artifactId>
    <version>12.3.1</version>
</dependency>
```
```java
FontIcon icon = new FontIcon("mdi2h-home");
icon.setIconSize(20);
button.setGraphic(icon);
```
