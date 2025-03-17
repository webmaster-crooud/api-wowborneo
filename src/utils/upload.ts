import path from "path";
import { promises as fs } from "fs";

export const saveFileToStorage = async (fileBuffer: Buffer, filename: string): Promise<string> => {
	const uploadDir = path.join(__dirname, "../../public/uploads");
	const source = path.join(uploadDir, filename);

	// Pastikan folder uploads ada
	try {
		await fs.access(uploadDir);
	} catch (err) {
		await fs.mkdir(uploadDir, { recursive: true });
	}

	await fs.writeFile(source, fileBuffer);
	return source;
};

/**
 * Menghapus file fisik dari storage
 */
export const deleteFileFromStorage = async (source: string): Promise<void> => {
	try {
		await fs.unlink(source);
		console.log(`File ${source} successfully deleting from storage.`);
	} catch (error) {
		console.error(`Oppss... Error deleted file ${source}:`, error);
	}
};
