import React, { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import {
    uploadImageToCloudinary,
    isCloudinaryConfigured,
    MAX_IMAGE_SIZE_MB,
} from "../../lib/cloudinary";

interface ImageUploaderProps {
    value?: string; // URL gambar saat ini (Cloudinary)
    onChange: (url: string) => void;
    label?: string;
    heightClass?: string; // mis. "h-40"
}

/**
 * Komponen upload gambar reusable.
 * Upload langsung ke Cloudinary (unsigned preset), hasil URL dikirim via onChange.
 */
export default function ImageUploader({
    value,
    onChange,
    label = "Gambar",
    heightClass = "h-48",
}: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = async (file: File) => {
        setError(null);
        setUploading(true);
        setProgress(0);
        try {
            const result = await uploadImageToCloudinary(file, setProgress);
            onChange(result.url);
        } catch (err: any) {
            setError(err?.message || "Upload gagal. Coba lagi.");
        } finally {
            setUploading(false);
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = ""; // reset agar file sama bisa dipilih ulang
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {!isCloudinaryConfigured() && (
                <div className="mb-2 text-xs bg-amber-50 border border-amber-300 text-amber-800 rounded-lg p-2">
                    ⚠️ Cloudinary belum dikonfigurasi. Isi{" "}
                    <code>VITE_CLOUDINARY_CLOUD_NAME</code> dan{" "}
                    <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> di <code>.env.local</code>
                </div>
            )}

            {value ? (
                // Preview gambar yang sudah terupload
                <div
                    className={`relative w-full ${heightClass} rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100 group`}
                >
                    <img
                        src={value}
                        alt="Preview"
                        className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="px-3 py-2 bg-white text-gray-900 rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-gray-100"
                        >
                            <Upload size={14} /> Ganti
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-red-700"
                        >
                            <X size={14} /> Hapus
                        </button>
                    </div>
                </div>
            ) : (
                // Area drop / klik untuk upload
                <div
                    onClick={() => !uploading && inputRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={`w-full ${heightClass} rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${dragOver
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
                        }`}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2 w-full px-8">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-sm text-gray-600 font-medium">
                                Mengupload... {progress}%
                            </p>
                            <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-200"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 font-medium">
                                Klik atau tarik gambar ke sini
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                JPG, PNG, WebP, GIF (maks. {MAX_IMAGE_SIZE_MB}MB)
                            </p>
                        </>
                    )}
                </div>
            )}

            {error && (
                <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                    ❌ {error}
                </p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={onInputChange}
            />
        </div>
    );
}

