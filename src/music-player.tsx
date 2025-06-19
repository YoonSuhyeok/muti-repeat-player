import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Plus,
  Trash2,
  Upload,
  Music,
  Info,
  ListMusic,
  Palette,
  Settings2,
} from "lucide-react"
import { parseBlob } from "music-metadata-browser"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Section {
  id: string
  name: string
  startTime: number
  endTime: number
  color: string
}

interface TrackInfo {
  title: string
  artist: string
  album?: string
  albumartist?: string
  genre?: string[]
  year?: number
  track?: {
    no: number | null
    of: number | null
  }
  disk?: {
    no: number | null
    of: number | null
  }
  duration?: number
  bitrate?: number
  sampleRate?: number
  thumbnail: string | null
}

export default function Component() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioFileInputRef = useRef<HTMLInputElement>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>("https://www.soundjay.com/misc/sounds/bell-ringing-05.wav")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [sections, setSections] = useState<Section[]>([])
  const [currentSection, setCurrentSection] = useState<Section | null>(null)
  const [isRepeating, setIsRepeating] = useState(false)
  const [newSectionName, setNewSectionName] = useState("")
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [showMetadata, setShowMetadata] = useState(false)
  const [trackInfo, setTrackInfo] = useState<TrackInfo>({
    title: "샘플 음악",
    artist: "알 수 없는 아티스트",
    thumbnail: null,
  })
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)

  const colorPalette = [
    { name: "Red", bg: "bg-red-500/30", border: "border-red-500/50", solid: "bg-red-500", text: "text-red-500" },
    {
      name: "Orange",
      bg: "bg-orange-500/30",
      border: "border-orange-500/50",
      solid: "bg-orange-500",
      text: "text-orange-500",
    },
    {
      name: "Amber",
      bg: "bg-amber-500/30",
      border: "border-amber-500/50",
      solid: "bg-amber-500",
      text: "text-amber-500",
    },
    {
      name: "Yellow",
      bg: "bg-yellow-500/30",
      border: "border-yellow-500/50",
      solid: "bg-yellow-500",
      text: "text-yellow-500",
    },
    { name: "Lime", bg: "bg-lime-500/30", border: "border-lime-500/50", solid: "bg-lime-500", text: "text-lime-500" },
    {
      name: "Green",
      bg: "bg-green-500/30",
      border: "border-green-500/50",
      solid: "bg-green-500",
      text: "text-green-500",
    },
    {
      name: "Emerald",
      bg: "bg-emerald-500/30",
      border: "border-emerald-500/50",
      solid: "bg-emerald-500",
      text: "text-emerald-500",
    },
    { name: "Teal", bg: "bg-teal-500/30", border: "border-teal-500/50", solid: "bg-teal-500", text: "text-teal-500" },
    { name: "Cyan", bg: "bg-cyan-500/30", border: "border-cyan-500/50", solid: "bg-cyan-500", text: "text-cyan-500" },
    { name: "Sky", bg: "bg-sky-500/30", border: "border-sky-500/50", solid: "bg-sky-500", text: "text-sky-500" },
    { name: "Blue", bg: "bg-blue-500/30", border: "border-blue-500/50", solid: "bg-blue-500", text: "text-blue-500" },
    {
      name: "Indigo",
      bg: "bg-indigo-500/30",
      border: "border-indigo-500/50",
      solid: "bg-indigo-500",
      text: "text-indigo-500",
    },
    {
      name: "Violet",
      bg: "bg-violet-500/30",
      border: "border-violet-500/50",
      solid: "bg-violet-500",
      text: "text-violet-500",
    },
    {
      name: "Purple",
      bg: "bg-purple-500/30",
      border: "border-purple-500/50",
      solid: "bg-purple-500",
      text: "text-purple-500",
    },
    {
      name: "Fuchsia",
      bg: "bg-fuchsia-500/30",
      border: "border-fuchsia-500/50",
      solid: "bg-fuchsia-500",
      text: "text-fuchsia-500",
    },
    { name: "Pink", bg: "bg-pink-500/30", border: "border-pink-500/50", solid: "bg-pink-500", text: "text-pink-500" },
    { name: "Rose", bg: "bg-rose-500/30", border: "border-rose-500/50", solid: "bg-rose-500", text: "text-rose-500" },
  ]

  const extractMetadata = async (file: File) => {
    setIsLoadingMetadata(true)
    setTrackInfo((prev) => ({ ...prev, thumbnail: null }))

    try {
      const metadata = await parseBlob(file)
      const { common, format } = metadata

      let thumbnailUrl = null
      if (common.picture && common.picture.length > 0) {
        const picture = common.picture[0]
        const blob = new Blob([picture.data], { type: picture.format })
        thumbnailUrl = URL.createObjectURL(blob)
      }

      setTrackInfo({
        title: common.title || file.name.replace(/\.[^/.]+$/, ""),
        artist: common.artist || "알 수 없는 아티스트",
        album: common.album || undefined,
        albumartist: common.albumartist || undefined,
        genre: common.genre || undefined,
        year: common.year || undefined,
        track: {
          no: common.track?.no || null,
          of: common.track?.of || null,
        },
        disk: {
          no: common.disk?.no || null,
          of: common.disk?.of || null,
        },
        duration: format.duration || undefined,
        bitrate: format.bitrate || undefined,
        sampleRate: format.sampleRate || undefined,
        thumbnail: thumbnailUrl,
      })
    } catch (error) {
      console.log("메타데이터 추출 실패:", error)
      setTrackInfo((prev) => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "알 수 없는 아티스트",
        album: undefined,
        thumbnail: null,
      }))
    } finally {
      setIsLoadingMetadata(false)
    }
  }

  const handleAudioFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      if (audioFile) {
        URL.revokeObjectURL(audioUrl)
      }
      if (trackInfo.thumbnail && trackInfo.thumbnail.startsWith("blob:")) {
        URL.revokeObjectURL(trackInfo.thumbnail)
      }
      const newUrl = URL.createObjectURL(file)
      setAudioFile(file)
      setAudioUrl(newUrl)
      setSections([])
      setCurrentSection(null)
      setIsRepeating(false)
      setCurrentTime(0)
      if (isPlaying) {
        setIsPlaying(false)
      }
      extractMetadata(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("audio/")) {
        const fakeEvent = {
          target: { files: [file] },
        } as React.ChangeEvent<HTMLInputElement>
        handleAudioFileUpload(fakeEvent)
      }
    }
  }

  useEffect(() => {
    return () => {
      if (audioFile && audioUrl !== "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav") {
        URL.revokeObjectURL(audioUrl)
      }
      if (trackInfo.thumbnail && trackInfo.thumbnail.startsWith("blob:")) {
        URL.revokeObjectURL(trackInfo.thumbnail)
      }
    }
  }, [audioFile, audioUrl, trackInfo.thumbnail])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleAudioEnd)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleAudioEnd)
    }
  }, [])

  useEffect(() => {
    if (currentSection && isRepeating && audioRef.current) {
      if (currentTime >= currentSection.endTime) {
        audioRef.current.currentTime = currentSection.startTime
      }
    }
  }, [currentTime, currentSection, isRepeating])

  const handleAudioEnd = () => {
    if (currentSection && isRepeating) {
      audioRef.current!.currentTime = currentSection.startTime
      audioRef.current!.play()
    } else {
      setIsPlaying(false)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const stop = () => {
    if (!audioRef.current) return

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)
    setCurrentSection(null)
    setIsRepeating(false)
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return

    const newTime = value[0]
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const setCurrentTimeAsStart = () => {
    setStartTime(currentTime)
  }

  const setCurrentTimeAsEnd = () => {
    setEndTime(currentTime)
  }

  const addSection = () => {
    if (!newSectionName.trim() || startTime >= endTime) return

    const colorIndex = sections.length % colorPalette.length
    const newSection: Section = {
      id: Date.now().toString(),
      name: newSectionName,
      startTime,
      endTime,
      color: colorIndex.toString(),
    }

    setSections([...sections, newSection])
    setNewSectionName("")
    setStartTime(0)
    setEndTime(0)
  }

  const deleteSection = (id: string) => {
    setSections(sections.filter((section) => section.id !== id))
    if (currentSection?.id === id) {
      setCurrentSection(null)
      setIsRepeating(false)
    }
  }

  const playSection = (section: Section) => {
    if (!audioRef.current) return

    audioRef.current.currentTime = section.startTime
    setCurrentSection(section)
    setIsRepeating(true)

    if (!isPlaying) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      if (trackInfo.thumbnail && trackInfo.thumbnail.startsWith("blob:")) {
        URL.revokeObjectURL(trackInfo.thumbnail)
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setTrackInfo((prev) => ({
          ...prev,
          thumbnail: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTrackInfoChange = (field: keyof TrackInfo, value: string) => {
    setTrackInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const formatBitrate = (bitrate: number) => {
    return `${Math.round(bitrate / 1000)} kbps`
  }

  const formatSampleRate = (sampleRate: number) => {
    return `${(sampleRate / 1000).toFixed(1)} kHz`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
            구간 반복 마스터
          </h1>
          <p className="text-slate-400 mt-1 sm:mt-2 text-sm sm:text-base">음악의 특정 구간을 마스터하세요.</p>
        </header>

        <Card className="bg-slate-800/70 border-slate-700 shadow-2xl shadow-slate-950/50">
          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* 파일 업로드 영역 */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-600 rounded-lg p-6 sm:p-8 text-center hover:border-slate-500 transition-colors cursor-pointer bg-slate-700/30 hover:bg-slate-700/50"
              onClick={() => audioFileInputRef.current?.click()}
            >
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-center">
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-slate-500" />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-medium text-slate-300">
                    오디오 파일을 여기에 드롭하거나 클릭하세요
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400">MP3, FLAC, WAV 등 지원</p>
                  {!isLoadingMetadata && audioFile && !trackInfo.thumbnail && (
                    <p className="text-xs text-red-400 mt-1">앨범 아트를 찾을 수 없습니다.</p>
                  )}
                </div>
                {audioFile && (
                  <div className="bg-slate-700 p-2 sm:p-3 rounded-md text-left text-xs sm:text-sm">
                    <p className="font-medium text-slate-200">{audioFile.name}</p>
                    <p className="text-slate-400">크기: {(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    {isLoadingMetadata && <p className="text-sky-400 mt-1">메타데이터 분석 중...</p>}
                  </div>
                )}
              </div>
            </div>
            <input
              ref={audioFileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioFileUpload}
              className="hidden"
            />
            <audio ref={audioRef} src={audioUrl} />

            {/* 썸네일 및 트랙 정보 */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center lg:items-start">
              <div className="flex-shrink-0 w-full max-w-xs sm:max-w-sm lg:w-52 mx-auto">
                <div className="relative group aspect-square">
                  <div className="w-full h-full rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center shadow-lg">
                    {isLoadingMetadata ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Settings2 className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500 animate-spin" />
                      </div>
                    ) : trackInfo.thumbnail ? (
                      <img
                        src={trackInfo.thumbnail || "/placeholder.svg"}
                        alt="Album Art"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                        <Music className="w-12 h-12 sm:w-16 sm:h-16 text-slate-500 mb-2" />
                        <p className="text-xs text-slate-400">앨범 아트 없음</p>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center"
                    variant="ghost"
                    size="icon"
                  >
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <span className="sr-only">썸네일 변경</span>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex-1 space-y-3 sm:space-y-4 text-center lg:text-left w-full">
                <div className="space-y-1">
                  <Input
                    value={trackInfo.title}
                    onChange={(e) => handleTrackInfoChange("title", e.target.value)}
                    className="text-xl sm:text-2xl font-bold bg-transparent border-0 border-b-2 border-slate-700 focus:border-pink-500 rounded-none px-1 py-1 sm:py-2 h-auto text-slate-100 placeholder:text-slate-500"
                    placeholder="곡 제목"
                  />
                  <Input
                    value={trackInfo.artist}
                    onChange={(e) => handleTrackInfoChange("artist", e.target.value)}
                    className="text-base sm:text-lg text-slate-400 bg-transparent border-0 border-b-2 border-slate-700 focus:border-pink-500 rounded-none px-1 py-1 sm:py-2 h-auto placeholder:text-slate-500"
                    placeholder="아티스트"
                  />
                  {trackInfo.album && (
                    <Input
                      value={trackInfo.album}
                      onChange={(e) => handleTrackInfoChange("album", e.target.value)}
                      className="text-sm sm:text-md text-slate-500 bg-transparent border-0 border-b-2 border-slate-700 focus:border-pink-500 rounded-none px-1 py-1 sm:py-2 h-auto placeholder:text-slate-500"
                      placeholder="앨범"
                    />
                  )}
                </div>

                <div className="flex items-center justify-center lg:justify-start space-x-2 sm:space-x-3 pt-1 sm:pt-2">
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={togglePlay}
                          size="lg"
                          className="bg-pink-600 hover:bg-pink-700 text-white rounded-full w-12 h-12 sm:w-16 sm:h-16"
                        >
                          {isPlaying ? (
                            <Pause className="w-6 h-6 sm:w-8 sm:h-8" />
                          ) : (
                            <Play className="w-6 h-6 sm:w-8 sm:h-8" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 text-slate-200 border-slate-700">
                        <p>{isPlaying ? "일시정지" : "재생"}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={stop}
                          variant="outline"
                          size="lg"
                          className="border-slate-600 hover:bg-slate-700 hover:text-slate-100 rounded-full w-12 h-12 sm:w-16 sm:h-16"
                        >
                          <Square className="w-5 h-5 sm:w-7 sm:h-7" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 text-slate-200 border-slate-700">
                        <p>정지</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {currentSection && (
                    <Badge
                      variant={isRepeating ? "default" : "secondary"}
                      className={cn(
                        "flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5",
                        isRepeating ? "bg-pink-600 text-white" : "bg-slate-700 text-slate-300",
                      )}
                    >
                      <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                      {currentSection.name} 반복중
                    </Badge>
                  )}
                </div>

                <div className="pt-1 sm:pt-2">
                  <Button
                    onClick={() => setShowMetadata(!showMetadata)}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 text-xs sm:text-sm"
                  >
                    <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                    {showMetadata ? "상세 정보 닫기" : "상세 정보 보기"}
                  </Button>
                </div>
              </div>
            </div>

            {showMetadata && (
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
                  <CardTitle className="text-base sm:text-lg text-slate-200">음악 상세 정보</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-2 sm:gap-y-3">
                    {trackInfo.genre && trackInfo.genre.length > 0 && (
                      <div>
                        <Label className="text-xs text-slate-400">장르</Label>
                        <div className="flex flex-wrap gap-1 mt-0.5 sm:mt-1">
                          {trackInfo.genre.map((g, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-slate-600 text-slate-300 px-1.5 py-0.5"
                            >
                              {g}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {trackInfo.year && (
                      <div>
                        <Label className="text-xs text-slate-400">발매년도</Label>
                        <p className="font-medium text-slate-200">{trackInfo.year}</p>
                      </div>
                    )}
                    {trackInfo.track?.no && (
                      <div>
                        <Label className="text-xs text-slate-400">트랙</Label>
                        <p className="font-medium text-slate-200">
                          {trackInfo.track.no}
                          {trackInfo.track.of && ` / ${trackInfo.track.of}`}
                        </p>
                      </div>
                    )}
                    {trackInfo.disk?.no && (
                      <div>
                        <Label className="text-xs text-slate-400">디스크</Label>
                        <p className="font-medium text-slate-200">
                          {trackInfo.disk.no}
                          {trackInfo.disk.of && ` / ${trackInfo.disk.of}`}
                        </p>
                      </div>
                    )}
                    {trackInfo.albumartist && trackInfo.albumartist !== trackInfo.artist && (
                      <div>
                        <Label className="text-xs text-slate-400">앨범 아티스트</Label>
                        <p className="font-medium text-slate-200">{trackInfo.albumartist}</p>
                      </div>
                    )}
                    {trackInfo.duration && (
                      <div>
                        <Label className="text-xs text-slate-400">재생 시간</Label>
                        <p className="font-medium text-slate-200">{formatDuration(trackInfo.duration)}</p>
                      </div>
                    )}
                    {trackInfo.bitrate && (
                      <div>
                        <Label className="text-xs text-slate-400">비트레이트</Label>
                        <p className="font-medium text-slate-200">{formatBitrate(trackInfo.bitrate)}</p>
                      </div>
                    )}
                    {trackInfo.sampleRate && (
                      <div>
                        <Label className="text-xs text-slate-400">샘플레이트</Label>
                        <p className="font-medium text-slate-200">{formatSampleRate(trackInfo.sampleRate)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 진행 바 */}
            <div className="space-y-1 sm:space-y-2 pt-2 sm:pt-4">
              <div className="relative h-8 sm:h-10">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full absolute top-1/2 -translate-y-1/2 z-10"
                  thumbClassName="w-4 h-4 sm:w-5 sm:h-5 bg-pink-500 border-2 border-slate-900"
                  trackClassName="bg-slate-600 h-2 sm:h-2.5" // 트랙 배경색 어둡게, 두께 증가
                  rangeClassName="bg-pink-500 h-2 sm:h-2.5" // 진행 부분 두께 증가
                />
                {/* 구간 표시 오버레이 */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 sm:h-2.5 rounded-md overflow-hidden pointer-events-none z-20">
                  {sections.map((section) => {
                    if (duration === 0) return null
                    const startPercent = (section.startTime / duration) * 100
                    const widthPercent = ((section.endTime - section.startTime) / duration) * 100
                    const isCurrentSection = currentSection?.id === section.id
                    const colorIndex = Number.parseInt(section.color)
                    const colors = colorPalette[colorIndex % colorPalette.length]

                    return (
                      <TooltipProvider key={section.id} delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "absolute h-full rounded-sm transition-all duration-150 ease-in-out border-y", // 위아래 테두리 추가
                                colors.bg, // 투명도 조정된 배경 사용
                                isCurrentSection
                                  ? `ring-2 ring-offset-2 ring-offset-slate-800 ${colors.border} opacity-100 shadow-md` // 활성 구간 강조
                                  : `${colors.border} opacity-80 hover:opacity-100`,
                              )}
                              style={{
                                left: `${startPercent}%`,
                                width: `${widthPercent}%`,
                              }}
                            >
                              {/* 시작점 마커 */}
                              <div
                                className={cn(
                                  "absolute top-1/2 -translate-y-1/2 -left-0.5 w-1 h-3 sm:h-4 rounded-full shadow-sm", // 마커 크기 및 그림자
                                  colors.solid,
                                )}
                              />
                              {/* 끝점 마커 */}
                              <div
                                className={cn(
                                  "absolute top-1/2 -translate-y-1/2 -right-0.5 w-1 h-3 sm:h-4 rounded-full shadow-sm", // 마커 크기 및 그림자
                                  colors.solid,
                                )}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 text-slate-200 border-slate-700">
                            <p className="font-semibold">{section.name}</p>
                            <p className="text-xs">
                              {formatTime(section.startTime)} - {formatTime(section.endTime)}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* 구간 설정 */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl text-slate-200 flex items-center gap-2">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />새 구간 만들기
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-end">
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label htmlFor="section-name" className="text-xs sm:text-sm text-slate-300">
                      구간 이름
                    </Label>
                    <Input
                      id="section-name"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="예: 기타 솔로, 코러스 1"
                      className="bg-slate-600 border-slate-500 text-slate-100 placeholder:text-slate-400 focus:border-pink-500 text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label className="text-xs sm:text-sm text-slate-300">시간 설정 (현재 재생 시간 기준)</Label>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        onClick={setCurrentTimeAsStart}
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-500 bg-slate-600 hover:bg-slate-500 text-slate-300 hover:text-slate-100 text-xs sm:text-sm"
                      >
                        시작점으로 설정
                      </Button>
                      <Button
                        onClick={setCurrentTimeAsEnd}
                        variant="outline"
                        size="sm"
                        className="w-full border-slate-500 bg-slate-600 hover:bg-slate-500 text-slate-300 hover:text-slate-100 text-xs sm:text-sm"
                      >
                        끝점으로 설정
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label className="text-xs sm:text-sm text-slate-300">시작 시간: {formatTime(startTime)}</Label>
                    <Slider
                      value={[startTime]}
                      max={duration || 100}
                      step={0.1}
                      onValueChange={(value) => setStartTime(value[0])}
                      thumbClassName="bg-pink-500"
                      trackClassName="bg-slate-500"
                      rangeClassName="bg-pink-500"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-1.5">
                    <Label className="text-xs sm:text-sm text-slate-300">끝 시간: {formatTime(endTime)}</Label>
                    <Slider
                      value={[endTime]}
                      max={duration || 100}
                      step={0.1}
                      onValueChange={(value) => setEndTime(value[0])}
                      thumbClassName="bg-pink-500"
                      trackClassName="bg-slate-500"
                      rangeClassName="bg-pink-500"
                    />
                  </div>
                </div>
                <Button
                  onClick={addSection}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white text-sm sm:text-base"
                  disabled={!newSectionName.trim() || startTime >= endTime}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  구간 추가
                </Button>
              </CardContent>
            </Card>

            {/* 구간 목록 */}
            {sections.length > 0 && (
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl text-slate-200 flex items-center gap-2">
                    <ListMusic className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                    저장된 구간 목록
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs sm:text-sm">
                    총 {sections.length}개의 구간이 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4">
                  <div className="space-y-2 sm:space-y-3">
                    {sections.map((section) => {
                      const colorIndex = Number.parseInt(section.color)
                      const colors = colorPalette[colorIndex % colorPalette.length]
                      return (
                        <div
                          key={section.id}
                          className={cn(
                            "flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 rounded-lg border transition-all",
                            currentSection?.id === section.id
                              ? `${colors.bg} ${colors.border} ring-1 sm:ring-2 ring-pink-500 shadow-lg` // 활성 구간 그림자 추가
                              : "bg-slate-600/70 border-slate-500 hover:border-slate-400",
                          )}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 mb-2 sm:mb-0">
                            <div className={cn("w-2 sm:w-3 h-8 sm:h-10 rounded-sm", colors.solid)}></div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-100 text-sm sm:text-base">{section.name}</h4>
                              <p className="text-xs sm:text-sm text-slate-400">
                                {formatTime(section.startTime)} - {formatTime(section.endTime)} (
                                {formatTime(section.endTime - section.startTime)})
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2 w-full sm:w-auto justify-end">
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => playSection(section)}
                                    size="icon"
                                    variant={currentSection?.id === section.id ? "default" : "outline"}
                                    className={cn(
                                      "w-8 h-8 sm:w-auto sm:h-auto sm:px-2 sm:py-1",
                                      currentSection?.id === section.id
                                        ? "bg-pink-600 hover:bg-pink-700 text-white"
                                        : "border-slate-500 bg-slate-600 hover:bg-slate-500 text-slate-300 hover:text-slate-100",
                                    )}
                                  >
                                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">재생</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 text-slate-200 border-slate-700">
                                  <p>구간 재생</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() => deleteSection(section.id)}
                                    size="icon"
                                    variant="outline"
                                    className="w-8 h-8 sm:w-auto sm:h-auto sm:px-2 sm:py-1 border-slate-500 bg-slate-600 hover:bg-slate-500 text-slate-300 hover:text-slate-100"
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">삭제</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 text-slate-200 border-slate-700">
                                  <p>구간 삭제</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
        <footer className="text-center text-xs sm:text-sm text-slate-500 py-4">
          <p>&copy; {new Date().getFullYear()} 구간 반복 마스터. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
