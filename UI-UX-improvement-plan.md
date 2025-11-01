# UI/UX Improvement Plan for SQLite Query Graph

## Current State Analysis

### Issues Identified
1. **Clunky file drop interface**: Simple blue box (200x200px) with hardcoded inline styles
2. **No schema visibility**: Users cannot see available tables and columns after loading a database
3. **Poor layout**: No organized structure - just vertical stacking of elements
4. **Unstyled components**: Basic HTML button with no styling
5. **No visual feedback**: Missing loading states, success/error messages
6. **Backend data unused**: `OpenDB` returns table names but frontend ignores them
7. **No column information**: No backend method to retrieve column details for tables

---

## Improvement Plan

### Phase 1: Integrate Bulma CSS Framework

#### 1.1 Setup Bulma
- [ ] Install Bulma via npm: `npm install bulma`
- [ ] Import Bulma CSS in `main.tsx` or `style.css`
- [ ] Remove conflicting custom styles from `App.css` and `style.css`
- [ ] Configure color scheme to work with existing dark theme preference

#### 1.2 Design System Decisions
- Use Bulma's dark theme or customize CSS variables for dark mode
- Define color palette:
  - Primary: Bulma's primary blue for actions
  - Success: Green for successful operations
  - Danger: Red for errors
  - Dark: Keep existing dark background (#1b2636)

---

### Phase 2: Redesign Database Loading Experience

#### 2.1 File Drop Zone Component
Replace the current blue box with a proper Bulma-styled drop zone:

**Features:**
- [ ] Full-width hero section when no DB is loaded
- [ ] Bulma `box` component with dashed border for drop target
- [ ] Icon (database icon) using Bulma icons or Font Awesome
- [ ] Clear instructions: "Drop SQLite database here or click to browse"
- [ ] Hover state with highlight effect
- [ ] Click-to-browse file picker as alternative to drag-drop
- [ ] Loading spinner during database opening

**Visual Hierarchy:**
```
┌─────────────────────────────────────┐
│                                     │
│          [Database Icon]            │
│                                     │
│   Drop your SQLite database here    │
│        or click to browse           │
│                                     │
│     Supported: .db, .sqlite, .db3   │
│                                     │
└─────────────────────────────────────┘
```

#### 2.2 Success Feedback
- [ ] Notification banner (Bulma notification) showing database name loaded
- [ ] Smooth transition from drop zone to main interface

---

### Phase 3: Database Schema Viewer (Sidebar)

#### 3.1 Backend Enhancements
Add new Go method to retrieve table schema information:

**New Method: `GetTableSchema(tableName string) ([]ColumnInfo, error)`**
```go
type ColumnInfo struct {
    Name         string `json:"name"`
    Type         string `json:"type"`
    NotNull      bool   `json:"notNull"`
    PrimaryKey   bool   `json:"primaryKey"`
}
```

**Implementation:**
- [ ] Query `PRAGMA table_info(tableName)` to get column details
- [ ] Map SQLite PRAGMA results to ColumnInfo struct
- [ ] Handle errors gracefully

#### 3.2 Frontend Schema Display
**Store tables data from OpenDB response:**
- [ ] Update `OpenDB` call to capture returned table list
- [ ] Store tables in React state: `useState<Table[]>([])`
- [ ] Fetch column info for each table (lazy load on expand or eager load on DB open)

**UI Structure:**
```
┌─────────────────┐
│ 📁 Tables       │
│                 │
│ ▼ users         │
│   - id (PK)     │
│   - name        │
│   - email       │
│                 │
│ ▶ orders        │
│                 │
│ ▶ products      │
│                 │
└─────────────────┘
```

**Components:**
- [ ] Bulma `menu` component for sidebar navigation
- [ ] Collapsible menu items (Bulma `menu-list`)
- [ ] Icons for tables and columns (FontAwesome or Bulma icons)
- [ ] Show column types and constraints (PK, NOT NULL) with badges
- [ ] Click on table name to insert `SELECT * FROM tableName` into editor
- [ ] Click on column to insert column name into editor at cursor

---

### Phase 4: Main Layout Restructure

#### 4.1 Two-Column Layout
Implement Bulma columns system:

```
┌──────────────────────────────────────────────┐
│            Header / Navbar                   │
├───────────┬──────────────────────────────────┤
│           │                                  │
│  Schema   │    SQL Editor                    │
│  Sidebar  │    [Query Button]                │
│           │                                  │
│ (Bulma    │                                  │
│  column   │    Results Grid                  │
│  is-3)    │                                  │
│           │                                  │
│           │    (Bulma column is-9)           │
│           │                                  │
└───────────┴──────────────────────────────────┘
```

**Implementation:**
- [ ] Bulma `navbar` component at top with app title "SQLite Query Graph"
- [ ] Bulma `columns` layout with sidebar and main content
- [ ] Sidebar: Fixed width column (is-3 or is-one-quarter)
- [ ] Main area: Flexible column (is-9 or is-three-quarters)
- [ ] Make sidebar collapsible on smaller screens

#### 4.2 Header/Navbar
- [ ] App logo/title on left
- [ ] Database file name display (when loaded)
- [ ] "Load New Database" button on right
- [ ] Bulma `navbar` component with dark theme

---

### Phase 5: Query Editor Section Improvements

#### 5.1 Editor Container
- [ ] Wrap Monaco Editor in Bulma `box` component
- [ ] Add section title "SQL Query Editor"
- [ ] Toolbar above editor with:
  - Run Query button (Bulma `button is-primary`)
  - Clear button
  - Format SQL button (optional - requires SQL formatter library)
  - Sample queries dropdown (Bulma `dropdown`)

#### 5.2 Query Controls
- [ ] Replace basic `<button>` with Bulma styled button
- [ ] Add keyboard shortcut hint (e.g., "Ctrl+Enter to run")
- [ ] Loading state on button while query executes
- [ ] Disable button when no query entered

**Button Design:**
```html
<button class="button is-primary is-medium">
  <span class="icon">
    <i class="fas fa-play"></i>
  </span>
  <span>Run Query</span>
</button>
```

---

### Phase 6: Results Display Enhancement

#### 6.1 Results Section Header
- [ ] Bulma section header "Query Results"
- [ ] Show row count: "Showing X rows"
- [ ] Export buttons (CSV, JSON) - future enhancement
- [ ] Execution time display

#### 6.2 Data Grid Styling
- [ ] Wrap DataSheetGrid in Bulma `box` component
- [ ] Custom CSS to match Bulma theme colors
- [ ] Alternate row colors for readability
- [ ] Sticky column headers when scrolling

#### 6.3 Empty States
- [ ] Show helpful message when no query executed yet:
  ```
  ┌─────────────────────────────────────┐
  │         [Icon]                      │
  │  Write a query and click Run        │
  │  to see results here                │
  └─────────────────────────────────────┘
  ```
- [ ] Show "No results" message when query returns 0 rows

---

### Phase 7: Error Handling & Feedback

#### 7.1 Error Messages
- [ ] Bulma `notification is-danger` for query errors
- [ ] Show SQL error details from backend
- [ ] Dismiss button on notifications
- [ ] Error position in query (if available from SQLite)

#### 7.2 Success Notifications
- [ ] Brief success message after query execution
- [ ] Auto-dismiss after 3-5 seconds
- [ ] Bulma `notification is-success`

#### 7.3 Loading States
- [ ] Loading spinner (Bulma `loader`) when:
  - Opening database
  - Executing query
  - Fetching table schema
- [ ] Disable UI during operations
- [ ] Progress indication for long operations

---

### Phase 8: Polish & Responsive Design

#### 8.1 Responsive Behavior
- [ ] Mobile layout: Stack sidebar above editor
- [ ] Tablet: Collapsible sidebar
- [ ] Desktop: Full two-column layout
- [ ] Use Bulma breakpoint modifiers (is-hidden-mobile, etc.)

#### 8.2 Visual Polish
- [ ] Smooth transitions (fade in/out, slide)
- [ ] Consistent spacing using Bulma spacing helpers
- [ ] Proper focus states for accessibility
- [ ] Consistent icon set throughout (FontAwesome recommended)
- [ ] Syntax highlighting in schema viewer for SQL keywords

#### 8.3 User Experience Enhancements
- [ ] Remember last opened database path (localStorage)
- [ ] Query history (localStorage) - dropdown to select previous queries
- [ ] Sample/template queries for quick start
- [ ] Copy cell/row/column from results grid
- [ ] Double-click table name to preview top 100 rows

---

## Implementation Priority

### Must Have (MVP)
1. Bulma CSS integration
2. Improved file drop zone
3. Database schema sidebar with tables
4. Backend `GetTableSchema` method
5. Two-column layout
6. Styled query button and editor container
7. Error notifications

### Should Have
1. Column information in schema viewer
2. Loading states
3. Empty states
4. Navbar with database name
5. Row count display
6. Responsive layout

### Nice to Have
1. Click table/column to insert into editor
2. Query history
3. Sample queries
4. Export results (CSV/JSON)
5. Format SQL button
6. Keyboard shortcuts
7. Dark/light theme toggle

---

## Technical Dependencies

### New NPM Packages
```json
{
  "bulma": "^1.0.2",
  "@fortawesome/fontawesome-free": "^6.5.1" // For icons
}
```

### Backend Changes
- New `GetTableSchema(tableName string)` method in `app.go`
- New `ColumnInfo` struct
- Update frontend bindings after Go changes

### File Structure Changes
```
frontend/src/
  components/
    SchemaViewer.tsx       # New: Sidebar component
    QueryEditor.tsx        # New: Editor section component
    ResultsTable.tsx       # New: Results display component
    FileDropZone.tsx       # New: Database loader component
    Navbar.tsx             # New: Top navigation
  styles/
    bulma-custom.scss      # Custom Bulma theme overrides
  App.tsx                  # Refactor: Orchestrate components
```

---

## Testing Checklist

- [ ] Drag-drop database file works
- [ ] Click-to-browse file picker works
- [ ] Tables list populates correctly
- [ ] Column information displays accurately
- [ ] Clicking table name inserts SELECT statement
- [ ] Query execution shows results
- [ ] Error messages display for invalid SQL
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Loading states appear during operations
- [ ] Keyboard shortcuts work
- [ ] Application works with various SQLite file sizes

---

## Success Metrics

### User Experience
- Users can identify available tables without writing queries
- Users can discover column names and types before querying
- Query writing is faster with schema visibility
- UI feels professional and polished

### Technical
- All Bulma components integrate seamlessly
- No CSS conflicts between Bulma and existing styles
- Performance remains smooth with large result sets
- Application maintains dark theme consistency

---

## Timeline Estimate

- **Phase 1-2**: 4-6 hours (Bulma setup + file drop redesign)
- **Phase 3**: 6-8 hours (Schema viewer backend + frontend)
- **Phase 4**: 3-4 hours (Layout restructure)
- **Phase 5**: 2-3 hours (Query editor improvements)
- **Phase 6**: 3-4 hours (Results display)
- **Phase 7**: 2-3 hours (Error handling)
- **Phase 8**: 4-5 hours (Polish + responsive)

**Total: 24-33 hours** for full implementation

---

## Next Steps

1. Review and approve this plan
2. Set up development environment with Bulma
3. Start with Phase 1 (Bulma integration)
4. Implement phases incrementally with testing between each
5. Gather user feedback after Phase 4 (core features)
6. Iterate based on feedback
