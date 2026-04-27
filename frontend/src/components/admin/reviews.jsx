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

const mockAdminReviewsResponse = {
  success: true,
  reviews: [
    {
      id: "r1",
      user: { id: "2741", username: "Anis" },
      book: { id: "b1", title: "Atomic Habits" },
      rating: 5,
    },
    {
      id: "r2",
      user: { id: "9857", username: "Abdelouahed" },
      book: { id: "b2", title: "Clean Code" },
      rating: 2,
    },
    {
      id: "r3",
      user: { id: "3874", username: "Abdellah" },
      book: { id: "b3", title: "Deep Work" },
      rating: 4,
    },
    {
      id: "r4",
      user: { id: "6426", username: "Mohammed" },
      book: { id: "b4", title: "The Pragmatic Programmer" },
      rating: 5,
    },
    {
      id: "r5",
      user: { id: "8375", username: "Amine" },
      book: { id: "b5", title: "Rich Dad Poor Dad" },
      rating: 3,
    },
  ],
  pagination: {
    page: 1,
    limit: 8,
    total: 5,
    totalPages: 1,
  },
};

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
  const [reviews, setReviews] = useState(mockAdminReviewsResponse.reviews);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(
    mockAdminReviewsResponse.pagination.page,
  );

  const pageSize = mockAdminReviewsResponse.pagination.limit;

  const filteredReviews = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        keyword.length === 0 ||
        review.user.username.toLowerCase().includes(keyword) ||
        review.book.title.toLowerCase().includes(keyword);

      return matchesSearch;
    });
  }, [reviews, search]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReviews.slice(start, start + pageSize);
  }, [filteredReviews, currentPage, pageSize]);

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
          {paginatedReviews.map((review, index) => (
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