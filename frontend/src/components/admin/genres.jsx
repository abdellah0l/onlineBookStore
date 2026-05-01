import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";
import { useAdminData } from "../../contexts/AdminDataContext";

const emptyForm = {
    name: "",
};

const genreTileStyles = [
    "from-sky-500/30 to-sky-500/10",
    "from-rose-500/30 to-rose-500/10",
    "from-emerald-500/30 to-emerald-500/10",
    "from-lime-500/30 to-lime-500/10",
    "from-violet-500/30 to-violet-500/10",
];

export default function AdminGenres() {
    const { listGenres, createGenre, updateGenre, deleteGenre } = useAdminData();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingGenreId, setEditingGenreId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadGenres = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await listGenres();
                if (isMounted) {
                    setGenres(response?.genres ?? []);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err?.message || "Failed to load genres.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadGenres();

        return () => {
            isMounted = false;
        };
    }, [listGenres]);

    const openAddDialog = () => {
        setEditingGenreId(null);
        setForm(emptyForm);
        setDialogOpen(true);
    };

    const openEditDialog = (genre) => {
        setEditingGenreId(genre.id);
        setForm({ name: genre.name });
        setDialogOpen(true);
    };

    const handleDelete = async (genreId) => {
        try {
            await deleteGenre(genreId);
            setGenres((previous) => previous.filter((genre) => genre.id !== genreId));
        } catch (err) {
            setError(err?.message || "Failed to delete genre.");
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        try {
            if (editingGenreId) {
                await updateGenre(editingGenreId, { name: form.name });
            } else {
                await createGenre({ name: form.name });
            }

            const response = await listGenres();
            setGenres(response?.genres ?? []);
            setDialogOpen(false);
            setForm(emptyForm);
            setEditingGenreId(null);
        } catch (err) {
            setError(err?.message || "Failed to save genre.");
        }
    };

    const genreTiles = useMemo(() => genres, [genres]);

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
        <div className="rounded-3xl border border-white/20 bg-neutral-950 p-6 text-white">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
                </div>
                <Button
                    className="gap-2 border border-white/20 bg-white/10 text-white hover:bg-white/20"
                    variant="outline"
                    onClick={openAddDialog}
                >
                    <Plus className="h-4 w-4" />
                    New Genre
                </Button>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <button
                    type="button"
                    onClick={openAddDialog}
                    className="relative flex aspect-square items-center justify-center rounded-3xl border border-white/40 bg-neutral-900/60 text-3xl text-white/70 transition hover:bg-neutral-900"
                >
                    <Plus className="h-10 w-10" />
                </button>

                {genreTiles.map((genre, index) => (
                    <div
                        key={genre.id}
                        className="group relative flex aspect-square flex-col justify-between rounded-3xl border border-white/40 bg-neutral-900/70 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                    >
                        <div className="absolute inset-0 rounded-3xl bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,rgba(255,255,255,0.08)_6px,rgba(255,255,255,0.08)_12px)]" />
                        <div
                            className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${
                                genreTileStyles[index % genreTileStyles.length]
                            } opacity-80`}
                        />
                        <div className="relative z-10 flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-white/70">{genre.id}</span>
                            </div>
                            <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
                                <button
                                    type="button"
                                    onClick={() => openEditDialog(genre)}
                                    className="rounded-full border border-white/30 bg-white/10 p-1.5 text-white hover:bg-white/20"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(genre.id)}
                                    className="rounded-full border border-white/30 bg-white/10 p-1.5 text-white hover:bg-white/20"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-semibold tracking-wide">
                                {genre.name}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md bg-amber-950">
                    <DialogHeader>
                        <DialogTitle>
                            {editingGenreId ? "Edit Genre" : "Add Genre"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingGenreId
                                ? "Update the genre name before saving."
                                : "Create a new genre name for the admin list."}
                        </DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                            <Label htmlFor="genre-name" className="text-sm font-medium">
                                Genre Name
                            </Label>
                            <Input
                                id="genre-name"
                                placeholder="Genre name"
                                value={form.name}
                                onChange={(event) =>
                                    setForm((prev) => ({ ...prev, name: event.target.value }))
                                }
                                className="bg-white"
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" className="bg-green-600">
                                {editingGenreId ? "Save Changes" : "Create Genre"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}