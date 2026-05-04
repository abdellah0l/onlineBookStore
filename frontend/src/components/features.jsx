
import Navigation from "./navigation";
import bgImage from "../assets/Blank-Patina-Paper-4-GraphicsFairy-768x1210.jpg";

const featureCards = [
	{
		title: "Discover and filter books",
		description:
			"Search across title, author, and description with genre filters to find the right read quickly.",
	},
	{
		title: "Clean book details",
		description:
			"A focused detail view with genre tags, author info, and a distraction-free layout.",
	},
	{
		title: "Wishlist and checkout",
		description:
			"Add to wishlist or start a secure checkout flow for instant access to your books.",
	},
	{
		title: "Secure reading access",
		description:
			"Read with signed links that protect PDF content and expire automatically.",
	},
	{
		title: "Profile and order tracking",
		description:
			"Track purchases and wishlist items in one place with clear status labels.",
	},
	{
		title: "Admin management",
		description:
			"Admins can manage books, genres, users, reviews, and orders with dashboards.",
	},
];

const adminHighlights = [
	"Dashboard KPIs with trends",
	"Books and genres CRUD",
	"Orders and reviews overview",
	"Analytics with sales breakdowns",
	"User status management",
];

export default function Features() {
	return (
			<div className="min-h-screen text-black" style={{ backgroundImage: `url(${bgImage})`, backgroundAttachment: "fixed" }}>
			<Navigation />
			<main className="mx-auto max-w-6xl px-4 py-10">
				<div className="rounded-[32px] border border-white/20 bg-neutral-950 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
					<div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-br from-amber-950/60 via-neutral-950 to-neutral-950 p-6">
						<div className="absolute -left-10 -top-14 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
						<div className="absolute -bottom-16 right-6 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
						<div className="relative">
							<p className="text-sm uppercase tracking-[0.3em] text-white/60">
								Features
							</p>
							<h1 className="mt-2 text-3xl font-semibold">
								Everything you need to explore, buy, and manage books
							</h1>
							<p className="mt-3 max-w-2xl text-sm text-white/70">
								Built around the project API contract with clear flows for readers
								and a powerful admin toolkit for operations.
							</p>
						</div>
					</div>

					<div className="mt-8 grid gap-6 md:grid-cols-2">
						{featureCards.map((feature) => (
							<div
								key={feature.title}
								className="rounded-2xl border border-white/15 bg-white/[0.03] p-5"
							>
								<h3 className="text-lg font-semibold">{feature.title}</h3>
								<p className="mt-2 text-sm text-white/70">
									{feature.description}
								</p>
							</div>
						))}
					</div>

					<div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
						<div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5">
							<h2 className="text-lg font-semibold">Reader journey</h2>
							<ol className="mt-4 space-y-3 text-sm text-white/70">
								<li className="flex gap-3">
									<span className="text-white/40">01</span>
									<span>Browse recent books and curated collections.</span>
								</li>
								<li className="flex gap-3">
									<span className="text-white/40">02</span>
									<span>Filter by genre and search by title or author.</span>
								</li>
								<li className="flex gap-3">
									<span className="text-white/40">03</span>
									<span>Open a book detail page with price and description.</span>
								</li>
								<li className="flex gap-3">
									<span className="text-white/40">04</span>
									<span>Save to wishlist or checkout for instant access.</span>
								</li>
							</ol>
						</div>

						<div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5">
							<h2 className="text-lg font-semibold">Admin toolkit</h2>
							<ul className="mt-4 space-y-2 text-sm text-white/70">
								{adminHighlights.map((item) => (
									<li key={item} className="flex gap-3">
										<span className="mt-1 h-2 w-2 rounded-full bg-emerald-400/80" />
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}