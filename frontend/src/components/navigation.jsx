import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navLinks = [
  { label: "books", href: "/books" },
  { label: "features", href: "/features" },
  { label: "about", href: "/about" },
  { label: "contact", href: "/contact" },
];

const isActiveRoute = (pathname, href) => {
  if (href === "/") {
    return pathname === href;
  }
  return pathname.startsWith(href);
};

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="w-full px-4 py-3" style={{ backgroundColor: 'rgba(175, 143, 111, 0.3)' }}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-white/30 px-4 py-2 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" style={{ backgroundColor: 'rgba(175, 143, 111, 0.3)' }}>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/40 bg-white/5">
            <span className="block h-3 w-3 rotate-45 border border-white/80" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-semibold">Readex</p>
            <p className="text-xs text-black/60">Books</p>
          </div>
        </button>

        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const active = isActiveRoute(location.pathname, link.href);
            return (
              <button
                key={link.href}
                type="button"
                onClick={() => navigate(link.href)}
                className={`rounded-full border px-4 py-1.5 text-sm capitalize transition text-black ${
                  active
                    ? "border-sky-400"
                    : "border-white/30 hover:text-black"
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <button
                type="button"
                onClick={() => navigate("/signin")}
                className="rounded-full border border-white/30 px-3 py-1.5 text-sm text-black hover:text-black"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="rounded-full border border-white/30 px-3 py-1.5 text-sm text-black hover:text-black"
              >
                Sign up
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3"
              >
                <img
                  src="/src/assets/photo_2026-05-04_02-11-40.jpg"
                  alt="Profile"
                  className="h-8 w-8 rounded-full border border-white/40 object-cover"
                />
                <span className="text-sm font-medium text-black">
                  {user.username}
                </span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-red-500 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
