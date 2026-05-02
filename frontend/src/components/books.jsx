import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "./navigation";
import SearchBar from "./search-bar";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { useData } from "../contexts/DataContext";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

export default function Books() {
  const { getBooks, getGenres } = useData();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const loadBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBooks({
          page: currentPage,
          limit: 10,
          search: search.trim() || undefined,
          genre_id: selectedGenreId === "all" ? undefined : selectedGenreId,
        });

        if (active) {
          setBooks(data.books || []);
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load books");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadBooks();

    return () => {
      active = false;
    };
  }, [currentPage, getBooks, search, selectedGenreId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedGenreId]);

  useEffect(() => {
    let active = true;

    const loadGenres = async () => {
      try {
        const data = await getGenres();
        if (active) {
          setGenres(data.genres || []);
        }
      } catch {
        // ignore genre load errors for now
      }
    };

    loadGenres();

    return () => {
      active = false;
    };
  }, [getGenres]);

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
              {genres.map((genre) => (
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

        <div className="mt-10">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <Spinner className="size-8" />
            </div>
          ) : error ? (
            <div className="flex min-h-[320px] items-center justify-center text-sm text-rose-300">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-5">
              {books.map((book) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="relative h-44 w-28 overflow-hidden rounded-lg border border-white/30 bg-zinc-900 transition-transform duration-200 group-hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-zinc-900/40" />
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-45"
                    />
                  </div>

                  <span className="max-w-28 truncate text-center text-sm font-medium">
                    {book.title}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">{paginationSection}</div>
      </div>
    </div>
  );
}
