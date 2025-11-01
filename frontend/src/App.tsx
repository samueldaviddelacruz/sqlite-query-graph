import { useEffect, useRef, useState } from "react";
import logo from "./assets/images/logo-universal.png";
import "./App.css";
import { OpenDB, ExecuteQuery } from "../wailsjs/go/main/App";
import { OnFileDrop, OnFileDropOff } from "../wailsjs/runtime";
import Editor, { Monaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import SchemaViewer from "./components/SchemaViewer";
import QueryResults from "./components/QueryResults";

interface Table {
  name: string;
}

function App() {
  const [resultText, setResultText] = useState("Please drag your DB here");
  const [data, setData] = useState<any[]>([] as any);
  const [columns, setColumns] = useState<string[]>([]);

  const [dbLoaded, setDbLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [dbPath, setDbPath] = useState<string>("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const updateResultText = (result: string) => setResultText(result);
  const editorRef: any = useRef();

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco,
  ) {
    editorRef.current = editor;
  }

  function showValue() {
    const value = editorRef.current.getValue() as string;

    if (!value.trim()) {
      setQueryError("Please enter a SQL query");
      return;
    }

    setQueryLoading(true);
    setQueryError(null);
    setColumns([]);
    setData([]);

    ExecuteQuery(value)
      .then((result) => {
        const receivedColumns = (result.columns as string[]) || [];
        const receivedData = (result.data as any[][]) || [];
        const mapped = receivedData.map((row) => {
          const obj: any = {};
          receivedColumns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
        setColumns(receivedColumns);
        setData(mapped);
        setQueryLoading(false);
      })
      .catch((error) => {
        setQueryError(error.toString());
        setQueryLoading(false);
      });
  }

  const handleTableClick = (tableName: string) => {
    // Insert SELECT statement into editor
    const selectStatement = `SELECT * FROM ${tableName} LIMIT 100;`;
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      const newValue = currentValue
        ? `${currentValue}\n${selectStatement}`
        : selectStatement;
      editorRef.current.setValue(newValue);
    }
  };

  const handleColumnClick = (columnName: string) => {
    // Insert column name at cursor position
    if (editorRef.current) {
      const position = editorRef.current.getPosition();
      editorRef.current.executeEdits("", [
        {
          range: {
            startLineNumber: position?.lineNumber || 1,
            startColumn: position?.column || 1,
            endLineNumber: position?.lineNumber || 1,
            endColumn: position?.column || 1,
          },
          text: columnName,
        },
      ]);
      editorRef.current.focus();
    }
  };

  useEffect(() => {
    OnFileDrop((x, y, paths) => {
      if (paths[0]) {
        setLoading(true);
        setError(null);
        setDbPath(paths[0]);
        OpenDB(paths[0])
          .then((tableList) => {
            setLoading(false);
            setTables(tableList || []);
            setDbLoaded(true);
          })
          .catch((error) => {
            setLoading(false);
            setError(error.toString());
            updateResultText(error);
          });
      }
    }, true);
    return () => OnFileDropOff();
  }, []);

  return !dbLoaded ? (
    <section className="hero is-fullheight">
      <div className="hero-body">
        <div className="container has-text-centered">
          <div
            className="file-drop-target box"
            style={
              {
                "--wails-drop-target": "drop",
                maxWidth: "600px",
                margin: "0 auto",
                padding: "3rem",
              } as React.CSSProperties
            }
          >
            {loading ? (
              <>
                <div className="mb-4">
                  <i
                    className="fas fa-spinner fa-spin fa-4x"
                    style={{ color: "#3273dc" }}
                  ></i>
                </div>
                <h1 className="title is-4">Opening Database...</h1>
                <p className="subtitle is-6">Please wait</p>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <i
                    className="fas fa-database fa-4x"
                    style={{ color: "#3273dc" }}
                  ></i>
                </div>
                <h1 className="title is-3">SQLite Query Graph</h1>
                <p className="subtitle is-5 mb-5">
                  Drop your SQLite database here
                </p>
                <p className="has-text-grey-light">
                  Supported formats: .db, .sqlite, .db3
                </p>
              </>
            )}
          </div>
          {error && (
            <div
              className="notification is-danger mt-4"
              style={{ maxWidth: "600px", margin: "1rem auto" }}
            >
              <button
                className="delete"
                onClick={() => setError(null)}
              ></button>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>
    </section>
  ) : (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <button
            className="button is-ghost"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            title="Toggle sidebar"
          >
            <span className="icon">
              <i className="fas fa-bars"></i>
            </span>
          </button>
          <div className="navbar-item">
            <span className="icon-text">
              <span className="icon has-text-primary">
                <i className="fas fa-database"></i>
              </span>
              <span className="title is-5 ml-2">SQLite Query Graph</span>
            </span>
          </div>
        </div>
        <div className="navbar-menu">
          <div className="navbar-end">
            <div className="navbar-item">
              <span className="icon-text has-text-grey-light">
                <span className="icon">
                  <i className="fas fa-file-database"></i>
                </span>
                <span style={{ fontSize: "0.875rem" }}>
                  {dbPath.split("/").pop() || "Database"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div
        className="columns is-gapless"
        style={{ flex: 1, margin: 0, overflow: "hidden" }}
      >
        {/* Sidebar */}
        {sidebarVisible && (
          <div className="column is-3 schema-sidebar">
            <SchemaViewer
              tables={tables}
              onTableClick={handleTableClick}
              onColumnClick={handleColumnClick}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="column" style={{ overflowY: "auto", padding: "1rem" }}>
          <div className="box">
            <div className="level mb-4">
              <div className="level-left">
                <div className="level-item">
                  <h2 className="title is-4">SQL Query Editor</h2>
                </div>
              </div>
              <div className="level-right">
                <div className="level-item">
                  <button
                    className={`button is-primary ${queryLoading ? "is-loading" : ""}`}
                    onClick={showValue}
                    disabled={queryLoading}
                  >
                    <span className="icon">
                      <i className="fas fa-play"></i>
                    </span>
                    <span>Run Query</span>
                  </button>
                </div>
              </div>
            </div>
            <Editor
              height="40vh"
              defaultLanguage="sql"
              defaultValue=""
              onMount={handleEditorDidMount}
            />
          </div>

          {/* Query Error Message */}
          {queryError && (
            <div className="notification is-danger mt-4">
              <button
                className="delete"
                onClick={() => setQueryError(null)}
              ></button>
              <strong>Query Error:</strong> {queryError}
            </div>
          )}

          {/* Results with Table/Chart Toggle */}
          {!queryLoading && !queryError && (
            <QueryResults
              data={data}
              columns={columns}
              onDataChange={setData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
