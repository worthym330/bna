"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getGoogleAuthUrl, uploadAssetAction, disconnectDriveAction } from "@/app/actions/drive";

type DocumentAsset = {
  id: string;
  name: string;
  type: string;
};

import { toast } from "sonner";

export function SettingsClient({
  isDriveConnected,
  assets
}: {
  isDriveConnected: boolean;
  assets: DocumentAsset[];
}) {
  const [loading, setLoading] = useState(false);

  async function handleConnectDrive() {
    setLoading(true);
    try {
      const url = await getGoogleAuthUrl();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect to Google Drive");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnectDrive() {
    if (!confirm("Are you sure you want to disconnect Google Drive? This will prevent generating new invoices until reconnected.")) return;
    setLoading(true);
    try {
      await disconnectDriveAction();
      toast.success("Disconnected Google Drive");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error(error);
      toast.error("Failed to disconnect from Google Drive");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, assetType: "LETTERHEAD" | "SIGNATURE" | "STAMP") {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadAssetAction(formData, assetType);
      toast.success(`${assetType} uploaded successfully!`);
      // Short delay before reload so toast can be seen
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to upload ${assetType}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Integrations Section */}
      <section className="space-y-4 bg-white p-6 rounded-md border shadow-sm">
        <h2 className="text-xl font-semibold">Integrations</h2>
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-medium">Google Drive</h3>
            <p className="text-sm text-slate-500">
              Connect Google Drive to automatically store generated invoices, letterheads, and stamps.
            </p>
          </div>
          <div>
            {isDriveConnected ? (
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  Connected
                </span>
                <Button variant="destructive" size="sm" onClick={handleDisconnectDrive} disabled={loading}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={handleConnectDrive} disabled={loading}>
                {loading ? "Connecting..." : "Connect Drive"}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Assets Section */}
      <section className="space-y-4 bg-white p-6 rounded-md border shadow-sm opacity-50 transition-opacity" style={{ opacity: isDriveConnected ? 1 : 0.5 }}>
        <h2 className="text-xl font-semibold">Brand Assets</h2>
        <p className="text-sm text-slate-500 mb-4">
          Upload your organization's letterhead, stamp, and signature. These will be securely stored in your Google Drive and embedded into PDF invoices.
        </p>

        {!isDriveConnected && (
          <div className="p-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md mb-4">
            You must connect Google Drive before uploading assets.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AssetUploadCard
            title="Letterhead"
            type="LETTERHEAD"
            disabled={!isDriveConnected || loading}
            onUpload={handleFileUpload}
            uploadedAsset={assets.find(a => a.type === "LETTERHEAD")}
          />
          <AssetUploadCard
            title="Authorized Signature"
            type="SIGNATURE"
            disabled={!isDriveConnected || loading}
            onUpload={handleFileUpload}
            uploadedAsset={assets.find(a => a.type === "SIGNATURE")}
          />
          <AssetUploadCard
            title="Company Stamp"
            type="STAMP"
            disabled={!isDriveConnected || loading}
            onUpload={handleFileUpload}
            uploadedAsset={assets.find(a => a.type === "STAMP")}
          />
        </div>
      </section>
    </div>
  );
}

function AssetUploadCard({
  title,
  type,
  disabled,
  onUpload,
  uploadedAsset
}: {
  title: string;
  type: "LETTERHEAD" | "SIGNATURE" | "STAMP";
  disabled: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "LETTERHEAD" | "SIGNATURE" | "STAMP") => void;
  uploadedAsset?: DocumentAsset;
}) {
  return (
    <div className="border rounded-md p-4 text-center space-y-4">
      <h3 className="font-medium text-slate-700">{title}</h3>

      {uploadedAsset ? (
        <div className="flex flex-col items-center gap-3">
          {uploadedAsset.type.includes("image") || uploadedAsset.name.match(/\.(jpeg|jpg|gif|png)$/i) ? (
            <div className="w-full h-32 relative border rounded-md overflow-hidden bg-slate-50 flex items-center justify-center">
              {/* Using native img to stream directly from our new route */}
              <img 
                src={`/api/assets/${uploadedAsset.id}`} 
                alt={title} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="p-3 w-full bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 break-all">
              📄 {uploadedAsset.name}
            </div>
          )}
          <div className="text-xs text-green-700 font-medium">✓ Uploaded successfully</div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-md text-sm text-slate-500">
          No file uploaded
        </div>
      )}

      <div>
        <input
          type="file"
          id={`upload-${type}`}
          className="hidden"
          disabled={disabled}
          onChange={(e) => onUpload(e, type)}
          accept="image/*,application/pdf"
        />
        <label 
          htmlFor={disabled ? undefined : `upload-${type}`} 
          className={buttonVariants({ variant: "outline", size: "sm", className: "w-full cursor-pointer" })}
          style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto" }}
        >
          {uploadedAsset ? "Replace File" : "Upload File"}
        </label>
      </div>
    </div>
  );
}
