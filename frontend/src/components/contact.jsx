import Navigation from "./navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function Contact() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navigation />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-[32px] border border-white/20 bg-neutral-950 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
          <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-br from-emerald-950/60 via-neutral-950 to-neutral-950 p-6">
            <div className="absolute -left-10 -top-14 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-16 right-6 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="relative">
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                Contact
              </p>
              <h1 className="mt-2 text-3xl font-semibold">Get in touch</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/70">
                Questions about books, orders, or your account? Send us a message
                and our team will get back to you as soon as possible.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border border-white/15 bg-white/[0.03]">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill in the form below and we will reply by email.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm text-white/80">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Jane Doe"
                      className="h-10 rounded-md border border-white/20 bg-neutral-900 px-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm text-white/80">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jane@example.com"
                      className="h-10 rounded-md border border-white/20 bg-neutral-900 px-3 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="message" className="text-sm text-white/80">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="How can we help you?"
                      className="rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    className="rounded-md border border-cyan-400/70 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20"
                  >
                    Send Message
                  </button>
                </form>
              </CardContent>
            </Card>

            <Card className="border border-white/15 bg-white/[0.03]">
              <CardHeader>
                <CardTitle>Support details</CardTitle>
                <CardDescription>
                  Reach out directly through the channels below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-white/80">
                <div>
                  <p className="text-white/50">Email</p>
                  <p>support@onlinebookstore.com</p>
                </div>
                <div>
                  <p className="text-white/50">Phone</p>
                  <p>+1 (555) 010-2456</p>
                </div>
                <div>
                  <p className="text-white/50">Address</p>
                  <p>24 Reading Lane, Library District, NY 10001</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-white/70">
                    Support hours: Monday to Friday, 9:00 AM - 6:00 PM.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
