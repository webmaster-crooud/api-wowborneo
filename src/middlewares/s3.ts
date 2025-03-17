import multer from "multer";
import { S3Client, PutObjectCommand, ObjectCannedACL, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../configs/env";

// Konfigurasi AWS S3 untuk idCloudHost
const s3Client = new S3Client({
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY,
		secretAccessKey: env.S3_SECRET_KEY,
	},
	endpoint: env.S3_ENDPOINT,
	forcePathStyle: true, // Diperlukan untuk beberapa S3-compatible storage
	region: env.S3_REGION,
});

// Custom storage engine untuk multer yang menyimpan ke idCloudHost
export const S3 = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024, // Batasi ukuran file (5MB)
	},
	fileFilter: (req, file, cb) => {
		// Filter file berdasarkan tipe
		if (file.mimetype.startsWith("image/")) {
			cb(null, true);
		} else {
			cb(new Error("Hanya file gambar yang diperbolehkan") as any, false);
		}
	},
});

// Fungsi untuk mengunggah file ke idCloudHost
export async function uploadS3(file: Express.Multer.File, folderPath: string = ""): Promise<string> {
	const timestamp = Date.now();
	const fileName = `${folderPath}/${timestamp}-${file.originalname.replace(/\s+/g, "-")}`;

	const params = {
		Bucket: env.S3_BUCKET_NAME,
		Key: fileName,
		Body: file.buffer,
		ContentType: file.mimetype,
		// Atur akses publik jika diperlukan
		ACL: "public-read" as ObjectCannedACL,
	};

	// Membuat perintah upload
	const command = new PutObjectCommand(params);
	await s3Client.send(command);

	// Kembalikan URL lengkap (Anda bisa menyusun URL sesuai endpoint dan bucket Anda)
	return `${env.S3_ENDPOINT}/${env.S3_BUCKET_NAME}/${fileName}`;
}
export async function deleteS3(sourceUrl: string): Promise<void> {
	const key = extractKeyFromUrl(sourceUrl);

	const params = {
		Bucket: env.S3_BUCKET_NAME,
		Key: key,
	};

	const command = new DeleteObjectCommand(params);
	await s3Client.send(command);
}

// Helper untuk ekstrak key dari URL
function extractKeyFromUrl(url: string): string {
	const baseUrl = `${env.S3_ENDPOINT}/${env.S3_BUCKET_NAME}/`;
	return url.replace(baseUrl, "");
}
