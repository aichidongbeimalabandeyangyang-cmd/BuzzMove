interface ComparisonRow {
  feature: string;
  buzzmove: string;
  competitor: string;
}

interface ComparisonTableProps {
  competitorName: string;
  rows: ComparisonRow[];
}

export function ComparisonTable({ competitorName, rows }: ComparisonTableProps) {
  return (
    <div style={{ marginBottom: 64 }}>
      <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 28, color: "#FAFAF9" }}>
        BuzzMove vs {competitorName}
      </h2>
      <div style={{ overflowX: "auto", borderRadius: 16, backgroundColor: "#16161A" }}>
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #252530" }}>
              <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 500, color: "#6B6B70" }}>Feature</th>
              <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#E8A838" }}>BuzzMove</th>
              <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 500, color: "#6B6B70" }}>{competitorName}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.feature} style={{ borderBottom: i < rows.length - 1 ? "1px solid #252530" : undefined }}>
                <td style={{ padding: "10px 12px", fontWeight: 500, color: "#FAFAF9" }}>{row.feature}</td>
                <td style={{ padding: "10px 12px", textAlign: "center", color: "#22C55E" }}>{row.buzzmove}</td>
                <td style={{ padding: "10px 12px", textAlign: "center", color: "#6B6B70" }}>{row.competitor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
