"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchConnection();
  }, []);

  const fetchConnection = async () => {
    try {
      const response = await fetch("/api/calendar");
      if (response.ok) {
        const data = await response.json();
        setConnection(data);
      }
    } catch (error) {
      console.error("Error fetching connection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: "Google" | "Office365") => {
    setConnecting(true);
    try {
      const response = await fetch("/api/calendar/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Aurinko OAuth
        window.location.href = data.authUrl;
      } else {
        alert("Failed to connect calendar");
        setConnecting(false);
      }
    } catch (error) {
      console.error("Error connecting calendar:", error);
      alert("Failed to connect calendar");
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your calendar?")) {
      return;
    }

    try {
      const response = await fetch("/api/calendar/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        setConnection(null);
        alert("Calendar disconnected successfully");
      } else {
        alert("Failed to disconnect calendar");
      }
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      alert("Failed to disconnect calendar");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar Connection</CardTitle>
          <CardDescription>
            Connect your Google or Microsoft calendar to sync appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connection ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">Connected</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {connection.provider}
                  </span>
                </div>
                <div className="text-sm text-green-700">
                  <p>Email: {connection.email}</p>
                  {connection.lastSyncedAt && (
                    <p className="mt-1">
                      Last synced: {new Date(connection.lastSyncedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleDisconnect} variant="destructive">
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Connect your calendar to enable appointment syncing. Your calendar events
                will be used to determine availability for interviews.
              </p>

              <div className="flex gap-4">
                <Button
                  onClick={() => handleConnect("Google")}
                  disabled={connecting}
                  className="flex-1"
                >
                  {connecting ? "Connecting..." : "Connect Google Calendar"}
                </Button>

                <Button
                  onClick={() => handleConnect("Office365")}
                  disabled={connecting}
                  variant="outline"
                  className="flex-1"
                >
                  {connecting ? "Connecting..." : "Connect Outlook Calendar"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">For Bishopric Members:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Connect your calendar using the button above</li>
              <li>
                Create recurring or one-time events in your calendar with the title
                "INTERVIEW-AVAIL" (or custom code set by your executive secretary)
              </li>
              <li>
                The app will automatically detect these events as available time slots
              </li>
              <li>
                When a member books an appointment, it will be created in your calendar
                as a busy event
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-1">For Executive Secretary:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Connect your calendar to see all ward appointments</li>
              <li>
                Appointments will appear as free events (visible but don't block your time)
              </li>
              <li>You can manage and monitor all scheduled interviews</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="font-medium text-blue-900 mb-1">Privacy & Security</p>
            <p className="text-blue-700">
              Only events with your availability code are read by the app. Your other
              calendar events remain private. Calendar access can be revoked at any time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
