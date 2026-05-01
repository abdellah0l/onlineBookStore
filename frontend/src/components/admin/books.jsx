import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import SearchBar from "../search-bar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Label } from "../ui/label";
import { useAdminData } from "../../contexts/AdminDataContext";

const emptyForm = {
  title: "",
  author: "",
  rating: "",
  price: "",
  description: "",
  cover_image_url: "",
  pdf_url: "",
  genresIds: [],
};


export default function AdminBooks() {
  const {
    listBooks,
    listGenres,
    createBook,
    updateBook,
    deleteBook,
  } = useAdminData();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadGenres = async () => {
      try {
        const response = await listGenres();
        if (isMounted) {
          setGenres(response?.genres ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Failed to load genres.");
        }
      }
    };

    loadGenres();

    return () => {
      isMounted = false;
    };
  }, [listGenres]);

  useEffect(() => {
    let isMounted = true;

    const loadBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await listBooks({
          page: currentPage,
          limit: pagination.limit,
          search: search.trim() || undefined,
          genre_id: selectedGenreId === "all" ? undefined : selectedGenreId,
        });

        if (isMounted) {
          setBooks(response?.books ?? []);
          setPagination(response?.pagination ?? pagination);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Failed to load books.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBooks();

    return () => {
      isMounted = false;
    };
  }, [currentPage, listBooks, pagination.limit, refreshKey, search, selectedGenreId]);

  const totalPages = Math.max(1, pagination.totalPages || 1);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }
    setCurrentPage(page);
  };

  const openAddDialog = () => {
    setEditingBookId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (book) => {
    setEditingBookId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      rating: String(book.rating),
      price: String(book.price),
      description: book.description,
      cover_image_url: book.cover_image_url,
      pdf_url: book.pdf_url,
      genresIds: book.genres.map((genre) => genre.id),
    });
    setDialogOpen(true);
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await deleteBook(bookId);
      setBooks((previous) => previous.filter((book) => book.id !== bookId));
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err?.message || "Failed to delete book.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const payload = {
      title: form.title,
      author: form.author,
      rating: form.rating ? Number(form.rating) : undefined,
      price: Number(form.price || 0),
      description: form.description || undefined,
      cover_image_url: form.cover_image_url || undefined,
      pdf_url: form.pdf_url,
      genresIds: form.genresIds,
    };

    try {
      if (editingBookId) {
        await updateBook(editingBookId, payload);
      } else {
        await createBook(payload);
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setEditingBookId(null);
      setCurrentPage(1);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(err?.message || "Failed to save book.");
    }
  };

  const toggleGenreSelection = (genreId) => {
    setForm((previous) => {
      const exists = previous.genresIds.includes(genreId);
      return {
        ...previous,
        genresIds: exists
          ? previous.genresIds.filter((selectedId) => selectedId !== genreId)
          : [...previous.genresIds, genreId],
      };
    });
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
        <h2 className="text-3xl font-semibold">Our Books</h2>
      </div>

      <div className="w-full xl:max-w-2xl">
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

        <div className="mt-3 flex flex-wrap gap-2">
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

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-5">
        <button
          type="button"
          onClick={openAddDialog}
          className="group flex flex-col items-center gap-2 text-left"
        >
          <div className="relative h-44 w-28 overflow-hidden border border-zinc-300/80 bg-zinc-900 transition-transform duration-200 group-hover:scale-[1.02]">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0_2px,transparent_2px_8px)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Plus className="h-10 w-10 text-zinc-200" />
            </div>
          </div>
          <span className="text-sm font-medium">Add Book</span>
        </button>

        {books.map((book) => (
          <div key={book.id} className="group flex flex-col items-center gap-2">
            <div className="relative h-44 w-28 overflow-hidden rounded-lg border border-white/30 bg-zinc-900 transition-transform duration-200 group-hover:scale-[1.02]">
              <div className="absolute inset-0 bg-zinc-900/40" />
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="absolute inset-0 h-full w-full object-cover opacity-45"
              />
              
              <div className="absolute left-1.5 top-1.5 flex flex-col gap-1">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="h-5 w-5 rounded-sm border border-red-400/70 bg-zinc-950/80 p-0 hover:bg-zinc-800"
                  onClick={() => openEditDialog(book)}
                  aria-label={`Edit ${book.title}`}
                >
                  <Pencil className="h-3 w-3 text-red-300" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="h-5 w-5 rounded-sm border border-zinc-300/70 bg-zinc-950/80 p-0 hover:bg-zinc-800"
                  onClick={() => handleDeleteBook(book.id)}
                  aria-label={`Delete ${book.title}`}
                >
                  <Trash2 className="h-3 w-3 text-zinc-200" />
                </Button>
              </div>
            </div>

            <span className="max-w-28 truncate text-center text-sm font-medium">
              {book.title}
            </span>
          </div>
        ))}
      </div>

      {paginationSection}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl bg-amber-950">
          <DialogHeader>
            <DialogTitle>
              {editingBookId ? "Edit Book" : "Add Book"}
            </DialogTitle>
            <DialogDescription>
              Fill the fields below based on the admin books contract payload.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
              <Label htmlFor="book-title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="book-title"
                placeholder="Title"
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                className="bg-white"
                required
              />
              </div>

              <div className="space-y-1.5">
              <Label htmlFor="book-author" className="text-sm font-medium">
                Author
              </Label>
              <Input
                id="book-author"
                placeholder="Author"
                value={form.author}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, author: event.target.value }))
                }
                className="bg-white"
                required
              />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="book-rating" className="text-sm font-medium">
                  Rating
                </Label>
                <Input
                  id="book-rating"
                  type="number"
                  step="0.1"
                  placeholder="Rating"
                  value={form.rating}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, rating: event.target.value }))
                  }
                  className="bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="book-price" className="text-sm font-medium">
                  Price
                </Label>
                <Input
                  id="book-price"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={form.price}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, price: event.target.value }))
                  }
                  className="bg-white"
                  required
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="book-description"
                  className="text-sm font-medium"
                >
                  Description
                </Label>
                <Input
                  id="book-description"
                  placeholder="Description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="book-cover-image-url"
                  className="text-sm font-medium"
                >
                  Cover Image URL
                </Label>
                <Input
                  id="book-cover-image-url"
                  placeholder="Cover Image URL"
                  value={form.cover_image_url}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      cover_image_url: event.target.value,
                    }))
                  }
                  className="bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="book-pdf-url" className="text-sm font-medium">
                  PDF URL
                </Label>
                <Input
                  id="book-pdf-url"
                  placeholder="PDF URL"
                  value={form.pdf_url}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, pdf_url: event.target.value }))
                  }
                  className="bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Genres</Label>
              <div className="grid max-h-44 grid-cols-2 gap-2 overflow-auto rounded-lg border bg-background p-2">
                {genres.map((genre) => {
                  const isSelected = form.genresIds.includes(genre.id);

                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => toggleGenreSelection(genre.id)}
                      className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? "border-green-500 bg-green-500/10 text-green-700"
                          : "border-border bg-card hover:bg-muted/60"
                      }`}
                    >
                      <span className="font-medium">{genre.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {genre.id}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Choose the genre names. The form submits their IDs to the
                contract payload.
              </p>
              <div className="flex flex-wrap gap-2">
                {form.genresIds.map((genreId) => {
                  const genre = genres.find(
                    (item) => item.id === genreId,
                  );

                  return (
                    <span
                      key={genreId}
                      className="rounded-full border bg-muted px-2 py-1 text-xs"
                    >
                      {genre?.name ?? genreId} ({genreId})
                    </span>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="bg-green-600">
                {editingBookId ? "Save Changes" : "Create Book"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
