"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const navigation = [
    { name: "Dashboard", href: "/admin" },
    { name: "Ward Settings", href: "/admin/ward" },
    { name: "Bishopric", href: "/admin/bishopric" },
    { name: "Interview Types", href: "/admin/interviews" },
    { name: "Appointments", href: "/admin/appointments" },
    { name: "Calendar", href: "/admin/calendar" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  Executive Secretary Admin
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? "border-blue-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
