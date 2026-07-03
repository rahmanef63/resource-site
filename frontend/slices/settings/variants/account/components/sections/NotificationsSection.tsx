"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { SettingsNotifications } from "../../lib/adapter";

type NotifKey = keyof SettingsNotifications;

const ROWS: { key: NotifKey; label: string; description: string }[] = [
  {
    key: "emailDigest",
    label: "Email digest",
    description: "A weekly summary of activity delivered to your inbox.",
  },
  {
    key: "productUpdates",
    label: "Product updates",
    description: "News about new features and improvements.",
  },
  {
    key: "mentions",
    label: "Mentions",
    description: "Get notified when someone @-mentions you.",
  },
  {
    key: "sms",
    label: "SMS alerts",
    description: "Critical alerts sent as text messages.",
  },
];

export interface NotificationsSectionProps {
  value: SettingsNotifications;
  saving?: boolean;
  /** Each toggle persists immediately via a single-field patch. */
  onToggle: (patch: Partial<SettingsNotifications>) => void | Promise<void>;
}

export function NotificationsSection({
  value,
  saving,
  onToggle,
}: NotificationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what reaches you and how.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {ROWS.map((row, i) => (
          <React.Fragment key={row.key}>
            {i > 0 ? <Separator className="my-1" /> : null}
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="space-y-0.5">
                <Label htmlFor={`sp-notif-${row.key}`}>{row.label}</Label>
                <p className="text-sm text-muted-foreground">{row.description}</p>
              </div>
              <Switch
                id={`sp-notif-${row.key}`}
                checked={value[row.key]}
                disabled={saving}
                onCheckedChange={(checked) => onToggle({ [row.key]: checked })}
              />
            </div>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
}
