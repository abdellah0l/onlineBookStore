import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";
import { useAdminData } from "../../contexts/AdminDataContext";
import { useAuth } from "../../contexts/AuthContext";
import profilePhoto from "../../assets/photo_2026-05-04_02-11-40.jpg";

export default function AdminSettings() {
    const { updateSettings } = useAdminData();
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const payload = {
                email: email || undefined,
                password: password || undefined,
            };

            await updateSettings(payload);
            setPassword("");
            setMessage("Settings updated successfully.");
        } catch (err) {
            setError(err?.message || "Failed to update settings.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="m-6 flex min-h-[60vh] items-center justify-center">
                <Spinner className="size-8" />
            </div>
        );
    }

    return (
        <div className="m-6 space-y-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <h2 className="text-3xl font-semibold">Settings</h2>
            </div>

            <div className="rounded-[36px] border border-violet-400/60 bg-neutral-950 p-8 text-white shadow-[0_0_0_1px_rgba(167,139,250,0.18)]">
                <form className="grid gap-8 lg:grid-cols-[220px_1fr]" onSubmit={handleSubmit}>
                    <div className="flex flex-col items-center gap-4 text-center">
                        <img
                            src={profilePhoto}
                            alt="Admin Profile"
                            className="h-36 w-36 rounded-full border-4 border-white/70 object-cover"
                        />
                        <p className="text-lg font-semibold">Admin</p>
                    </div>

                    <div className="space-y-6">
                        {error && (
                            <p className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-100">
                                {error}
                            </p>
                        )}
                        {message && (
                            <p className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
                                {message}
                            </p>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="admin-email" className="text-sm font-medium text-white/80">
                                email
                            </Label>
                            <Input
                                id="admin-email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="h-10 border-white/40 bg-transparent text-white placeholder:text-white/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="admin-password" className="text-sm font-medium text-white/80">
                                Password
                            </Label>
                            <Input
                                id="admin-password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="h-10 border-white/40 bg-transparent text-white placeholder:text-white/40"
                                placeholder="••••••••"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="h-11 w-full bg-sky-500 text-base font-semibold text-white hover:bg-sky-400"
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}