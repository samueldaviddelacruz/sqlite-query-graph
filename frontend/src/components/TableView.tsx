import { DataSheetGrid, keyColumn, textColumn } from "react-datasheet-grid";

interface TableViewProps {
  data: any[];
  columns: string[];
  onDataChange?: (data: any[]) => void;
}

export default function TableView({ data, columns, onDataChange }: TableViewProps) {
  const columnsData = columns.map((c) => {
    return { ...keyColumn(c, textColumn), title: c };
  });

  const handleDataChange = (newData: any[]) => {
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  if (!data || data.length === 0 || !columns || columns.length === 0) {
    return (
      <div className="box mt-4 has-text-centered" style={{ padding: "3rem" }}>
        <div className="mb-4">
          <i className="fas fa-table fa-3x has-text-grey-light"></i>
        </div>
        <p className="title is-5 has-text-grey-light">No Results Yet</p>
        <p className="subtitle is-6 has-text-grey">
          Write a SQL query and click <strong>Run Query</strong> to see results
        </p>
      </div>
    );
  }

  return (
    <div className="box mt-4">
      <h3 className="title is-5 mb-3">
        Query Results ({data.length} rows)
      </h3>
      <div className="data-grid-container">
        <DataSheetGrid
          value={data}
          onChange={handleDataChange}
          columns={columnsData}
        />
      </div>
    </div>
  );
}
