import { useEffect, useState } from "react";
import Navigation from "./navigation";
import { Spinner } from "./ui/spinner";
import { useData } from "../contexts/DataContext";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "./ui/carousel";

export default function Home() {
	const { getRecentBooks } = useData();
	const [books, setBooks] = useState([]);
	const [error, setError] = useState(null);
	const [carouselApi, setCarouselApi] = useState(null);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let active = true;

		const loadBooks = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await getRecentBooks();
				if (active) {
					setBooks(data.books || []);
				}
			} catch (err) {
				if (active) {
					setError(err.message || "Failed to load recent books");
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
	}, [getRecentBooks]);

	useEffect(() => {
		if (!carouselApi) {
			return;
		}

		const handleSelect = () => {
			setSelectedIndex(carouselApi.selectedScrollSnap());
		};

		handleSelect();
		carouselApi.on("select", handleSelect);

		return () => {
			carouselApi.off("select", handleSelect);
		};
	}, [carouselApi]);

	const featuredBooks = books.slice(0, 6);
	const selectedBook = books[selectedIndex] ?? books[0];

	return (
		<div className="min-h-screen bg-neutral-950 text-white">
			<Navigation />

			<main className="px-4 pb-10 pt-6">
				<div className="mx-auto max-w-6xl rounded-[32px] border border-white/30 bg-neutral-950 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
					{loading ? (
						<div className="flex min-h-[360px] items-center justify-center">
							<Spinner className="size-8" />
						</div>
					) : error ? (
						<div className="flex min-h-[360px] items-center justify-center text-sm text-rose-300">
							{error}
						</div>
					) : (
						<div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
						<div className="rounded-[28px] border border-white/20 bg-neutral-900/70 p-5">
							<div className="relative overflow-hidden rounded-[24px] border border-white/20 bg-neutral-800">
								<Carousel setApi={setCarouselApi} className="relative">
									<CarouselContent>
										{books.map((book) => (
											<CarouselItem key={book.id}>
												<div className="relative h-[280px] w-full overflow-hidden">
													<img
														src={book.cover_image_url}
														alt={book.title}
														className="absolute inset-0 h-full w-full object-cover"
													/>
													<div className="absolute inset-0 bg-neutral-900/50" />
												</div>
											</CarouselItem>
										))}
									</CarouselContent>
									<CarouselPrevious className="left-4" />
									<CarouselNext className="right-4" />
								</Carousel>
							</div>

							<div className="mt-4">
								<h2 className="text-2xl font-semibold">{selectedBook.title}</h2>
								<p className="mt-2 text-sm text-white/70">
									{selectedBook.description}
								</p>
							</div>
						</div>

						<aside className="rounded-[28px] border border-violet-400/60 bg-neutral-950 p-5">
							<h3 className="text-lg font-semibold text-white/90">Featured</h3>
							<div className="mt-4 space-y-3">
								{featuredBooks.map((book, index) => {
									const isActive = index === selectedIndex;

									return (
										<button
											key={book.id}
											type="button"
											onClick={() => {
												setSelectedIndex(index);
												carouselApi?.scrollTo(index);
											}}
											className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${
												isActive
													? "border-rose-400/80 text-white"
													: "border-white/20 text-white/70 hover:border-white/40"
											}`}
										>
											<span className="h-7 w-7 rounded-md border border-white/20 bg-white/10" />
											<span>{book.title}</span>
										</button>
									);
								})}
							</div>
						</aside>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
