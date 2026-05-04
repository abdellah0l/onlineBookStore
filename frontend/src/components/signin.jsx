import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Spinner } from "./ui/spinner";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "./navigation";
import bgImage from "../assets/Blank-Patina-Paper-4-GraphicsFairy-768x1210.jpg";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [navigate, user]);

  const handleSignIn = async () => {
    await signIn(email, password);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundImage: `url(${bgImage})`, backgroundAttachment: "fixed" }}>
      <Navigation />
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action=""
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignIn();
                }}
              >
                <div className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  className="w-full mt-4 px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600"
                  type="submit"
                >
                  Sign In
                </button>
              </form>
            </CardContent>
          </Card>
          <button
            className="w-full px-4 py-2 bg-gray-500 text-black rounded hover:bg-gray-600"
            onClick={() => (window.location.href = "/signup")}
          >
            Don't have an account? Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
