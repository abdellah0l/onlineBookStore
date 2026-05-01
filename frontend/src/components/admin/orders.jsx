import { useEffect, useState } from "react";
import SearchBar from "../search-bar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Spinner } from "../ui/spinner";
import { useAdminData } from "../../contexts/AdminDataContext";

const formatAmount = (amount) => `${amount}DA`;

const statusStyles = {
  finished: "border-emerald-400/70 text-emerald-300",
  cancelled: "border-rose-400/70 text-rose-300",
};

export default function AdminOrders() {
  const { listOrders } = useAdminData();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await listOrders({
          page: currentPage,
          limit: pagination.limit,
          search: search.trim() || undefined,
        });
        if (isMounted) {
          setOrders(response?.orders ?? []);
          setPagination(response?.pagination ?? pagination);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Failed to load orders.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [currentPage, listOrders, pagination.limit, search]);

  const totalPages = Math.max(1, pagination.totalPages || 1);

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
          {orders.map((order, index) => {
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