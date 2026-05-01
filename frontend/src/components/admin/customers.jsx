import { useEffect, useState } from "react";
import SearchBar from "../search-bar";
import { Button } from "../ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../ui/pagination";
import { Spinner } from "../ui/spinner";
import { useAdminData } from "../../contexts/AdminDataContext";

const statusStyles = {
    activated: "border-emerald-400/70 text-emerald-300",
    disactivated: "border-rose-400/70 text-rose-300",
};

export default function AdminCustomers() {
    const { listUsers, updateUserStatus } = useAdminData();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 8,
        total: 0,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadUsers = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await listUsers({
                    page: currentPage,
                    limit: pagination.limit,
                    search: search.trim() || undefined,
                });
                if (isMounted) {
                    setUsers(response?.users ?? []);
                    setPagination(response?.pagination ?? pagination);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err?.message || "Failed to load users.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadUsers();

        return () => {
            isMounted = false;
        };
    }, [currentPage, listUsers, pagination.limit, search]);

    const totalPages = Math.max(1, pagination.totalPages || 1);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) {
            return;
        }
        setCurrentPage(page);
    };

    const handleToggleStatus = async (userId) => {
        const currentUser = users.find((user) => user.id === userId);
        if (!currentUser) {
            return;
        }

        const nextStatus =
            currentUser.status === "activated" ? "disactivated" : "activated";

        try {
            await updateUserStatus(userId, nextStatus);
            setUsers((previous) =>
                previous.map((user) =>
                    user.id === userId ? { ...user, status: nextStatus } : user,
                ),
            );
        } catch (err) {
            setError(err?.message || "Failed to update user status.");
        }
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
                <h2 className="text-3xl font-semibold">Customers</h2>
            </div>

            <div className="w-full xl:max-w-2xl">
                <SearchBar
                    placeholder="Search by name or email"
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
                <div className="grid grid-cols-[140px_1fr_1.4fr_130px_140px] border-b border-white/15 px-6 py-3 text-sm uppercase tracking-widest text-white/70">
                    <span>cust id</span>
                    <span>name</span>
                    <span>email</span>
                    <span>status</span>
                    <span>actions</span>
                </div>

                <div className="divide-y divide-white/10">
                    {users.map((user, index) => {
                        const statusClass =
                            statusStyles[user.status] ?? "border-white/30 text-white/60";

                        return (
                            <div
                                key={user.id}
                                className={`grid grid-cols-[140px_1fr_1.4fr_130px_140px] items-center px-6 py-4 text-sm ${
                                    index % 2 === 0
                                        ? "bg-white/[0.02]"
                                        : "bg-white/[0.05]"
                                }`}
                            >
                                <span className="text-white/80">{user.id}</span>
                                <span className="font-medium text-white">{user.username}</span>
                                <span className="text-white/80">{user.email}</span>
                                <span
                                    className={`inline-flex w-fit items-center rounded-full border px-2 py-1 text-xs capitalize ${
                                        statusClass
                                    }`}
                                >
                                    {user.status}
                                </span>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="w-fit border-sky-400/70 text-sky-200 hover:bg-sky-500/10"
                                    onClick={() => handleToggleStatus(user.id)}
                                >
                                    change status
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {paginationSection}
        </div>
    );
}