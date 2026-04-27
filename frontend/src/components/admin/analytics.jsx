import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

const mockAnalyticsByType = {
  daily: {
    success: true,
    data: {
      sales: [
        { date: "Mon", totalAmount: 1200 },
        { date: "Tue", totalAmount: 2600 },
        { date: "Wed", totalAmount: 2100 },
        { date: "Thu", totalAmount: 3300 },
        { date: "Fri", totalAmount: 2800 },
      ],
      topSellingGenres: [
        { genre: { id: "g1", name: "Stories" }, sales: 5400 },
        { genre: { id: "g2", name: "Culture" }, sales: 4200 },
        { genre: { id: "g3", name: "Systems" }, sales: 3100 },
        { genre: { id: "g4", name: "Academy" }, sales: 2800 },
        { genre: { id: "g5", name: "Wellness" }, sales: 1900 },
      ],
      topSellingBooks: [
        { book: { id: "b1", title: "Atomic Habits" }, sales: 4200 },
        { book: { id: "b2", title: "Clean Code" }, sales: 3500 },
        { book: { id: "b3", title: "Deep Work" }, sales: 2800 },
      ],
      ordersCount: 32,
    },
  },
  weekly: {
    success: true,
    data: {
      sales: [
        { date: "W1", totalAmount: 14200 },
        { date: "W2", totalAmount: 16500 },
        { date: "W3", totalAmount: 12800 },
        { date: "W4", totalAmount: 19000 },
      ],
      topSellingGenres: [
        { genre: { id: "g1", name: "Stories" }, sales: 15400 },
        { genre: { id: "g4", name: "Academy" }, sales: 13200 },
        { genre: { id: "g2", name: "Culture" }, sales: 11800 },
        { genre: { id: "g5", name: "Wellness" }, sales: 8800 },
      ],
      topSellingBooks: [
        { book: { id: "b4", title: "The Pragmatic Programmer" }, sales: 8200 },
        { book: { id: "b5", title: "The Alchemist" }, sales: 7600 },
      ],
      ordersCount: 128,
    },
  },
  monthly: {
    success: true,
    data: {
      sales: [
        { date: "Jan", totalAmount: 52000 },
        { date: "Feb", totalAmount: 61000 },
        { date: "Mar", totalAmount: 48000 },
        { date: "Apr", totalAmount: 69000 },
      ],
      topSellingGenres: [
        { genre: { id: "g3", name: "Systems" }, sales: 32400 },
        { genre: { id: "g1", name: "Stories" }, sales: 29800 },
        { genre: { id: "g2", name: "Culture" }, sales: 25500 },
        { genre: { id: "g5", name: "Wellness" }, sales: 21400 },
      ],
      topSellingBooks: [
        { book: { id: "b2", title: "Clean Code" }, sales: 14200 },
        { book: { id: "b6", title: "Rich Dad Poor Dad" }, sales: 11800 },
        { book: { id: "b3", title: "Deep Work" }, sales: 9700 },
      ],
      ordersCount: 512,
    },
  },
};

const genreColors = ["#60a5fa", "#f59e0b", "#34d399", "#a78bfa", "#f472b6"];

const salesConfig = {
  totalAmount: {
    label: "Sales",
    color: "#60a5fa",
  },
};

const ordersConfig = {
  orders: {
    label: "Orders",
    color: "#93c5fd",
  },
};

export default function AdminAnalytics() {
  const [activeType, setActiveType] = useState("daily");

  const analytics = mockAnalyticsByType[activeType];
  const { sales, topSellingGenres, topSellingBooks, ordersCount } =
    analytics.data;

  const ordersSeries = useMemo(() => {
    return sales.map((item) => ({
      date: item.date,
      orders: Math.max(1, Math.round(item.totalAmount / 400)),
    }));
  }, [sales]);

  return (
    <div className="m-6 space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <h2 className="text-3xl font-semibold">Analytics</h2>
        <div className="flex flex-wrap gap-2">
          {["daily", "weekly", "monthly"].map((type) => (
            <Button
              key={type}
              type="button"
              size="sm"
              variant={activeType === type ? "default" : "outline"}
              onClick={() => setActiveType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-violet-400/50 bg-neutral-950 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Top Selling Genres</h3>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
            <ChartContainer
              config={salesConfig}
              className="h-52 w-full aspect-auto"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={topSellingGenres}
                  dataKey="sales"
                  nameKey="genre.name"
                  innerRadius={50}
                  outerRadius={80}
                  stroke="none"
                >
                  {topSellingGenres.map((_, index) => (
                    <Cell
                      key={`genre-${index}`}
                      fill={genreColors[index % genreColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="space-y-2">
              {topSellingGenres.map((genre, index) => (
                <div
                  key={genre.genre.id}
                  className="flex items-center gap-3 text-sm text-white/80"
                >
                  <span
                    className="inline-flex h-4 w-4 items-center justify-center rounded-sm border border-white/40"
                    style={{ color: genreColors[index % genreColors.length] }}
                  >
                    ✓
                  </span>
                  <span className="flex-1">{genre.genre.name}</span>
                  <span className="text-white/60">{genre.sales}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-violet-400/50 bg-neutral-950 p-5">
          <h3 className="text-lg font-semibold text-white">Sales Revenue</h3>
          <ChartContainer
            config={salesConfig}
            className="mt-4 h-52 w-full aspect-auto"
          >
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                type="monotone"
                dataKey="totalAmount"
                stroke="var(--color-totalAmount)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>

        <div className="rounded-3xl border border-violet-400/50 bg-neutral-950 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Order Count</h3>
            <span className="text-sm text-white/60">{ordersCount} total</span>
          </div>
          <ChartContainer
            config={ordersConfig}
            className="mt-4 h-52 w-full aspect-auto"
          >
            <BarChart data={ordersSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="orders"
                fill="var(--color-orders)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-3xl border border-violet-400/50 bg-neutral-950 p-5">
          <h3 className="text-lg font-semibold text-white">Top Selling Books</h3>
          <div className="mt-5 space-y-3">
            {topSellingBooks.map((book, index) => (
              <div
                key={book.book.id}
                className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {index + 1}. {book.book.title}
                  </p>
                  <p className="text-xs text-white/60">
                    {book.sales} total sales
                  </p>
                </div>
                <span className="text-sm text-white/50">#{book.book.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}