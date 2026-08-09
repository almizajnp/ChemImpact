// ============ CLOUDINARY UPLOAD UTILITY ============
// Upload gambar langsung dari browser ke Cloudinary menggunakan
// UNSIGNED UPLOAD PRESET (tidak butuh backend/API secret).
//
// Setup di Cloudinary Console (https://console.cloudinary.com):
// 1. Settings -> Upload -> Upload presets -> Add upload preset
// 2. Signing Mode: "Unsigned"
// 3. (Disarankan) Set folder khusus, mis. "chemimpact", dan batasi format ke image
// 4. Salin "Cloud name" dan nama preset ke file .env.local:
//    VITE_CLOUDINARY_CLOUD_NAME=xxxx
//    VITE_CLOUDINARY_UPLOAD_PRESET=xxxx

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as
    | string
    | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as
    | string
    | undefined;

export const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const isCloudinaryConfigured = (): boolean =>
    Boolean(CLOUD_NAME && UPLOAD_PRESET);

export interface CloudinaryUploadResult {
    url: string; // secure_url yang disimpan ke Realtime Database
    publicId: string;
    width: number;
    height: number;
}

/**
 * Upload satu file gambar ke Cloudinary.
 * Mengembalikan secure_url (https) yang siap disimpan ke database.
 */
export const uploadImageToCloudinary = (
    file: File,
    onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResult> => {
    return new Promise((resolve, reject) => {
        if (!isCloudinaryConfigured()) {
            reject(
                new Error(
                    "Cloudinary belum dikonfigurasi. Isi VITE_CLOUDINARY_CLOUD_NAME dan VITE_CLOUDINARY_UPLOAD_PRESET di .env.local",
                ),
            );
            return;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            reject(
                new Error("Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF."),
            );
            return;
        }

        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            reject(new Error(`Ukuran gambar maksimal ${MAX_IMAGE_SIZE_MB}MB.`));
            return;
        }

        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET!);
        formData.append("folder", "chemimpact");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                onProgress(Math.round((event.loaded / event.total) * 100));
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    resolve({
                        url: data.secure_url,
                        publicId: data.public_id,
                        width: data.width,
                        height: data.height,
                    });
                } catch {
                    reject(new Error("Gagal membaca respons Cloudinary."));
                }
            } else {
                try {
                    const err = JSON.parse(xhr.responseText);
                    reject(
                        new Error(
                            err?.error?.message || `Upload gagal (status ${xhr.status})`,
                        ),
                    );
                } catch {
                    reject(new Error(`Upload gagal (status ${xhr.status})`));
                }
            }
        };

        xhr.onerror = () =>
            reject(new Error("Koneksi ke Cloudinary gagal. Periksa internet Anda."));

        xhr.send(formData);
    });
};

