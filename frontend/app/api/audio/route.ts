import { statSync, createReadStream } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import config from "./../../serverConfig.json";

const dirPath = config.dirPath;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filePath = searchParams.get('audiodir')

  let checkedPath = '';
  const iArr = dirPath.split('/').slice(1);
  try {
    filePath
      ?.split('/')
      .splice(1)
      .forEach((e) => {
        console.log("e:", e, "iarr", iArr, "url=", checkedPath)
        if (iArr.length != 0) {
          if (iArr[0] === e) { checkedPath += "/" + e; iArr.shift(); }
          else { throw new Error("Unexpected error occurred") }
        }
        else {
          if (e !== "..") { checkedPath += "/" + e }
          else { throw new Error("Dangerous directory string") }
        }
      })
  }
  catch (error) {
    console.log(error);
  }

  //const file = join(dirPath + "/(01) [Nakarin] ten days/(01) [Nakarin] one realm.flac");
  const file = checkedPath;
  const stat = statSync(file);
  const range = req.headers.get("range");

  if (!range) {
    return new NextResponse(createReadStream(file) as any, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(stat.size),
      },
    });
  }

  const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
  const start = Number(startStr);
  const end = endStr ? Number(endStr) : stat.size - 1;

  const stream = createReadStream(file, { start, end });

  return new NextResponse(stream as any, {
    status: 206,
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": String(end - start + 1),
    },
  });
}
