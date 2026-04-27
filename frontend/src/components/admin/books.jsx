import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import SearchBar from "../search-bar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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

const mockAdminBooksResponse = {
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
      pdf_url: "s3://books/atomic-habits.pdf",
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
      pdf_url: "s3://books/clean-code.pdf",
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
      pdf_url: "s3://books/deep-work.pdf",
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
      pdf_url: "s3://books/pragmatic-programmer.pdf",
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
      pdf_url: "s3://books/rich-dad-poor-dad.pdf",
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
      pdf_url: "s3://books/the-alchemist.pdf",
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

const mockAdminGenresResponse = {
  success: true,
  genres: [
    { id: "g1", name: "Self-Help" },
    { id: "g2", name: "Productivity" },
    { id: "g3", name: "Programming" },
    { id: "g4", name: "Business" },
    { id: "g5", name: "Novel" },
  ],
};

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

const frameAccentClasses = [
  "border-cyan-500/80",
  "border-blue-500/80",
  "border-rose-500/80",
  "border-violet-500/80",
  "border-green-500/80",
  "border-red-500/80",
  "border-zinc-300/80",
  "border-sky-500/80",
  "border-orange-500/80",
];

export default function AdminBooks() {
  const [books, setBooks] = useState(mockAdminBooksResponse.books);
  const [search, setSearch] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState("all");
  const [currentPage, setCurrentPage] = useState(
    mockAdminBooksResponse.pagination.page,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const pageSize = mockAdminBooksResponse.pagination.limit;

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

  const handleDeleteBook = (bookId) => {
    setBooks((previous) => previous.filter((book) => book.id !== bookId));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const parsedGenres = form.genresIds.map((genreId) => {
      const genre = mockAdminGenresResponse.genres.find(
        (item) => item.id === genreId,
      );
      return genre ?? { id: genreId, name: genreId };
    });

    const nextBook = {
      id: editingBookId ?? `b-${Date.now()}`,
      title: form.title,
      author: form.author,
      rating: Number(form.rating || 0),
      price: Number(form.price || 0),
      description: form.description,
      cover_image_url:
        form.cover_image_url ||
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
      pdf_url: form.pdf_url,
      genres: parsedGenres,
    };

    if (editingBookId) {
      setBooks((previous) =>
        previous.map((book) => (book.id === editingBookId ? nextBook : book)),
      );
    } else {
      setBooks((previous) => [nextBook, ...previous]);
    }

    setDialogOpen(false);
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
          {mockAdminGenresResponse.genres.map((genre) => (
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

        {paginatedBooks.map((book, index) => {
          const accent = frameAccentClasses[index % frameAccentClasses.length];

          return (
            <div
              key={book.id}
              className="group flex flex-col items-center gap-2"
            >
              <div
                className={`relative h-44 w-28 overflow-hidden rounded-lg border ${accent} bg-zinc-900 transition-transform duration-200 group-hover:scale-[1.02]`}
              >
                <div className="absolute inset-0 bg-zinc-900/40" />
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-45"
                />
                <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.12)_0_2px,transparent_2px_8px)]" />

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
          );
        })}
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
                {mockAdminGenresResponse.genres.map((genre) => {
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
                  const genre = mockAdminGenresResponse.genres.find(
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
