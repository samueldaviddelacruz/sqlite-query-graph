import { useState, useEffect } from "react";
import { GetTableSchema } from "../../wailsjs/go/main/App";

interface Table {
  name: string;
}

interface ColumnInfo {
  name: string;
  type: string;
  notNull: boolean;
  primaryKey: boolean;
}

interface SchemaViewerProps {
  tables: Table[];
  onTableClick?: (tableName: string) => void;
  onColumnClick?: (columnName: string) => void;
}

export default function SchemaViewer({ tables, onTableClick, onColumnClick }: SchemaViewerProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [tableSchemas, setTableSchemas] = useState<Map<string, ColumnInfo[]>>(new Map());
  const [loadingSchemas, setLoadingSchemas] = useState<Set<string>>(new Set());

  const toggleTable = async (tableName: string) => {
    const newExpanded = new Set(expandedTables);

    if (newExpanded.has(tableName)) {
      // Collapse
      newExpanded.delete(tableName);
    } else {
      // Expand
      newExpanded.add(tableName);

      // Fetch schema if not already loaded
      if (!tableSchemas.has(tableName)) {
        setLoadingSchemas(new Set(loadingSchemas).add(tableName));
        try {
          const schema = await GetTableSchema(tableName);
          setTableSchemas(new Map(tableSchemas).set(tableName, schema || []));
        } catch (error) {
          console.error(`Error fetching schema for ${tableName}:`, error);
        } finally {
          const newLoading = new Set(loadingSchemas);
          newLoading.delete(tableName);
          setLoadingSchemas(newLoading);
        }
      }
    }

    setExpandedTables(newExpanded);
  };

  const handleTableClick = (tableName: string) => {
    if (onTableClick) {
      onTableClick(tableName);
    }
  };

  const handleColumnClick = (columnName: string) => {
    if (onColumnClick) {
      onColumnClick(columnName);
    }
  };

  return (
    <aside className="menu">
      <p className="menu-label">
        <i className="fas fa-table mr-2"></i>
        Tables ({tables.length})
      </p>
      <ul className="menu-list">
        {tables.map((table) => {
          const isExpanded = expandedTables.has(table.name);
          const schema = tableSchemas.get(table.name);
          const isLoading = loadingSchemas.has(table.name);

          return (
            <li key={table.name}>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  toggleTable(table.name);
                }}
                className={isExpanded ? "is-active" : ""}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span>
                  <i className={`fas fa-chevron-${isExpanded ? "down" : "right"} mr-2`} style={{ fontSize: "0.75rem" }}></i>
                  <i className="fas fa-table mr-2"></i>
                  {table.name}
                </span>
                <button
                  className="button is-small is-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTableClick(table.name);
                  }}
                  title="Insert SELECT statement"
                >
                  <i className="fas fa-plus" style={{ fontSize: "0.75rem" }}></i>
                </button>
              </a>
              {isExpanded && (
                <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
                  {isLoading ? (
                    <li>
                      <span className="has-text-grey-light">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Loading...
                      </span>
                    </li>
                  ) : (
                    schema?.map((column) => (
                      <li key={column.name} style={{ marginBottom: "0.25rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: "0.875rem",
                            padding: "0.25rem 0.5rem",
                            cursor: "pointer",
                            borderRadius: "4px",
                          }}
                          className="column-item"
                          onClick={() => handleColumnClick(column.name)}
                          title={`${column.name} (${column.type})`}
                        >
                          <i className="fas fa-columns mr-2" style={{ fontSize: "0.75rem", color: "#a0aec0" }}></i>
                          <span className="has-text-grey-light">{column.name}</span>
                          <span className="ml-2 has-text-grey" style={{ fontSize: "0.75rem" }}>
                            {column.type}
                          </span>
                          {column.primaryKey && (
                            <span className="tag is-small is-primary ml-2" style={{ fontSize: "0.65rem", padding: "0 0.4rem" }}>
                              PK
                            </span>
                          )}
                          {column.notNull && !column.primaryKey && (
                            <span className="tag is-small is-info ml-2" style={{ fontSize: "0.65rem", padding: "0 0.4rem" }}>
                              NN
                            </span>
                          )}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
