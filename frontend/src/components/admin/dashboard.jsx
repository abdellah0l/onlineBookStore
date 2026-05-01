
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../ui/chart";
import { Spinner } from "../ui/spinner";
import { useAdminData } from "../../contexts/AdminDataContext";

const chartConfig = {
  count: {
    label: "Users",
    color: "var(--chart-1)",
  },
};

const statusStyles = {
  finished: "border-emerald-400/70 text-emerald-300",
  pending: "border-amber-400/70 text-amber-300",
  cancelled: "border-rose-400/70 text-rose-300",
};

export default function AdminDashboard() {
  const { getDashboard } = useAdminData();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getDashboard();
        if (isMounted) {
          setData(response?.data ?? null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Failed to load dashboard.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [getDashboard]);

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

  if (!data) {
    return null;
  }

  return (
    <div className="m-6 space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "total books", value: data.booksNum },
          { label: "total orders", value: data.latestOrders.length },
          { label: "revenue", value: `${data.totalMoneyAmount}DA` },
          { label: "customers", value: data.usersNum },
          { label: "reviews", value: data.recentReviews.length },
        ].map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl border border-white/30 bg-neutral-950 px-4 py-5 text-center text-sm text-white"
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0_2px,transparent_2px_8px)]" />
            <div className="relative">
              <p className="text-white/70">{stat.label}</p>
              <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-violet-400/50 bg-neutral-950 p-5">
          <h3 className="text-lg font-semibold text-white">Top Sellers</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {data.topSellingBooks.map((book, index) => (
              <li key={book.id} className="flex gap-2">
                <span className="text-white/50">{index + 1}-</span>
                <span className="font-medium text-white">{book.title}</span>
                <span className="text-white/50">- {book.author}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-violet-400/50 bg-neutral-950 p-5">
          <h3 className="text-lg font-semibold text-white">Latest Orders</h3>
          <div className="mt-4 space-y-2 text-sm text-white/80">
            {data.latestOrders.map((order) => {
              const status = order.status ?? "finished";
              const statusClass =
                statusStyles[status] ?? "border-white/30 text-white/60";

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.02] px-4 py-3"
                >
                  <div className="space-y-1">
                    <p className="text-white">
                      Order {order.id} - {new Date(order.purchased_at).toLocaleDateString()}
                    </p>
                    <p className="text-white/50">
                      {order.user.username} - {order.book.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs capitalize ${statusClass}`}
                    >
                      {status}
                    </span>
                    <span className="text-xs text-white/50">
                      {order.amount}DA
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-violet-400/50 bg-neutral-950 p-5">
          <h3 className="text-lg font-semibold text-white">Analytics</h3>
          <ChartContainer
            config={chartConfig}
            className="mt-4 min-h-[220px] w-full"
          >
            <BarChart
              data={data.numbersOfUsersPerMonth}
              margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-3xl border border-violet-400/50 bg-neutral-950 p-5">
          <h3 className="text-lg font-semibold text-white">Recent Reviews</h3>
          <ul className="mt-4 space-y-3">
            {data.recentReviews.map((review) => (
              <li
                key={review.id}
                className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.02] px-4 py-3 text-sm text-white/80"
              >
                <span className="text-white">{review.user.username}</span>
                <span className="text-white/60">{review.content}</span>
                <span className="text-amber-300">{review.rating}/5</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
