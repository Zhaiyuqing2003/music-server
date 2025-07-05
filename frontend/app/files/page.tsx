'use client';
import { fetchFiles, FileInfo } from "./action";
import { useState, useLayoutEffect } from "react";

const path = '/home/yuqing/External/Archive/TOUHOU_MUSIC/'

export default function Page() {
    const [files, setFiles] = useState<FileInfo[]>([]);

    useLayoutEffect(() => {
        fetchFiles(path).then((data) => {
            setFiles(data);
        }).catch((error) => {
            console.error("Error fetching files:", error);
            setFiles([]);
        })
    }, [])

    const openFile = (file: FileInfo) => {
        fetchFiles(file.path).then((data) => {
            setFiles(data);
        }).catch((error) => {
            console.error("Error opening file:", error);
        });
    }

    const downloadFile = (file: FileInfo) => {
        const url = `/api/download/${encodeURIComponent(file.path)}`;
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    return (<div>
        { files.map((file, index) => <div key={index} className="p-2">
            <div className="flex gap-2 justify-between">
                <span>{ file.name }</span>
                { file.isDirectory 
                    ? <button onClick = {() => openFile(file)}> open </button>
                    : <button onClick = {() => downloadFile(file)}> download </button>
                }
            </div>
        </div>)}

    </div>)
}