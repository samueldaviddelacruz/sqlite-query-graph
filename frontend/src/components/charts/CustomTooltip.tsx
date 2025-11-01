interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

/**
 * Custom tooltip component for Recharts with polished formatting
 */
export default function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    if (typeof value === 'number') {
      // Format numbers with proper separators and decimals
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      }
      // Show up to 2 decimal places for floats
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }

    return String(value);
  };

  return (
    <div
      className="box"
      style={{
        backgroundColor: '#fff',
        border: '1px solid #dbdbdb',
        borderRadius: '4px',
        padding: '0.75rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        minWidth: '150px',
      }}
    >
      {label && (
        <p
          className="has-text-weight-semibold mb-2"
          style={{ borderBottom: '1px solid #f5f5f5', paddingBottom: '0.5rem' }}
        >
          {label}
        </p>
      )}
      {payload.map((entry, index) => (
        <div key={index} style={{ marginBottom: index < payload.length - 1 ? '0.25rem' : 0 }}>
          <span style={{ color: entry.color || '#4a5568', marginRight: '0.5rem' }}>●</span>
          <span className="has-text-grey-dark" style={{ fontSize: '0.875rem' }}>
            {entry.name}:
          </span>
          <span
            className="has-text-weight-semibold ml-2"
            style={{ fontSize: '0.875rem', color: '#363636' }}
          >
            {formatValue(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
