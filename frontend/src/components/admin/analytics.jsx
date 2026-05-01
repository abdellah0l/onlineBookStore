import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Spinner } from "../ui/spinner";
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
import { useAdminData } from "../../contexts/AdminDataContext";

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
  const { getAnalytics } = useAdminData();
  const [activeType, setActiveType] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAnalytics(activeType);
        if (isMounted) {
          setData(response?.data ?? null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Failed to load analytics.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [activeType, getAnalytics]);

  const sales = data?.sales ?? [];
  const topSellingGenres = data?.topSellingGenres ?? [];
  const topSellingBooks = data?.topSellingBooks ?? [];
  const ordersCount = data?.ordersCount ?? 0;

  const ordersSeries = useMemo(() => {
    return sales.map((item) => ({
      date: item.date,
      orders: Math.max(1, Math.round(item.totalAmount / 400)),
    }));
  }, [sales]);

  if (loading) {
    return (
      <div className="m-6 flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-6 rounded-3xl border border-white/20 bg-neutral-950 p-6 text-white">
        <p className="text-white/70">{error}</p>
      </div>
    );
  }

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