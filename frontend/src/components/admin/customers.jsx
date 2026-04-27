import { useMemo, useState } from "react";
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

const mockAdminUsersResponse = {
    success: true,
    users: [
        { id: "2741", username: "Anis", email: "anis@mail.com", status: "activated" },
        {
            id: "9857",
            username: "Abdelouahed",
            email: "abdel@mail.com",
            status: "activated",
        },
        {
            id: "3874",
            username: "Abdellah",
            email: "abdellah@mail.com",
            status: "disactivated",
        },
        {
            id: "6426",
            username: "Mohammed",
            email: "mohammed@mail.com",
            status: "activated",
        },
        { id: "8375", username: "Amine", email: "amine@mail.com", status: "activated" },
    ],
    pagination: {
        page: 1,
        limit: 8,
        total: 5,
        totalPages: 1,
    },
};

const statusStyles = {
    activated: "border-emerald-400/70 text-emerald-300",
    disactivated: "border-rose-400/70 text-rose-300",
};

export default function AdminCustomers() {
    const [users, setUsers] = useState(mockAdminUsersResponse.users);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(
        mockAdminUsersResponse.pagination.page,
    );

    const pageSize = mockAdminUsersResponse.pagination.limit;

    const filteredUsers = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return users.filter((user) => {
            const matchesSearch =
                keyword.length === 0 ||
                user.username.toLowerCase().includes(keyword) ||
                user.email.toLowerCase().includes(keyword);

            return matchesSearch;
        });
    }, [users, search]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage, pageSize]);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) {
            return;
        }
        setCurrentPage(page);
    };

    const handleToggleStatus = (userId) => {
        setUsers((previous) =>
            previous.map((user) =>
                user.id === userId
                    ? {
                            ...user,
                            status: user.status === "activated" ? "disactivated" : "activated",
                        }
                    : user,
            ),
        );
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
                    {paginatedUsers.map((user, index) => {
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