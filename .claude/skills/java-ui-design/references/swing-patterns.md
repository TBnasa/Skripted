# Swing Patterns Reference

## EDT (Event Dispatch Thread) Rules

This is the #1 source of Swing bugs. Memorize these:

```java
// CORRECT: Create UI on EDT
SwingUtilities.invokeLater(() -> {
    JFrame frame = new JFrame("App");
    frame.setVisible(true);
});

// CORRECT: Update UI from background thread
worker.addPropertyChangeListener(evt -> {
    if ("state".equals(evt.getPropertyName())
        && SwingWorker.StateValue.DONE == evt.getNewValue()) {
        SwingUtilities.invokeLater(() -> label.setText("Done"));
    }
});

// WRONG: Never do this from a background thread
label.setText("Done"); // ← race condition / visual corruption
```

---

## SwingWorker Pattern

Use for any task > ~50ms (network, file I/O, computation):

```java
public class DataLoader extends SwingWorker<List<String>, String> {
    private final JProgressBar progressBar;
    private final JTextArea log;

    public DataLoader(JProgressBar pb, JTextArea log) {
        this.progressBar = pb;
        this.log = log;
    }

    @Override
    protected List<String> doInBackground() throws Exception {
        // Runs on background thread — NO UI access here
        List<String> results = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            setProgress(i);           // triggers progress property change
            publish("Processing " + i); // sends to process()
            results.add("item-" + i);
            Thread.sleep(20);
        }
        return results;
    }

    @Override
    protected void process(List<String> chunks) {
        // Runs on EDT — safe to update UI
        chunks.forEach(msg -> log.append(msg + "\n"));
    }

    @Override
    protected void done() {
        // Runs on EDT after doInBackground completes
        try {
            List<String> data = get();
            progressBar.setValue(100);
            JOptionPane.showMessageDialog(null, "Loaded " + data.size() + " items");
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, "Error: " + e.getMessage(),
                "Error", JOptionPane.ERROR_MESSAGE);
        }
    }
}

// Usage:
DataLoader loader = new DataLoader(progressBar, logArea);
loader.addPropertyChangeListener(evt -> {
    if ("progress".equals(evt.getPropertyName()))
        progressBar.setValue((int) evt.getNewValue());
});
loader.execute();
```

---

## FlatLaf Configuration

### Basic setup
```java
// In main() BEFORE creating any Swing components
FlatLightLaf.setup();          // Light theme
// or
FlatDarkLaf.setup();           // Dark theme
// or
FlatIntelliJLaf.setup();       // IntelliJ-style light
// or
FlatDarculaLaf.setup();        // Darcula dark

JFrame.setDefaultLookAndFeelDecorated(true); // Custom title bar
```

### Runtime theme switching
```java
private void switchTheme(boolean dark) {
    try {
        if (dark) FlatDarkLaf.setup();
        else FlatLightLaf.setup();
        SwingUtilities.updateComponentTreeUI(frame);
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

### Custom FlatLaf properties
```java
// Before setup()
UIManager.put("Button.arc", 10);                         // Rounded buttons
UIManager.put("Component.arc", 8);                       // Rounded fields
UIManager.put("ProgressBar.arc", 4);
UIManager.put("Button.margin", new Insets(6, 14, 6, 14));
UIManager.put("defaultFont", new Font("Segoe UI", Font.PLAIN, 13));
// Accent color
UIManager.put("Component.accentColor", new Color(0x7C3AED));
FlatLightLaf.setup();
```

### Maven dependency
```xml
<dependency>
    <groupId>com.formdev</groupId>
    <artifactId>flatlaf</artifactId>
    <version>3.4</version>
</dependency>
```

---

## Layout Recipes

### MigLayout (recommended for complex forms)
```xml
<dependency>
    <groupId>com.miglayout</groupId>
    <artifactId>miglayout-swing</artifactId>
    <version>11.3</version>
</dependency>
```
```java
JPanel form = new JPanel(new MigLayout("wrap 2, insets 20, gap 10",
    "[right, 120][grow, fill]"));

form.add(new JLabel("First Name:"));
form.add(new JTextField(20));

form.add(new JLabel("Email:"));
form.add(new JTextField(20));

form.add(new JLabel("Role:"));
JComboBox<String> roleBox = new JComboBox<>(new String[]{"Admin", "User", "Viewer"});
form.add(roleBox);

// Full-width button row
form.add(new JButton("Save"), "skip 1, align right");
```

### Standard app shell (BorderLayout)
```java
JFrame frame = new JFrame("App");
frame.setLayout(new BorderLayout());

// Menu bar
JMenuBar menuBar = new JMenuBar();
JMenu file = new JMenu("File");
file.add(new JMenuItem("Open"));
file.add(new JMenuItem("Save"));
file.addSeparator();
file.add(new JMenuItem("Exit"));
menuBar.add(file);
frame.setJMenuBar(menuBar);

// Toolbar
JToolBar toolbar = new JToolBar();
toolbar.setFloatable(false);
toolbar.add(new JButton("New"));
toolbar.add(new JButton("Open"));
toolbar.addSeparator();
toolbar.add(new JButton("Save"));
frame.add(toolbar, BorderLayout.NORTH);

// Main content
JSplitPane split = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT);
split.setLeftComponent(new JScrollPane(new JTree()));
split.setRightComponent(new JScrollPane(new JTextArea()));
split.setDividerLocation(200);
frame.add(split, BorderLayout.CENTER);

// Status bar
JLabel statusBar = new JLabel(" Ready");
statusBar.setBorder(BorderFactory.createEtchedBorder());
frame.add(statusBar, BorderLayout.SOUTH);
```

---

## Custom Table with Renderer

```java
// Model
public class PersonTableModel extends AbstractTableModel {
    private final String[] cols = {"Name", "Age", "Active"};
    private final List<Person> data;

    public PersonTableModel(List<Person> data) { this.data = data; }

    @Override public int getRowCount() { return data.size(); }
    @Override public int getColumnCount() { return cols.length; }
    @Override public String getColumnName(int col) { return cols[col]; }

    @Override
    public Object getValueAt(int row, int col) {
        Person p = data.get(row);
        return switch (col) {
            case 0 -> p.getName();
            case 1 -> p.getAge();
            case 2 -> p.isActive();
            default -> null;
        };
    }

    @Override public Class<?> getColumnClass(int col) {
        return col == 2 ? Boolean.class : super.getColumnClass(col);
    }
}

// Alternating row renderer
public class StripedRenderer extends DefaultTableCellRenderer {
    @Override
    public Component getTableCellRendererComponent(
            JTable table, Object value, boolean isSelected,
            boolean hasFocus, int row, int col) {
        Component c = super.getTableCellRendererComponent(
            table, value, isSelected, hasFocus, row, col);
        if (!isSelected) {
            c.setBackground(row % 2 == 0
                ? table.getBackground()
                : new Color(245, 245, 250));
        }
        return c;
    }
}

// Usage
JTable table = new JTable(new PersonTableModel(people));
table.setDefaultRenderer(Object.class, new StripedRenderer());
table.setRowHeight(28);
table.getTableHeader().setReorderingAllowed(false);
```

---

## MVC with PropertyChangeSupport

```java
// Model
public class AppModel {
    private final PropertyChangeSupport pcs = new PropertyChangeSupport(this);
    private String status = "Ready";

    public void setStatus(String status) {
        String old = this.status;
        this.status = status;
        pcs.firePropertyChange("status", old, status);
    }
    public String getStatus() { return status; }
    public void addPropertyChangeListener(PropertyChangeListener l) { pcs.addPropertyChangeListener(l); }
}

// Controller wires model → view
model.addPropertyChangeListener(evt -> {
    if ("status".equals(evt.getPropertyName())) {
        SwingUtilities.invokeLater(() ->
            statusLabel.setText((String) evt.getNewValue()));
    }
});
```

---

## Accessibility Checklist for Swing

- [ ] Every `JTextField` / `JComboBox` has a matching `JLabel` with `setLabelFor(field)`
- [ ] All buttons have descriptive text or `getAccessibleContext().setAccessibleName("...")`
- [ ] `setToolTipText()` on icon-only buttons
- [ ] Tab order set with `setFocusTraversalOrder()` if non-standard
- [ ] Error messages use `JOptionPane` with `ERROR_MESSAGE` type (triggers OS accessibility alert)
- [ ] Colors never used as the only indicator (pair with text or icon)
