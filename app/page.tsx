import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Executive Secretary
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Intelligent scheduling for bishopric interviews
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/schedule"
            className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-blue-600 mb-3">
              Schedule Interview
            </h2>
            <p className="text-gray-600">
              Ward members: Schedule an appointment with a bishopric member
            </p>
          </Link>

          <Link
            href="/admin"
            className="block p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
          >
            <h2 className="text-2xl font-semibold text-purple-600 mb-3">
              Admin Portal
            </h2>
            <p className="text-gray-600">
              Executive Secretary: Manage ward, bishopric, and appointments
            </p>
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>
            Executive secretaries and bishopric members should{" "}
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
