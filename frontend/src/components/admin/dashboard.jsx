
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

const mockDashboardResponse = {
  success: true,
  data: {
    booksNum: 150,
    usersNum: 48,
    totalMoneyAmount: 7850,
    topSellingBooks: [
      { id: "b1", title: "Atomic Habits", author: "James Clear" },
      { id: "b2", title: "Clean Code", author: "Robert C. Martin" },
      { id: "b3", title: "The Pragmatic Programmer", author: "Andrew Hunt" },
      { id: "b4", title: "Deep Work", author: "Cal Newport" },
    ],
    latestOrders: [
      {
        id: "ord-1039",
        book: { id: "b1", title: "Atomic Habits" },
        user: { id: "u1", username: "amine" },
        purchased_at: "2026-04-26T10:14:00.000Z",
        amount: 2200,
      },
      {
        id: "ord-1038",
        book: { id: "b2", title: "Clean Code" },
        user: { id: "u2", username: "lina" },
        purchased_at: "2026-04-26T09:42:00.000Z",
        amount: 2800,
      },
      {
        id: "ord-1037",
        book: { id: "b4", title: "Deep Work" },
        user: { id: "u3", username: "sara" },
        purchased_at: "2026-04-25T18:20:00.000Z",
        amount: 1900,
      },
      {
        id: "ord-1036",
        book: { id: "b5", title: "Refactoring" },
        user: { id: "u4", username: "nadir" },
        purchased_at: "2026-04-25T17:03:00.000Z",
        amount: 3100,
      },
    ],
    recentReviews: [
      {
        id: "r1",
        user: { id: "u2", username: "lina" },
        rating: 5,
        content: "Very useful and practical.",
      },
      {
        id: "r2",
        user: { id: "u1", username: "amine" },
        rating: 4,
        content: "Great content, smooth reading.",
      },
      {
        id: "r3",
        user: { id: "u3", username: "sara" },
        rating: 5,
        content: "Loved it, would recommend.",
      },
      {
        id: "r4",
        user: { id: "u4", username: "nadir" },
        rating: 3,
        content: "Good but expected more examples.",
      },
    ],
    numbersOfUsersPerMonth: [
      { month: "Jan", count: 8 },
      { month: "Feb", count: 12 },
      { month: "Mar", count: 18 },
    ],
  },
};

const chartConfig = {
  count: {
    label: "Users",
    color: "var(--chart-1)",
  },
};

export default function AdminDashboard() {
  const { data } = mockDashboardResponse;

  return (
    <div className="m-6 space-y-8">
      {/* statistics cards section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5 h-40">
        <div className="flex justify-center items-center text-center rounded-lg border bg-card p-6">
          <p>total books: {data.booksNum}</p>
        </div>
        <div className="flex justify-center items-center text-center rounded-lg border bg-card p-6">
          <p>total orders: {data.latestOrders.length}</p>
        </div>
        <div className="flex justify-center items-center text-center rounded-lg border bg-card p-6">
          <p>revenue: {data.totalMoneyAmount}</p>
        </div>
        <div className="flex justify-center items-center text-center rounded-lg border bg-card p-6">
          <p>customers: {data.usersNum}</p>
        </div>
        <div className="flex justify-center items-center text-center rounded-lg border bg-card p-6">
          <p>reviews: {data.recentReviews.length}</p>
        </div>
      </div>

      {/* statistics analytics section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-lg font-semibold">Top Sellers</h3>
          <ul className="mt-4 space-y-3">
            {data.topSellingBooks.map((book) => (
              <li
                key={book.id}
                className="flex items-center rounded-md border px-3 py-2"
              >
                <span className="text-sm font-medium">{book.title}-</span>
                <span className="text-sm text-muted-foreground">{book.author}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-lg font-semibold">Latest Orders</h3>
          <ul className="mt-4 space-y-3">
            {data.latestOrders.map((order) => (
              <li key={order.id} className="rounded-md border px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{order.id}</span>
                  <span className="text-sm text-muted-foreground">{order.amount} DZD</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {order.user.username} bought {order.book.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.purchased_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-lg font-semibold">Users Per Month</h3>
          <ChartContainer config={chartConfig} className="mt-4 min-h-[260px] w-full">
            <BarChart data={data.numbersOfUsersPerMonth} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-lg font-semibold">Recent Reviews</h3>
          <ul className="mt-4 space-y-3">
            {data.recentReviews.map((review) => (
              <li key={review.id} className="rounded-md border px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{review.user.username}</span>
                  <span className="text-sm text-muted-foreground">{review.rating}/5</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{review.content}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
