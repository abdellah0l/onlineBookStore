import { useMemo, useState } from "react";
import SearchBar from "../search-bar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

const mockAdminOrdersResponse = {
  success: true,
  orders: [
    {
      id: "2741",
      user: { id: "u1", username: "Anis" },
      book: { id: "b1", title: "Atomic Habits" },
      amount: 1200,
      status: "finished",
    },
    {
      id: "9857",
      user: { id: "u2", username: "Abdelouahed" },
      book: { id: "b2", title: "The Metamorphosis" },
      amount: 4500,
      status: "cancelled",
    },
    {
      id: "3874",
      user: { id: "u3", username: "Abdellah" },
      book: { id: "b3", title: "Deep Work" },
      amount: 2200,
      status: "finished",
    },
    {
      id: "6426",
      user: { id: "u4", username: "Mohammed" },
      book: { id: "b4", title: "Clean Code" },
      amount: 500,
      status: "finished",
    },
    {
      id: "8375",
      user: { id: "u5", username: "Amine" },
      book: { id: "b5", title: "Rich Dad Poor Dad" },
      amount: 900,
      status: "finished",
    },
  ],
  pagination: {
    page: 1,
    limit: 8,
    total: 5,
    totalPages: 1,
  },
};

const formatAmount = (amount) => `${amount}DA`;

const statusStyles = {
  finished: "border-emerald-400/70 text-emerald-300",
  cancelled: "border-rose-400/70 text-rose-300",
};

export default function AdminOrders() {
  const [orders] = useState(mockAdminOrdersResponse.orders);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(
    mockAdminOrdersResponse.pagination.page,
  );

  const pageSize = mockAdminOrdersResponse.pagination.limit;

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        keyword.length === 0 ||
        order.user.username.toLowerCase().includes(keyword) ||
        order.book.title.toLowerCase().includes(keyword) ||
        order.status.toLowerCase().includes(keyword);

      return matchesSearch;
    });
  }, [orders, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }
    setCurrentPage(page);
  };

  const paginationSection = (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(event) => {
              event.preventDefault();
              goToPage(currentPage - 1);
            }}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={pageNumber === currentPage}
                onClick={(event) => {
                  event.preventDefault();
                  goToPage(pageNumber);
                }}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(event) => {
              event.preventDefault();
              goToPage(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  return (
    <div className="m-6 space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <h2 className="text-3xl font-semibold">Our Orders</h2>
      </div>

      <div className="w-full xl:max-w-2xl">
        <SearchBar
          placeholder="Search by customer, book, or status"
          onSearch={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          onClear={() => {
            setSearch("");
            setCurrentPage(1);
          }}
          initialValue={search}
          className="w-full"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/20 bg-neutral-950">
        <div className="grid grid-cols-[140px_1fr_1.6fr_120px_120px] border-b border-white/15 px-6 py-3 text-sm uppercase tracking-widest text-white/70">
          <span>order id</span>
          <span>customer</span>
          <span>order receipt</span>
          <span>total</span>
          <span>status</span>
        </div>

        <div className="divide-y divide-white/10">
          {paginatedOrders.map((order, index) => {
            const statusClass =
              statusStyles[order.status] ?? "border-white/30 text-white/60";

            return (
              <div
                key={order.id}
                className={`grid grid-cols-[140px_1fr_1.6fr_120px_120px] items-center px-6 py-4 text-sm ${
                  index % 2 === 0
                    ? "bg-white/[0.02]"
                    : "bg-white/[0.05]"
                }`}
              >
                <span className="text-white/80">{order.id}</span>
                <span className="font-medium text-white">
                  {order.user.username}
                </span>
                <span className="text-sky-200">{order.book.title}</span>
                <span className="text-white/80">
                  {formatAmount(order.amount)}
                </span>
                <span
                  className={`inline-flex w-fit items-center rounded-full border px-2 py-1 text-xs capitalize ${
                    statusClass
                  }`}
                >
                  {order.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {paginationSection}
    </div>
  );
}