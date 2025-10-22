import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";

const data = [
  { name: "$100 Pod", value: 401, color: "#FF8C42" },
  { name: "$200 Pod", value: 250, color: "#7C3AED" },
  { name: "$500 Pod", value: 61, color: "#5B8DEF" },
  { name: "$1000 Pod", value: 192, color: "#2DD4BF" },
];

export function PodContributions() {
  //   const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="rounded-[16px] bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Pod contributions</h3>
        <span className="text-xs text-muted-foreground">Monthly</span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="relative mx-auto h-56 w-56">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={60}
                outerRadius={85}
                strokeWidth={6}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-3xl font-semibold">100%</p>
              <p className="text-xs text-muted-foreground">Data Recorded</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 content-center">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-sm text-muted-foreground">{d.name}</span>
              </div>
              <span className="text-sm font-medium">
                ${Intl.NumberFormat().format(d.value * 1000)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
