import { Settings } from "lucide-react";
import { isDatabaseConfigured } from "@/db";
import { requireCurrentDbUser } from "@/lib/auth-user";
import { getNotificationPreferences } from "@/lib/notification-preferences";
import {
  updateProfileAction,
  updateNotificationPreferencesAction
} from "@/app/settings/actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | RAFA OS",
  description: "Profile, notification preferences, and configuration."
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireCurrentDbUser();
  const prefs = await getNotificationPreferences(user.id);

  const hasDb = isDatabaseConfigured();

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-stone-500">
            Settings
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">Settings</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">
            Manage your profile, workspace configuration, and preferences.
          </p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-white">
          <Settings size={22} strokeWidth={2} />
        </div>
      </div>

      <div className="grid gap-6">
        <ProfileSection
          isDatabaseConfigured={hasDb}
          user={user}
        />

        <NotificationPreferencesSection
          isDatabaseConfigured={hasDb}
          prefs={prefs}
        />

        <DatabaseSection
          isDatabaseConfigured={hasDb}
        />
      </div>
    </section>
  );
}

function ProfileSection({
  isDatabaseConfigured,
  user
}: {
  isDatabaseConfigured: boolean;
  user: { id: string; name: string | null; email: string | null } | null;
}) {
  return (
    <section className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-stone-950">Profile</h3>
        <p className="mt-1 text-sm text-stone-600">
          Your name and email are used across the system.
        </p>
      </div>

      <form action={updateProfileAction} className="grid gap-4 sm:max-w-lg">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-700">Name</span>
          <input
            className="h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
            defaultValue={user?.name ?? ""}
            disabled={!isDatabaseConfigured}
            name="name"
            placeholder="Your display name"
            required
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-stone-700">Email</span>
          <input
            className="h-10 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-800 outline-none transition focus:border-stone-400 focus:bg-white"
            defaultValue={user?.email ?? ""}
            disabled={!isDatabaseConfigured}
            name="email"
            placeholder="email@example.com"
            required
            type="email"
          />
        </label>
        <div>
          <button
            className="inline-flex h-10 items-center justify-center rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={!isDatabaseConfigured}
            type="submit"
          >
            Save Profile
          </button>
        </div>
      </form>
    </section>
  );
}

function NotificationPreferencesSection({
  isDatabaseConfigured,
  prefs
}: {
  isDatabaseConfigured: boolean;
  prefs: {
    emailNotifications: number;
    pushNotifications: number;
    dailyDigest: number;
    notifyOnMemorySuggestions: number;
    notifyOnTaskReminders: number;
    notifyOnProjectUpdates: number;
  } | null;
}) {
  return (
    <section className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-stone-950">
          Notification Preferences
        </h3>
        <p className="mt-1 text-sm text-stone-600">
          Control which notifications you receive and how.
        </p>
      </div>

      <form action={updateNotificationPreferencesAction} className="grid gap-4 sm:max-w-lg">
        <ToggleField
          defaultChecked={prefs?.emailNotifications === 1}
          disabled={!isDatabaseConfigured}
          label="Email notifications"
          name="emailNotifications"
        />
        <ToggleField
          defaultChecked={prefs?.pushNotifications === 1}
          disabled={!isDatabaseConfigured}
          label="Push notifications"
          name="pushNotifications"
        />
        <ToggleField
          defaultChecked={prefs?.dailyDigest === 1}
          disabled={!isDatabaseConfigured}
          label="Daily digest"
          name="dailyDigest"
        />
        <ToggleField
          defaultChecked={prefs?.notifyOnMemorySuggestions === 1}
          disabled={!isDatabaseConfigured}
          label="Memory suggestions"
          name="notifyOnMemorySuggestions"
        />
        <ToggleField
          defaultChecked={prefs?.notifyOnTaskReminders === 1}
          disabled={!isDatabaseConfigured}
          label="Task reminders"
          name="notifyOnTaskReminders"
        />
        <ToggleField
          defaultChecked={prefs?.notifyOnProjectUpdates === 1}
          disabled={!isDatabaseConfigured}
          label="Project updates"
          name="notifyOnProjectUpdates"
        />
        <div>
          <button
            className="inline-flex h-10 items-center justify-center rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={!isDatabaseConfigured}
            type="submit"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </section>
  );
}

function ToggleField({
  defaultChecked,
  disabled,
  label,
  name
}: {
  defaultChecked: boolean;
  disabled: boolean;
  label: string;
  name: string;
}) {
  return (
    <label className="flex items-center gap-3">
      <input
        className="size-4 rounded border-stone-300 text-stone-950 focus:ring-0"
        defaultChecked={defaultChecked}
        disabled={disabled}
        name={name}
        type="checkbox"
      />
      <span className="text-sm font-medium text-stone-700">{label}</span>
    </label>
  );
}

function DatabaseSection({
  isDatabaseConfigured
}: {
  isDatabaseConfigured: boolean;
}) {
  return (
    <section className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-stone-950">Database</h3>
        <p className="mt-1 text-sm text-stone-600">
          Current connection status for PostgreSQL.
        </p>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-stone-100 bg-stone-50/60 p-3 sm:p-4">
        <div
          className={`size-3 rounded-full ${isDatabaseConfigured ? "bg-emerald-500" : "bg-amber-500"}`}
        />
        <div>
          <p className="text-sm font-medium text-stone-800">
            {isDatabaseConfigured ? "Connected" : "Not connected"}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {isDatabaseConfigured
              ? "PostgreSQL is configured and connected."
              : "Set DATABASE_URL to enable database. Running in V1 local workspace mode."}
          </p>
        </div>
      </div>
    </section>
  );
}
