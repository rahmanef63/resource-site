"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import ClientTestimonials from "./components/testimonial";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const sendMessage = useMutation(api.contactMessages.send);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus("sending");

    try {
      // Save to Convex DB
      await sendMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
      });

      // Send email notification (non-blocking — message already saved)
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim(),
        }),
      }).catch(() => {
        // Email failed but message is saved — admin will see it in dashboard
      });

      setStatus("sent");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
        <div className="w-full md:w-1/2 max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
            Contact Us
          </h1>

          {status === "sent" ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-800 font-medium text-lg mb-2">
                Message Sent!
              </p>
              <p className="text-green-600 text-sm">
                Thank you for reaching out. We&apos;ll get back to you soon.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 text-sm text-green-700 underline hover:no-underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {status === "error" && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-md">
                  Something went wrong. Please try again.
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block mb-2 text-sm font-medium"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+62 xxx xxxx xxxx"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block mb-2 text-sm font-medium"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Tell us about your project..."
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full md:w-auto bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>

        <div className="w-full md:w-1/2">
          <ClientTestimonials />
        </div>
      </div>
    </main>
  );
}
