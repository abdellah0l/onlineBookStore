import { useMemo, useState } from "react";
import Navigation from "./navigation";
import SearchBar from "./search-bar";
import { Button } from "./ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

const mockBooksResponse = {
  success: true,
  books: [
    {
      id: "b1",
      title: "Atomic Habits",
      author: "James Clear",
      rating: 4.8,
      price: 2200,
      description: "Build good habits and break bad ones.",
      cover_image_url:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
      genres: [
        { id: "g1", name: "Self-Help" },
        { id: "g2", name: "Productivity" },
      ],
    },
    {
      id: "b2",
      title: "Clean Code",
      author: "Robert C. Martin",
      rating: 4.7,
      price: 2800,
      description: "A handbook of agile software craftsmanship.",
      cover_image_url:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80",
      genres: [{ id: "g3", name: "Programming" }],
    },
    {
      id: "b3",
      title: "Deep Work",
      author: "Cal Newport",
      rating: 4.5,
      price: 1900,
      description: "Rules for focused success in a distracted world.",
      cover_image_url:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80",
      genres: [
        { id: "g2", name: "Productivity" },
        { id: "g4", name: "Business" },
      ],
    },
    {
      id: "b4",
      title: "The Pragmatic Programmer",
      author: "Andrew Hunt",
      rating: 4.6,
      price: 2600,
      description: "Journey to mastery for modern developers.",
      cover_image_url:
        "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
      genres: [{ id: "g3", name: "Programming" }],
    },
    {
      id: "b5",
      title: "Rich Dad Poor Dad",
      author: "Robert Kiyosaki",
      rating: 4.2,
      price: 1700,
      description: "What the rich teach their kids about money.",
      cover_image_url:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=900&q=80",
      genres: [{ id: "g4", name: "Business" }],
    },
    {
      id: "b6",
      title: "The Alchemist",
      author: "Paulo Coelho",
      rating: 4.4,
      price: 1400,
      description: "A magical story about purpose and destiny.",
      cover_image_url:
        "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=900&q=80",
      genres: [{ id: "g5", name: "Novel" }],
    },
  ],
  pagination: {
    page: 1,
    limit: 6,
    total: 6,
    totalPages: 1,
  },
};

const mockGenresResponse = {
  success: true,
  genres: [
    { id: "g1", name: "Self-Help" },
    { id: "g2", name: "Productivity" },
    { id: "g3", name: "Programming" },
    { id: "g4", name: "Business" },
    { id: "g5", name: "Novel" },
  ],
};

export default function Books() {
  const [books] = useState(mockBooksResponse.books);
  const [search, setSearch] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState("all");
  const [currentPage, setCurrentPage] = useState(
    mockBooksResponse.pagination.page,
  );

  const pageSize = mockBooksResponse.pagination.limit;

  const filteredBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        keyword.length === 0 ||
        book.title.toLowerCase().includes(keyword) ||
        book.author.toLowerCase().includes(keyword) ||
        book.description.toLowerCase().includes(keyword);

      const matchesGenre =
        selectedGenreId === "all" ||
        book.genres.some((genre) => genre.id === selectedGenreId);

      return matchesSearch && matchesGenre;
    });
  }, [books, search, selectedGenreId]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));

  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage, pageSize]);

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
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navigation />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-semibold">Our Books</h2>
          <div className="mt-6 w-full max-w-2xl">
            <SearchBar
              placeholder="Search by title, author, or description"
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

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant={selectedGenreId === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedGenreId("all");
                  setCurrentPage(1);
                }}
              >
                All Genres
              </Button>
              {mockGenresResponse.genres.map((genre) => (
                <Button
                  key={genre.id}
                  type="button"
                  variant={selectedGenreId === genre.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedGenreId(genre.id);
                    setCurrentPage(1);
                  }}
                >
                  {genre.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-5">
          {paginatedBooks.map((book) => (
            <div
              key={book.id}
              className="group flex flex-col items-center gap-2"
            >
              <div className="relative h-44 w-28 overflow-hidden rounded-lg border border-white/30 bg-zinc-900 transition-transform duration-200 group-hover:scale-[1.02]">
                <div className="absolute inset-0 bg-zinc-900/40" />
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-45"
                />{" "}
              </div>

              <span className="max-w-28 truncate text-center text-sm font-medium">
                {book.title}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">{paginationSection}</div>
      </div>
    </div>
  );
}
