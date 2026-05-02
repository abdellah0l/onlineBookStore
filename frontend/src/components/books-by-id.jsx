import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navigation from "./navigation";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { useData } from "../contexts/DataContext";
import { toast } from "sonner";

export default function BooksById() {
  const { id } = useParams();
  const { getBook, addToWishlist, checkout, getMe, getReadUrl } = useData();
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    let active = true;

    const loadBook = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBook(id);
        if (active) {
          setBook(data.book || null);
        }
        console.log(data);
        // attempt to detect purchase status if user is authenticated
        try {
          const me = await getMe();
          const orders = me.orders || [];
          const finished = orders.find((o) => o.book && o.book.id === id && o.status === 'finished');
          if (active) setHasPurchased(!!finished);
        } catch {
          // not authenticated or failed to fetch profile
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load book details");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadBook();

    return () => {
      active = false;
    };
  }, [getBook, getMe, id]);

  const handleWishlist = async () => {
    if (!id) {
      return;
    }
    try {
      await addToWishlist(id);
    } catch {
      // addToWishlist already shows toasts on error
    }
  };

  const handleBuy = async () => {
    if (!id) return;
    try {
      setIsCheckingOut(true);
      const data = await checkout(id);
      const url = data.checkout_url;
      if (url) {
        // open external checkout in new tab
        window.open(url, "_blank");
        toast.success("Checkout opened in a new tab. Complete payment to start reading.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleStartReading = async () => {
    try {
      const data = await getReadUrl(id);
      if (data.pdf_signed_url) {
        window.open(data.pdf_signed_url, "_blank");
      } else {
        toast.error("Unable to get read URL");
      }
    } catch (err) {
      toast.error(err.message || "Unable to open book. Maybe it's not purchased yet.");
    }
  };

  const currentBook = book;

  const genreLabel =
    currentBook?.genres?.map((genre) => genre.name).join(", ") || "Unknown";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navigation />

      <div className="relative overflow-hidden h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl"
          style={{
            backgroundImage: currentBook?.cover_image_url
              ? `url(${currentBook.cover_image_url})`
              : "none",
            backgroundColor: currentBook?.cover_image_url ? undefined : "#0a0a0a",
          }}
        />
        <div className="absolute inset-0 bg-neutral-950/80" />

        <main className="relative mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-[32px] border border-white/30 bg-neutral-950/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <Spinner className="size-8" />
              </div>
            ) : error ? (
              <div className="flex min-h-[320px] items-center justify-center text-sm text-rose-300">
                {error}
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                  <div className="flex flex-col items-start gap-4">
                  <div className="h-72 w-52 overflow-hidden rounded-2xl border border-white/30 bg-neutral-900">
                    <img
                      src={currentBook?.cover_image_url}
                      alt={currentBook?.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                    <div className="flex w-full flex-col gap-2">
                      <Button className="bg-sky-500 text-white hover:bg-sky-400" onClick={handleWishlist}>
                        + Add to Wishlist
                      </Button>
                      {!hasPurchased ? (
                        <Button
                          className="bg-emerald-500 text-white hover:bg-emerald-400"
                          onClick={handleBuy}
                          disabled={isCheckingOut}
                        >
                          {isCheckingOut ? 'Processing…' : `Buy for ${currentBook?.price} DA`}
                        </Button>
                      ) : (
                        <Button className="bg-amber-500 text-white hover:bg-amber-400" onClick={handleStartReading}>
                          Start Reading
                        </Button>
                      )}
                    </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-2xl font-semibold">{currentBook?.title}</h1>
                  <p className="text-sm text-white/70">Genre</p>
                  <p className="text-sm text-white/90">{genreLabel}</p>
                  <p className="text-sm text-white/70">Author, Year</p>
                  <p className="text-sm text-white/90">
                    {currentBook?.author}, 2024
                  </p>
                  <p className="text-sm text-white/70">Price</p>
                  <p className="text-sm text-white/90">{currentBook?.price} DA</p>
                  <p className="pt-2 text-sm text-white/70">Description</p>
                  <p className="text-sm text-white/80">{currentBook?.description}</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
