/**
 * Quotes a SQLite identifier (table or column name) to handle spaces,
 * special characters, and reserved keywords
 */
export function quoteIdentifier(identifier: string): string {
  // Escape any existing double quotes by doubling them
  const escaped = identifier.replace(/"/g, '""');
  // Wrap in double quotes
  return `"${escaped}"`;
}

/**
 * Generates a safe SELECT statement for a table
 */
export function generateSelectStatement(tableName: string, limit: number = 100): string {
  return `SELECT * FROM ${quoteIdentifier(tableName)} LIMIT ${limit};`;
}
