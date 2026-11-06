
export interface SqlSchemaColumn {
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
}

export interface SqlSchemaTable {
  name: string;
  columns: SqlSchemaColumn[];
  rows: Record<string, any>[];
}

// Split SQL without breaking commas or semicolons
// inside strings or parentheses.
function splitSql(
  value: string,
  delimiter: string
): string[] {
  const parts: string[] = [];
  let current = '';
  let quote = '';
  let depth = 0;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];

    if (quote) {
      current += char;

      if (char === quote) {
        if (value[i + 1] === quote) {
          current += value[++i];
        } else {
          quote = '';
        }
      } else if (char === '\\' && i + 1 < value.length) {
        current += value[++i];
      }

      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      current += char;
      continue;
    }

    if (char === '(') depth++;
    if (char === ')') depth--;

    if (char === delimiter && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

// Extract individual VALUES rows.
function extractRows(value: string): string[] {
  const rows: string[] = [];
  let depth = 0;
  let start = -1;
  let quote = '';

  for (let i = 0; i < value.length; i++) {
    const char = value[i];

    if (quote) {
      if (char === quote) {
        if (value[i + 1] === quote) {
          i++;
        } else {
          quote = '';
        }
      } else if (char === '\\') {
        i++;
      }
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }

    if (char === '(') {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (char === ')') {
      depth--;

      if (depth === 0 && start !== -1) {
        rows.push(value.substring(start, i));
        start = -1;
      }
    }
  }

  return rows;
}

// Convert SQL values into JavaScript values.
function parseSqlValue(value: string): any {
  const trimmed = value.trim();

  if (/^NULL$/i.test(trimmed)) return null;
  if (/^TRUE$/i.test(trimmed)) return true;
  if (/^FALSE$/i.test(trimmed)) return false;

  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    const quote = trimmed[0];

    return trimmed
      .slice(1, -1)
      .replace(new RegExp(quote + quote, 'g'), quote)
      .replace(/\\'/g, "'");
  }

  if (trimmed !== '' && !isNaN(Number(trimmed))) {
    return Number(trimmed);
  }

  return trimmed;
}

// Main parser
export function parseSqlSchema(
  schema: string
): SqlSchemaTable[] {
  const tables: SqlSchemaTable[] = [];

  if (!schema?.trim()) return tables;

  const statements = splitSql(schema, ';');

  // STEP 1: Read CREATE TABLE statements.
  for (const statement of statements) {
    const match = statement.match(
      /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`([^`]+)`|(\w+))\s*\(([\s\S]*)\)\s*$/i
    );

    if (!match) continue;

    const tableName = match[1] || match[2];
    const definitions = splitSql(match[3], ',');

    const columns: SqlSchemaColumn[] = [];
    const primaryKeys: string[] = [];

    for (const definition of definitions) {
      const trimmed = definition.trim();

      const primaryMatch = trimmed.match(
        /^PRIMARY\s+KEY\s*\(([^)]+)\)/i
      );

      if (primaryMatch) {
        primaryKeys.push(
          ...primaryMatch[1].split(',').map(key =>
            key.trim().replace(/[`"]/g, '')
          )
        );
        continue;
      }

      if (/^(CONSTRAINT|UNIQUE|KEY|INDEX|FOREIGN|CHECK)\b/i.test(trimmed)) {
        continue;
      }

      const columnMatch = trimmed.match(
        /^(?:`([^`]+)`|"([^"]+)"|(\w+))\s+(.+)$/i
      );

      if (!columnMatch) continue;

      const name = columnMatch[1] || columnMatch[2] || columnMatch[3];
      const remaining = columnMatch[4];

      const typeMatch = remaining.match(
        /^[A-Z]+(?:\s*\([^)]*\))?(?:\s+UNSIGNED)?/i
      );

      columns.push({
        name,
        dataType: typeMatch ? typeMatch[0].trim() : remaining,
        isPrimaryKey: /\bPRIMARY\s+KEY\b/i.test(remaining)
      });
    }

    for (const column of columns) {
      if (primaryKeys.includes(column.name)) {
        column.isPrimaryKey = true;
      }
    }

    tables.push({
      name: tableName,
      columns,
      rows: []
    });
  }

  // STEP 2: Read INSERT INTO statements.
  for (const statement of statements) {
    const match = statement.match(
      /INSERT\s+INTO\s+(?:`([^`]+)`|(\w+))\s*(?:\(([^)]*)\))?\s*VALUES\s*([\s\S]+)$/i
    );

    if (!match) continue;

    const tableName = match[1] || match[2];

    const table = tables.find(
      item => item.name.toLowerCase() === tableName.toLowerCase()
    );

    if (!table) continue;

    const insertColumns = match[3]
      ? splitSql(match[3], ',').map(column =>
          column.trim().replace(/[`"]/g, '')
        )
      : table.columns.map(column => column.name);

    const rowGroups = extractRows(match[4]);

    for (const rowGroup of rowGroups) {
      const values = splitSql(rowGroup, ',').map(parseSqlValue);

      const row: Record<string, any> = {};

      insertColumns.forEach((column, index) => {
        row[column] = values[index] ?? null;
      });

      table.rows.push(row);
    }
  }

  return tables;
}
