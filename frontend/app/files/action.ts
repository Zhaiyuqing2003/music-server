'use server';
import fs from 'fs/promises'

export type FileInfo = Awaited<ReturnType<typeof fetchFiles>>[number]
export async function fetchFiles(path: string) {
    // no handling for errors
    const stat = await fs.stat(path);
    if (!stat.isDirectory()) {
        throw new Error(`Path ${path} is not a directory`);
    }

    const files = await fs.readdir(path);

    return Promise.all(files.map(async (file) => {
        const filePath = `${path}/${file}`;
        const fileStat = await fs.stat(filePath);
        return {
            name: file,
            path: `${path}/${file}`,
            isDirectory: fileStat.isDirectory(),
        }
    }))
}