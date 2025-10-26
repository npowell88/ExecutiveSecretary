"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function WardSettingsPage() {
  const [ward, setWard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    stake: "",
  });

  useEffect(() => {
    fetchWard();
  }, []);

  const fetchWard = async () => {
    try {
      const response = await fetch("/api/ward");
      if (response.ok) {
        const data = await response.json();
        setWard(data);
        setFormData({
          name: data.name || "",
          stake: data.stake || "",
        });
      }
    } catch (error) {
      console.error("Error fetching ward:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/ward", {
        method: ward ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setWard(data);
        alert("Ward settings saved successfully!");
      } else {
        alert("Failed to save ward settings");
      }
    } catch (error) {
      console.error("Error saving ward:", error);
      alert("Failed to save ward settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <Card>
        <CardHeader>
          <CardTitle>Ward Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ward Name
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Oak Hills Ward"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stake Name
              </label>
              <Input
                type="text"
                value={formData.stake}
                onChange={(e) =>
                  setFormData({ ...formData, stake: e.target.value })
                }
                placeholder="e.g., Bountiful Utah North Stake"
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {ward && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Public Scheduling URL</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">
              Share this link with ward members so they can schedule interviews:
            </p>
            <div className="flex gap-2">
              <Input
                type="text"
                value={`${window.location.origin}/schedule?ward=${ward.id}`}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/schedule?ward=${ward.id}`
                  );
                  alert("Link copied to clipboard!");
                }}
              >
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
