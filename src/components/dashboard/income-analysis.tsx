import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";

const barData = [
  { name: "Jan", amt: 6800 },
  { name: "Feb", amt: 9200 },
  { name: "Mar", amt: 7800 },
];

const lineData = [
  { name: "Mon", v: 1200 },
  { name: "Tue", v: 3100 },
  { name: "Wed", v: 1800 },
  { name: "Thu", v: 2400 },
  { name: "Fri", v: 2100 },
  { name: "Sat", v: 3900 },
  { name: "Sun", v: 2000 },
];

export function IncomeAnalysis() {
  return (
    <div className="space-y-4 bg-white rounded-[16px] p-5">
      <div className="">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Income Analysis</h3>
          <span className="text-xs text-muted-foreground">Monthly</span>
        </div>
        <div className="mt-3 items-center flex justify-between">
          <div className="space-y-3">
            <div className="flex gap-4 items-center">
              <p className="text-3xl font-bold">$8,527,224</p>
              <p className="mt-1 text-xs bg-emerald-200/30 px-2 py-1 rounded-sm text-emerald-600">
                +3.1%
              </p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Expense increased by $2,172 This Month
            </p>
          </div>
          <div className="h-32 w-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis hide />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Bar dataKey="amt" radius={[6, 6, 0, 0]} fill="#FF8C42" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="border-b border-[#DCE4E8] w-full" />
      <div className="">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Payout Analysis</h3>
          <span className="text-xs text-muted-foreground">Monthly</span>
        </div>
        <div className="mt-3 items-center flex justify-between">
          <div className="space-y-3">
            <div className="flex gap-4 items-center">
              <p className="text-3xl font-bold">$2,056,123</p>
              <p className="mt-1 text-xs bg-rose-200/30 px-2 py-1 rounded-sm text-rose-600">
                -2.1%
              </p>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Expense increased by $1,456 This Month
            </p>
          </div>
          <div className="h-28 w-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#5B8DEF"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
