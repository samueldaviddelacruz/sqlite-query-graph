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
    return null;
  }

  return (
    <DataSheetGrid
      value={data}
      onChange={handleDataChange}
      columns={columnsData}
    />
  );
}
