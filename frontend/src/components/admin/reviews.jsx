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

const renderStars = (rating) => {
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-amber-400" : "text-white/40"}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default function AdminReviews() {
  const { listReviews } = useAdminData();
  const [reviews, setReviews] = useState([]);
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

    const loadReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await listReviews({
          page: currentPage,
          limit: pagination.limit,
          search: search.trim() || undefined,
        });
        if (isMounted) {
          setReviews(response?.reviews ?? []);
          setPagination(response?.pagination ?? pagination);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Failed to load reviews.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [currentPage, listReviews, pagination.limit, search]);

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
        <h2 className="text-3xl font-semibold">Reviews</h2>
      </div>

      <div className="w-full xl:max-w-2xl">
        <SearchBar
          placeholder="Search by customer name or book"
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
        <div className="grid grid-cols-[140px_1fr_1.5fr_120px] border-b border-white/15 px-6 py-3 text-sm uppercase tracking-widest text-white/70">
          <span>cust id</span>
          <span>name</span>
          <span>book</span>
          <span>rating</span>
        </div>

        <div className="divide-y divide-white/10">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className={`grid grid-cols-[140px_1fr_1.5fr_120px] items-center px-6 py-4 text-sm ${
                index % 2 === 0
                  ? "bg-white/[0.02]"
                  : "bg-white/[0.05]"
              }`}
            >
              <span className="text-white/80">{review.user.id}</span>
              <span className="font-medium text-white">
                {review.user.username}
              </span>
              <span className="text-white/80">{review.book.title}</span>
              <span>{renderStars(review.rating)}</span>
            </div>
          ))}
        </div>
      </div>

      {paginationSection}
    </div>
  );
}