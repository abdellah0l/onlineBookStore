import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "./navigation";
import { Spinner } from "./ui/spinner";
import { useData } from "../contexts/DataContext";
import profilePhoto from "../assets/photo_2026-05-04_02-11-40.jpg";
import bgImage from "../assets/Blank-Patina-Paper-4-GraphicsFairy-768x1210.jpg";

const statusStyles = {
	finished: "border-emerald-400/70 text-emerald-300",
	pending: "border-amber-400/70 text-amber-300",
	cancelled: "border-rose-400/70 text-rose-300",
};

export default function Profile() {
	const { getMe } = useData();
	const [profile, setProfile] = useState(null);
	const [orders, setOrders] = useState([]);
	const [error, setError] = useState(null);
	const wishlistOrders = orders.filter((order) => order.status === "pending");
	const purchasedOrders = orders.filter((order) => order.status === "finished");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let active = true;

		const loadProfile = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await getMe();
				if (active) {
					setProfile(data.profile || null);
					setOrders(data.orders || []);
				}
			} catch (err) {
				if (active) {
					setError(err.message || "Failed to load profile");
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		loadProfile();

		return () => {
			active = false;
		};
	}, []);

	const totals = {
		orders: orders.length,
		wishlist: wishlistOrders.length,
		spent: purchasedOrders.reduce((sum, order) => sum + order.amount, 0),
	};

	return (
		<div className="min-h-screen text-black" style={{ backgroundImage: `url(${bgImage})`, backgroundAttachment: "fixed" }}>
			<Navigation />

			<main className="mx-auto max-w-6xl px-4 py-8">
				<div className="rounded-[32px] border border-white/20 bg-neutral-950 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
					{loading ? (
						<div className="flex min-h-[320px] items-center justify-center">
							<Spinner className="size-8" />
						</div>
					) : error ? (
						<div className="flex min-h-[320px] items-center justify-center text-sm text-rose-300">
							{error}
						</div>
					) : (
						<div>
							<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
						<div className="flex items-center gap-4">
							<img
								src={profilePhoto}
								alt="Profile"
								className="h-16 w-16 rounded-full border border-white/40 object-cover"
							/>
							<div>
								<h1 className="text-2xl font-semibold">{profile.username}</h1>
								<p className="text-sm text-black/60">{profile.email}</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-3 text-sm">
							<div className="rounded-2xl border border-white/20 bg-white/[0.03] px-4 py-2">
						<p className="text-black/60">Orders</p>
						<p className="text-lg font-semibold text-black">
									{totals.orders}
								</p>
							</div>
							<div className="rounded-2xl border border-white/20 bg-white/[0.03] px-4 py-2">
						<p className="text-black/60">Wishlist</p>
						<p className="text-lg font-semibold text-black">
									{totals.wishlist}
								</p>
							</div>
							<div className="rounded-2xl border border-white/20 bg-white/[0.03] px-4 py-2">
						<p className="text-black/60">Total spent</p>
						<p className="text-lg font-semibold text-black">
									{totals.spent} DA
								</p>
							</div>
						</div>
					</div>

						<div className="mt-8 grid gap-6 lg:grid-cols-2">
						<div>
							<h2 className="text-lg font-semibold">Purchased Books</h2>
							<div className="mt-4 space-y-3">
								{purchasedOrders.map((order) => {
									const statusClass =
										statusStyles[order.status] ??
										"border-white/30 text-white/60";

									return (
										<div
											key={order.id}
											className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
										>
											<div className="flex items-center gap-4">
												<Link
													to={`/books/${order.book.id}`}
													className="h-16 w-12 overflow-hidden rounded-lg border border-white/30 bg-neutral-900"
												>
													<img
														src={order.book.cover_image_url}
														alt={order.book.title}
														className="h-full w-full object-cover"
													/>
												</Link>
												<div>
													<Link
														to={`/books/${order.book.id}`}
																className="text-sm font-semibold text-black hover:underline"
													>
														{order.book.title}
													</Link>
													<p className="text-xs text-white/60">
														{new Date(order.purchased_at).toLocaleDateString()}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-4 text-sm">
														<span className="text-black/70">
													{order.amount} DA
												</span>
												<span
													className={`inline-flex items-center rounded-full border px-2 py-1 text-xs capitalize ${statusClass}`}
												>
													{order.status}
												</span>
											</div>
										</div>
									);
								})}
								{purchasedOrders.length === 0 && (
									<p className="text-sm text-white/60">
										No purchased books yet.
									</p>
								)}
							</div>
						</div>

						<div>
							<h2 className="text-lg font-semibold">Wishlist</h2>
							<div className="mt-4 space-y-3">
								{wishlistOrders.map((order) => {
									const statusClass =
										statusStyles[order.status] ??
										"border-white/30 text-white/60";

									return (
										<div
											key={order.id}
											className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
										>
											<div className="flex items-center gap-4">
												<Link
													to={`/books/${order.book.id}`}
													className="h-16 w-12 overflow-hidden rounded-lg border border-white/30 bg-neutral-900"
												>
													<img
														src={order.book.cover_image_url}
														alt={order.book.title}
														className="h-full w-full object-cover"
													/>
												</Link>
												<div>
													<Link
														to={`/books/${order.book.id}`}
														className="text-sm font-semibold text-white hover:underline"
													>
														{order.book.title}
													</Link>
													<p className="text-xs text-white/60">
														{new Date(order.purchased_at).toLocaleDateString()}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-4 text-sm">
												<span className="text-white/70">
													{order.amount} DA
												</span>
												<span
													className={`inline-flex items-center rounded-full border px-2 py-1 text-xs capitalize ${statusClass}`}
												>
													{order.status}
												</span>
											</div>
										</div>
									);
								})}
								{wishlistOrders.length === 0 && (
									<p className="text-sm text-white/60">
										No books saved in wishlist.
									</p>
								)}
							</div>
						</div>
						</div>
					</div>
					)}
				</div>
			</main>
		</div>
	);
}
