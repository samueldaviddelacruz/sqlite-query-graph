# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SQLite Query Graph is a desktop application built with Wails v2 that provides a graphical interface for querying SQLite databases. Users can drag-and-drop database files, browse table schemas, write SQL queries with Monaco editor, and view results in an interactive data grid.

## Architecture

### Tech Stack
- **Backend**: Go with Wails v2 framework
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: SQLite (using modernc.org/sqlite pure Go driver)
- **UI Components**: Bulma CSS, Monaco Editor, react-datasheet-grid

### Application Structure

**Go Backend (`app.go`)**:
- The `App` struct maintains application context and database connection
- Key methods bound to frontend:
  - `OpenDB(dbPath string)` - Opens SQLite database and returns table list
  - `GetTableSchema(tableName string)` - Returns column information for a table
  - `ExecuteQuery(queryString string)` - Executes SQL and returns structured results
- Uses `sqlx` for enhanced database operations
- Database connection (`*sqlx.DB`) is stored in App struct after opening

**React Frontend**:
- `App.tsx` - Main application component handling:
  - File drop for database loading
  - SQL editor (Monaco) integration
  - Query execution and result display
  - Navigation between initial state and query interface
- `SchemaViewer.tsx` - Sidebar component that:
  - Displays list of tables
  - Lazy-loads column schemas on table expansion
  - Allows clicking tables/columns to insert into editor

**Wails Integration**:
- Generated bindings in `frontend/wailsjs/` connect React to Go methods
- File drop events handled via `OnFileDrop` runtime function
- Main window configured in `main.go` with embedded frontend assets

## Development Commands

### Running the Application
```bash
wails dev        # Run in development mode with hot reload
```

Development mode runs:
- Go backend with live reload
- Vite dev server on auto-assigned port
- Opens app window with DevTools available

### Building
```bash
wails build      # Build production executable
```

Builds platform-specific executable in `build/bin/` directory.

### Frontend Development
```bash
cd frontend
npm install      # Install dependencies
npm run dev      # Run Vite dev server standalone
npm run build    # Build frontend for production
```

### Go Dependencies
```bash
go mod download  # Download Go dependencies
go mod tidy      # Clean up go.mod/go.sum
```

## Key Implementation Details

### Database Connection Lifecycle
- Database connection is opened when user drops a file
- Connection persists in `App.db` field for subsequent queries
- No explicit close mechanism (handled on app exit)

### Frontend-Backend Communication
- All Go methods on `App` struct are automatically bound to frontend
- Generated TypeScript bindings provide type-safe calls
- Return values are serialized to JSON automatically

### Query Result Structure
- `QueryResult` has `Columns` (column names) and `Data` (2D array of values)
- Frontend transforms this into objects for DataSheetGrid component
- Dynamic column types handled via `sqlx.SliceScan()`

### Monaco Editor Integration
- Editor reference stored in `editorRef` for programmatic access
- Table clicks append SELECT statements to editor
- Column clicks insert column name at cursor position

### SQLite Identifier Quoting
- Table and column names with spaces or special characters must be properly quoted
- Backend uses `quoteIdentifier()` helper (app.go:41) to wrap identifiers in double quotes
- Frontend uses `quoteIdentifier()` and `generateSelectStatement()` helpers (utils/sqlHelpers.ts)
- Double quotes within identifiers are escaped by doubling them (`"` becomes `""`)
