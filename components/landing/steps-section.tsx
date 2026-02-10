interface Step {
  number: string;
  title: string;
  description: string;
}

interface StepsSectionProps {
  title?: string;
  steps: Step[];
}

export function StepsSection({ title = "How It Works", steps }: StepsSectionProps) {
  return (
    <div style={{ marginBottom: 64 }}>
      <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 28, color: "#FAFAF9" }}>
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
        {steps.map((step) => (
          <div key={step.number} style={{ borderRadius: 16, padding: 20, textAlign: "center", backgroundColor: "#16161A" }}>
            <div
              className="flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                margin: "0 auto 12px auto",
                borderRadius: 9999,
                fontSize: 16,
                fontWeight: 700,
                backgroundColor: "rgba(232,168,56,0.12)",
                color: "#E8A838",
              }}
            >
              {step.number}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#FAFAF9" }}>{step.title}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#6B6B70" }}>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
