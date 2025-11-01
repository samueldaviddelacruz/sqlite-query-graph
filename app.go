package main

import (
	"context"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
)

// App struct
type App struct {
	ctx context.Context
	db  *sqlx.DB
}
type Table struct {
	Name string `json:"name"`
}

type ColumnInfo struct {
	Name       string `json:"name"`
	Type       string `json:"type"`
	NotNull    bool   `json:"notNull"`
	PrimaryKey bool   `json:"primaryKey"`
}

type QueryResult struct {
	Columns []string `json:"columns"` // Names of the columns
	Data    [][]any  `json:"data"`    // An array of rows, where each row is an array of values
}

// NewApp creates a new App application struct
func NewApp() *App {

	return &App{}
}

// quoteIdentifier quotes a SQLite identifier (table/column name) properly
// to handle names with spaces, special characters, or reserved keywords
func quoteIdentifier(name string) string {
	// Escape any existing double quotes by doubling them
	escaped := strings.ReplaceAll(name, `"`, `""`)
	// Wrap in double quotes
	return fmt.Sprintf(`"%s"`, escaped)
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}
func (a *App) OpenDB(dbPath string) ([]Table, error) {
	db, err := sqlx.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}
	a.db = db
	tables := []Table{}
	err = a.db.Select(&tables, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
	if err != nil {
		return nil, err
	}
	return tables, nil
}

// GetTableSchema returns column information for a specific table
func (a *App) GetTableSchema(tableName string) ([]ColumnInfo, error) {
	if a.db == nil {
		return nil, fmt.Errorf("database not opened")
	}

	// SQLite PRAGMA table_info returns: cid, name, type, notnull, dflt_value, pk
	type pragmaRow struct {
		Cid        int    `db:"cid"`
		Name       string `db:"name"`
		Type       string `db:"type"`
		NotNull    int    `db:"notnull"`
		DfltValue  any    `db:"dflt_value"`
		PrimaryKey int    `db:"pk"`
	}

	var rows []pragmaRow
	// Quote the table name to handle spaces and special characters
	query := fmt.Sprintf("PRAGMA table_info(%s)", quoteIdentifier(tableName))
	err := a.db.Select(&rows, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get table schema: %w", err)
	}

	columns := make([]ColumnInfo, len(rows))
	for i, row := range rows {
		columns[i] = ColumnInfo{
			Name:       row.Name,
			Type:       row.Type,
			NotNull:    row.NotNull == 1,
			PrimaryKey: row.PrimaryKey > 0,
		}
	}

	return columns, nil
}

func (a *App) ExecuteQuery(queryString string) (QueryResult, error) {
	// 1. Execute the query
	rows, err := a.db.Queryx(queryString)
	if err != nil {
		// Return an empty result struct along with the error
		return QueryResult{}, fmt.Errorf("query execution error: %w", err)
	}
	defer rows.Close()

	// 2. Get column names
	columns, err := rows.Columns()
	if err != nil {
		return QueryResult{}, fmt.Errorf("failed to retrieve column names: %w", err)
	}

	// 3. Initialize the result structure
	result := QueryResult{
		Columns: columns,
		Data:    make([][]any, 0),
	}

	// 4. Iterate over the rows and dynamically scan data
	for rows.Next() {
		// Use sqlx.SliceScan to dynamically populate the values slice
		// It handles converting the raw database types to appropriate Go types (like int64, float64, string, or nil).
		row, err := rows.SliceScan()
		if err != nil {
			return QueryResult{}, fmt.Errorf("error scanning row data: %w", err)
		}
		// Append the successfully scanned row to the result data
		result.Data = append(result.Data, row)
	}

	// 5. Check for any errors that occurred during row iteration
	if err := rows.Err(); err != nil {
		return QueryResult{}, fmt.Errorf("error during row iteration: %w", err)
	}

	// 6. Return the fully populated result
	return result, nil
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
