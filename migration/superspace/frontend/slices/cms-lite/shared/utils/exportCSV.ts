export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) {
    return;
  }

  const headers = columns
    ? columns.map((col) => col.label)
    : Object.keys(data[0]);

  const rows = data.map((row) =>
    columns
      ? columns.map((col) => {
          const value = row[col.key];
          return formatCSVValue(value);
        })
      : Object.values(row).map((value) => formatCSVValue(value))
  );

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatCSVValue(value: any): string {
  if (value == null) {
    return "";
  }

  if (Array.isArray(value)) {
    return `"${value.join("; ")}"`;
  }

  if (typeof value === "object") {
    return `"${JSON.stringify(value)}"`;
  }

  const stringValue = String(value);

  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}
