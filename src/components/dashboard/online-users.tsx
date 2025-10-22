import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";

const data = [
  { name: "Web", value: 20, color: "#FF8C42" },
  { name: "iOS", value: 45, color: "#5B8DEF" },
  { name: "Android", value: 35, color: "#34D399" },
];

export function OnlineUsers() {
  return (
    <div className="rounded-[16px] bg-card p-5 h-[380px]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Online Users</h3>
        <div className="h-2 w-2 rounded-full bg-amber-400" />
      </div>

      <div className="mt-4 flex gap-6 justify-between items-center">
        <div className="relative mx-auto h-48 w-48">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={58}
                outerRadius={78}
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
              <p className="text-2xl font-semibold">1,883</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.name} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-sm text-[#8A9099]">{d.name}</span>
              </div>
              <span className="text-sm font-medium">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Metric label="Web" value="350" />
        <Metric label="iOS" value="895" />
        <Metric label="Android" value="638" />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl flex flex-col-reverse border bg-muted/20 px-3 py-2">
      <p className="text-xs text-[#8A9099]">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
