'use client';
import { fetchFiles, FileInfo } from "./action";
import { useState, useLayoutEffect } from "react";
import DirSVG from "./dirsvg";

const path = '/home/yuqing/External/Archive/TOUHOU_MUSIC'
// const path = '/Users/weizifeng/Desktop/music'

export default function Page() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [directory, setDirectory] = useState<Array<string>>(path.split('/').slice(1));

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
      setDirectory(file.path.split("/").slice(1))
    }).catch((error) => {
      console.error("Error opening file:", error);
    });
  }

  const openDirectory = (dirprop: string) => {
    let dir = ""
    for (let i in directory) {
      if (directory[i] != dirprop) { dir += "/" + directory[i];}
      else {
        dir += "/" + directory[i];
        break;
      }
    }
    fetchFiles(dir).then((data) => {
      setFiles(data);
      setDirectory(dir.split("/").slice(1))
    }).catch((error) => {
      console.error("Error opening file:", error);
    });
  }

  const downloadFile = (file: FileInfo) => {
    const url = `/api/download?path=${encodeURIComponent(file.path)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div>
      <div className="navbar ml-12">
        <div className="breadcrumbs text-sm"><ul>
          {directory.map((dir) =>
            <li id={dir} key={dir}>
              <a onClick={() => openDirectory(dir)}>
                <DirSVG></DirSVG>
                {dir}
              </a>
            </li>
          )}
        </ul></div>
      </div>
      <ul className="list bg-base-100 rounded-box shadow-md mx-12 p-4">
        {files.map((file, index) =>
          <li key={index} className="list-row">
            <div className="w-0 h-0"></div>
            <div key={index} className="flex gap-2 justify-between">
              <div>
                <span>{file.name}</span>
                {file.name.split('.').pop() == 'jpg' || file.name.split('.').pop() == 'png' ?
                  (<div className="badge badge-sm badge-soft badge-success mx-2 ">Image</div>)
                  : file.name.split('.').pop() == 'flac' || file.name.split('.').pop() == 'wav' ?
                  (<div className="badge badge-sm badge-soft badge-primary mx-2 ">Audio</div>) : <></>
                }
              </div>
              <div>
                { file.name.split('.').pop() == 'flac' || file.name.split('.').pop() == 'wav' ?
                  (<button className="btn btn-xs btn-soft btn-info  mx-2 " onClick={() => {console.log(file.path)}}>Play</button>) : <></>
                  //TODO:Jump to audio play
                }
                {file.isDirectory
                  ? <button className="btn btn-xs btn-outline " onClick={() => openFile(file)}> open </button>
                  : <button className="btn btn-xs btn-outline " onClick={() => downloadFile(file)}> download </button>
                }
              </div>
            </div>
          </li>
        )}
      </ul>
    </div>
  )
}