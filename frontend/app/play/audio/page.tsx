'use client'
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PauseSVG, PlaySVG } from "./audiosvg";

const dirPath = "/Users/weizifeng/Desktop/music";//TODO:Get Cover

export default function PlayAudio({ searchParams }: { searchParams: { [audio: string]: string | string[] | undefined } }) {
  const audio = useRef<HTMLAudioElement>(null);
  const params = useSearchParams();

  const coverURL = dirPath + "/(01) [Nakarin] ten days/folder.jpg";//TODO:Get Cover
  const [ctx, setCtx] = useState<AudioContext | null>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audioElement = audio.current!;
    audioElement.src = "/api/audio?audiodir=" + params.get('audio');
    const onLoaded = () => setDur(audioElement.duration || 0);
    const onTime = () => setCur(audioElement.currentTime);
    audioElement.addEventListener("loadedmetadata", onLoaded);
    audioElement.addEventListener("timeupdate", onTime);
    return () => {
      audioElement.removeEventListener("loadedmetadata", onLoaded);
      audioElement.removeEventListener("timeupdate", onTime);
    };
  }, [params]);

  const toggle = async () => {
    const audioElement = audio.current!;
    if (!ctx) {
      const newCtx = new AudioContext();
      setCtx(newCtx);
    }
    if (ctx?.state === "suspended") {
      await ctx.resume();
    }
    try {
      if (audioElement.paused) {
        await audioElement.play();
        setPlaying(true);
      } else {
        audioElement.pause();
        setPlaying(false);
      }
    } catch (err) {
      console.error("Play Error:", err);
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    audio.current!.currentTime = t;
    setCur(t);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    audio.current!.volume = vol;
    setVolume(vol);
  };

  function format(sec = 0) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div className="w-full fixed bottom-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-xl">
      <div className="container mx-auto flex items-center justify-between p-4 h-24">
        <div className="flex items-center space-x-4">
          <img
            src={coverURL}
            alt="album cover"
            className="w-16 h-16 object-cover rounded-lg shadow-md"
          />
          <div>
            <h3 className="text-lg font-semibold">{params.get('audio')?.split('/').pop()}</h3>
            <p className="text-sm opacity-70">Artist Name</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center space-y-2 z-10">
          <div className="flex items-center space-x-4">
            <button className="btn btn-circle btn-ghost" onClick={toggle}>
              {/* TODO: className好像覆盖不了，咋搞？ */}
              {playing ? (
                <PauseSVG color="#FFFFFF" className="w-6 h-6" />
              ) : (
                <PlaySVG color="#FFFFFF" className="w-6 h-6" />
              )}
            </button>
          </div>
          <div className="w-full max-w-md flex items-center space-x-2">
            <span className="text-sm">{format(cur)}</span>
            <input
              type="range"
              min={0}
              max={dur || 0}
              value={cur}
              step="0.01"
              onChange={seek}
              className="range range-primary range-xs"
            />
            <span className="text-sm">{format(dur)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.22 2.5-3.97z" />
          </svg>
          <input
            type="range"
            min={0}
            max={1}
            step="0.01"
            value={volume}
            onChange={changeVolume}
            className="range range-primary range-xs w-24"
          />
        </div>

        <audio ref={audio} style={{ display: "none" }} />
      </div>
    </div>
  );
}