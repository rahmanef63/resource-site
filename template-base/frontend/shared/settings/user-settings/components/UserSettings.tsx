import { useState, useEffect } from "react";
import { useCurrentUser, useUpdateProfile } from "../api";
import { Save, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FeatureHeader } from "@/frontend/shared/ui/layout/header";
import { PageContainer } from "@/frontend/shared/ui/layout/container";

export interface UserSettingsFormData {
  name: string
  email: string
  bio: string
}

export interface UserSettingsPresenterProps {
  formData: UserSettingsFormData
  onFormDataChange: (next: UserSettingsFormData) => void
  onSave: () => void | Promise<void>
  isLoading: boolean
}

export function UserSettingsPresenter({
  formData,
  onFormDataChange,
  onSave,
  isLoading,
}: UserSettingsPresenterProps) {
  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={User}
        title="Profile Settings"
        subtitle="Manage your personal information and preferences"
        primaryAction={{
          label: isLoading ? "Saving..." : "Save Changes",
          icon: Save,
          onClick: () => onSave(),
          disabled: isLoading,
        }}
      />

      <div className="flex-1 overflow-auto">
        <PageContainer maxWidth="2xl" padding>
          <form onSubmit={(e) => { e.preventDefault(); onSave() }} className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    placeholder="Tell us about yourself..."
                    value={formData.bio}
                    onChange={(e) => onFormDataChange({ ...formData, bio: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </form>
        </PageContainer>
      </div>
    </div>
  );
}

export function UserSettings() {
  const currentUser = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState<UserSettingsFormData>({
    name: "",
    email: "",
    bio: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ name: formData.name, bio: formData.bio });
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <PageContainer centered>
        <div className="text-muted-foreground">Loading...</div>
      </PageContainer>
    );
  }

  return (
    <UserSettingsPresenter
      formData={formData}
      onFormDataChange={setFormData}
      onSave={handleSave}
      isLoading={isLoading}
    />
  );
}
