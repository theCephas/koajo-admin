import * as React from "react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Download, ChevronDown, MoreVertical } from "lucide-react";

export type TabKey = "Transaction Details" | "History" | "Invoice";

const historyRows = [
  {
    name: "Regina Cooper",
    order: "#790841",
    amount: "$2,500",
    type: "Credit Card",
    date: "12.09.2019",
  },
  {
    name: "Robert Edwards",
    order: "#799894",
    amount: "$1,500",
    type: "PayPal",
    date: "12.09.2019",
  },
  {
    name: "Gloria Mckinney",
    order: "#790857",
    amount: "$5,600",
    type: "Credit Card",
    date: "12.09.2019",
  },
  {
    name: "Randall Fisher",
    order: "#790687",
    amount: "$2,850",
    type: "PayPal",
    date: "12.09.2019",
  },
];

export default function CADetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [tab, setTab] = useState<TabKey>("Transaction Details");

  // transaction state (interactive)
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [fulfillment, setFulfillment] = useState("Suspicious");
  const [paymentStatus, setPaymentStatus] = useState("Failed");

  const orderNo = useMemo(() => `#${790000 + Number(id ?? 1)}`, [id]);

  return (
    <section className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-[#6B7280]">
        <Link
          to="/contributions-and-allocations"
          className="hover:underline text-[#374151]"
        >
          Contributions & Allocations Management
        </Link>
        <span className="mx-2 text-[#9CA3AF]">/</span>
        <span className="text-[#9CA3AF]">Transaction {orderNo}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] md:text-[24px] font-semibold text-[#111827]">
          Transaction {orderNo}
        </h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Print
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Excel
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b px-2">
        {(["Transaction Details", "History", "Invoice"] as TabKey[]).map(
          (t) => {
            const isActive = t === tab;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative pb-3 text-sm ${isActive ? "text-[#1F2937]" : "text-[#8A9099] hover:text-[#1F2937]"}`}
              >
                {t}
                {isActive && (
                  <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] rounded-full bg-[#FF8C42]" />
                )}
              </button>
            );
          },
        )}
      </div>

      {/* Content */}
      <div className="rounded-2xl border bg-white shadow-sm p-6">
        {tab === "Transaction Details" && (
          <div className="space-y-8">
            {/* Customer */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Customer</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#9CA3AF]">
                      <th className="py-3">Name</th>
                      <th>User ID</th>
                      <th>Pod</th>
                      <th>Group ID</th>
                    </tr>
                  </thead>
                  <tbody className="border-t">
                    <tr>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                            R
                          </span>
                          <span className="text-[#111827]">Regina Cooper</span>
                        </div>
                      </td>
                      <td>28292829282922</td>
                      <td>100 USD</td>
                      <td>#48904</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Payment + statuses */}
            <section className="grid gap-6 md:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <div className="text-sm font-medium">Payment method</div>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-[200px] rounded-xl">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Payoneer">Payoneer</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-[#6B7280]">
                  Transaction ID: 000001-TXHQ
                </div>
                <div className="text-sm text-[#6B7280]">Amount: $500</div>
              </div>

              <div className="grid gap-4 md:w-[360px]">
                <div className="rounded-xl bg-gray-50 p-4 grid gap-4">
                  <div className="grid gap-2">
                    <div className="text-sm text-[#6B7280]">
                      Fulfilment status
                    </div>
                    <Select value={fulfillment} onValueChange={setFulfillment}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Successful">Successful</SelectItem>
                        <SelectItem value="Suspicious">Suspicious</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <div className="text-sm text-[#6B7280]">Payment status</div>
                    <Select
                      value={paymentStatus}
                      onValueChange={setPaymentStatus}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </section>

            {/* User details */}
            <section className="rounded-xl border p-4">
              <div className="text-sm font-medium mb-4">User Details</div>
              <div className="grid gap-4 md:grid-cols-3">
                <KV label="First name" value="Regina" />
                <KV label="Last name" value="Cooper" />
                <KV label="Phone" value="+1(070) 4567-8800" />
                <KV label="Address" value="993 E. Brewer St. Holtsville" />
                <KV label="State/Region" value="New York" />
                <KV label="Email" value="example@mail.com" />
                <KV label="City" value="New York" />
                <KV label="Country" value="United States" />
                <KV label="Postcode" value="11742" />
              </div>
            </section>
          </div>
        )}

        {tab === "History" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Products</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-xl h-9 px-3 inline-flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="rounded-2xl border divide-y">
              {historyRows.map((r) => (
                <div
                  key={r.order}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="grid grid-cols-5 gap-4 w-full items-center">
                    <div className="col-span-2 flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                        {r.name.slice(0, 1)}
                      </span>
                      <div className="leading-tight">
                        <div className="text-sm text-[#111827]">{r.name}</div>
                      </div>
                    </div>
                    <div className="text-sm">{r.order}</div>
                    <div className="text-sm">{r.amount}</div>
                    <div className="text-sm text-[#6B7280]">{r.type}</div>
                  </div>
                  <button className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Invoice" && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Invoice</h3>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-[8px] bg-[#FF8C85] text-white grid place-items-center">
                  <div className="text-center leading-tight">
                    <div className="text-xs">INVOICE</div>
                    <div className="text-sm font-semibold">{orderNo}</div>
                  </div>
                </div>
                <div className="text-sm text-[#6B7280] leading-5">
                  <div className="text-[#111827] font-medium">ROCKET INC.</div>
                  Russell st. 50, Boston, MA, USA, 02199
                  <br />
                  +1 (070) 123–4567
                  <br />
                  info@rocket.com
                  <br />
                  www.rocketboard.com
                </div>
              </div>

              <div className="text-right text-sm text-[#6B7280]">
                September 12, 2019
                <div className="mt-2 inline-flex items-center gap-2">
                  <img
                    alt="Rocket"
                    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='8' fill='%23FF8C42'/></svg>"
                  />
                  <span className="text-[#111827]">Rocket</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#9CA3AF]">
                    <th className="py-3 px-4">Product</th>
                    <th className="px-4">Price</th>
                    <th className="px-4">Quantity</th>
                    <th className="px-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    {
                      p: "MacBook Pro 15 Retina Touch Bar MV902",
                      price: 2500,
                      qty: 1,
                    },
                    {
                      p: "Apple Watch Series 5 Edition GPS + Cellular",
                      price: 1500,
                      qty: 2,
                    },
                    {
                      p: "Apple iPhone 11 Pro Max 256GB Space Gray",
                      price: 1100,
                      qty: 1,
                    },
                  ].map((it) => (
                    <tr key={it.p}>
                      <td className="py-3 px-4">{it.p}</td>
                      <td className="px-4">${it.price.toLocaleString()}</td>
                      <td className="px-4">{it.qty}</td>
                      <td className="px-4">
                        ${((it.price || 0) * (it.qty || 0)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-start justify-end">
              <div className="w-full max-w-xs text-sm">
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#6B7280]">Subtotal</span>
                  <span className="text-[#111827]">$6,600</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#6B7280]">TAX(20%)</span>
                  <span className="text-[#111827]">$7,920</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#6B7280]">Discount</span>
                  <span className="text-[#111827]">-$792</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t mt-2 font-semibold">
                  <span className="text-[#111827]">Total</span>
                  <span className="text-[#111827]">$7,128</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <div className="text-xs text-[#9CA3AF]">{label}</div>
      <div className="text-sm text-[#111827]">{value}</div>
    </div>
  );
}
