import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const userId = (session.user as any).id;
  const wardId = (session.user as any).wardId;

  // Fetch dashboard data
  const ward = await prisma.ward.findUnique({
    where: { id: wardId },
    include: {
      bishopricMembers: {
        include: {
          user: true,
        },
      },
      interviewTypes: {
        where: { isActive: true },
      },
      appointments: {
        where: {
          status: "SCHEDULED",
          startTime: {
            gte: new Date(),
          },
        },
        orderBy: {
          startTime: "asc",
        },
        take: 5,
        include: {
          interviewType: true,
          bishopricMember: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  const calendarConnection = await prisma.calendarConnection.findUnique({
    where: { userId },
  });

  const stats = {
    bishopricMembers: ward?.bishopricMembers.filter((m) => m.isActive).length || 0,
    interviewTypes: ward?.interviewTypes.length || 0,
    upcomingAppointments: ward?.appointments.length || 0,
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard - {ward?.name || "Loading..."}
        </h2>
        <p className="text-gray-600">
          {ward?.stake && `${ward.stake}`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bishopric Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.bishopricMembers}
            </div>
            <Link
              href="/admin/bishopric"
              className="text-sm text-blue-600 hover:underline"
            >
              Manage
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interview Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.interviewTypes}
            </div>
            <Link
              href="/admin/interviews"
              className="text-sm text-blue-600 hover:underline"
            >
              Manage
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {stats.upcomingAppointments}
            </div>
            <Link
              href="/admin/appointments"
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar Connection</CardTitle>
          </CardHeader>
          <CardContent>
            {calendarConnection ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Provider:</span>
                  <span className="text-sm font-medium">
                    {calendarConnection.provider}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium">
                    {calendarConnection.email}
                  </span>
                </div>
                <Link
                  href="/admin/calendar"
                  className="inline-block mt-4 text-sm text-blue-600 hover:underline"
                >
                  Manage Connection
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your calendar to sync appointments
                </p>
                <Link
                  href="/admin/calendar"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Connect Calendar
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {ward?.appointments && ward.appointments.length > 0 ? (
              <div className="space-y-3">
                {ward.appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-start justify-between border-b border-gray-100 pb-2"
                  >
                    <div>
                      <div className="text-sm font-medium">{apt.memberName}</div>
                      <div className="text-xs text-gray-500">
                        {apt.interviewType.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(apt.startTime).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(apt.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No upcoming appointments</p>
            )}
          </CardContent>
        </Card>
      </div>

      {!ward && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Setup Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              You need to set up your ward before you can start scheduling appointments.
            </p>
            <Link
              href="/admin/ward"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Set Up Ward
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
