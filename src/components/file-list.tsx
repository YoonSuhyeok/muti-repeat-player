import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RefreshCw, Music, Trash2, Search, Folder } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { invoke } from "@tauri-apps/api/core"

interface AudioFile {
  id: string
  name: string
  file?: File
  url: string
  duration?: number
  size: number
  path?: string
}

interface AudioFileInfo {
  name: string
  path: string
  size: number
  is_audio: boolean
}

interface FileListProps {
  onFileSelect: (file: AudioFile) => void
}

export default function FileList({ onFileSelect }: FileListProps) {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [availableFolders, setAvailableFolders] = useState<string[]>([])

  // 기본 음악 폴더들을 가져오기
  useEffect(() => {
    loadDefaultFolders()
  }, [])

  const loadDefaultFolders = async () => {
    try {
      const folders = await invoke<string[]>('get_default_music_directories')
      setAvailableFolders(folders || [])
    } catch (error) {
      console.error('폴더 목록을 가져오는데 실패했습니다:', error)
      // 기본값 제공
      setAvailableFolders([])
    }
  }

  const scanFolder = async (folderPath: string) => {
    setIsScanning(true)
    try {
      const audioFileInfos = await invoke<AudioFileInfo[]>('scan_audio_files', {
        directory: folderPath
      })
      
      if (audioFileInfos && audioFileInfos.length > 0) {
        const newFiles: AudioFile[] = audioFileInfos.map(info => ({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: info.name,
          url: `file://${info.path}`,
          size: info.size,
          path: info.path
        }))

        setAudioFiles(prev => {
          // 중복 제거
          const existingPaths = new Set(prev.map(f => f.path))
          const uniqueNewFiles = newFiles.filter(f => !existingPaths.has(f.path))
          return [...prev, ...uniqueNewFiles]
        })
        
        if (newFiles.length === 0) {
          alert(`${folderPath}에서 음악 파일을 찾지 못했습니다.`)
        }
      } else {
        alert(`${folderPath}에서 음악 파일을 찾지 못했습니다.`)
      }
    } catch (error) {
      console.error('폴더 스캔 실패:', error)
      alert(`폴더 접근에 실패했습니다. 앱 설정에서 저장소 권한을 확인해주세요.`)
    } finally {
      setIsScanning(false)
    }
  }

  const handleDeleteFile = (id: string) => {
    setAudioFiles(prev => {
      const fileToDelete = prev.find(f => f.id === id)
      if (fileToDelete && fileToDelete.file) {
        URL.revokeObjectURL(fileToDelete.url)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const filteredFiles = audioFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto">
        {/* YouTube Music 스타일 헤더 */}
        <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-white">내 라이브러리</h1>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {/* YouTube Music 스타일 카드 */}
          <Card className="bg-gray-900/50 border-gray-800 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-medium text-white">
                음악 라이브러리
              </CardTitle>
            </CardHeader>
          <CardContent className="p-4">
            {/* 검색 및 파일 추가 */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="노래, 아티스트, 앨범 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-full"
                  />
                </div>
                <Button
                  onClick={loadDefaultFolders}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2 font-medium"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  음악 찾기
                </Button>
              </div>
              
              {/* 폴더 스캔 버튼들 */}
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-medium text-gray-300">음악 폴더에서 가져오기</h4>
                <div className="flex flex-wrap gap-2">
                  {availableFolders.map((folder, index) => (
                    <Button
                      key={index}
                      onClick={() => scanFolder(folder)}
                      disabled={isScanning}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full"
                    >
                      <Folder className="w-3 h-3 mr-1" />
                      {folder.split('/').pop() || folder}
                    </Button>
                  ))}
                  <Button
                    onClick={loadDefaultFolders}
                    disabled={isScanning}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    새로고침
                  </Button>
                </div>
                {isScanning && (
                  <p className="text-xs text-gray-400">폴더를 스캔하는 중...</p>
                )}
              </div>
            </div>

            {/* YouTube Music 스타일 파일 목록 */}
            {filteredFiles.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Music className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-2xl font-medium text-white mb-2">
                  {audioFiles.length === 0 ? "음악이 없습니다" : "검색 결과가 없습니다"}
                </h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  {audioFiles.length === 0 
                    ? "디바이스의 음악 폴더에서 곡을 가져와서 재생을 시작하세요"
                    : "다른 검색어를 시도해보세요"
                  }
                </p>
                {audioFiles.length === 0 && (
                  <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-wrap justify-center gap-3">
                      {availableFolders.slice(0, 2).map((folder, index) => (
                        <Button
                          key={index}
                          onClick={() => scanFolder(folder)}
                          disabled={isScanning}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-3"
                        >
                          <Folder className="w-4 h-4 mr-2" />
                          {folder.split('/').pop() || folder}에서 가져오기
                        </Button>
                      ))}
                    </div>
                    <div className="text-gray-500 text-sm">또는</div>
                    <Button
                      onClick={loadDefaultFolders}
                      variant="outline"
                      className="border-gray-600 bg-gray-800 hover:bg-gray-700 text-white rounded-full px-6 py-3"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      음악 폴더 탐색
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {/* 목록 헤더 */}
                <div className="flex items-center justify-between py-2 px-4 text-sm text-gray-400 border-b border-gray-800">
                  <span>제목</span>
                  <span>크기</span>
                </div>
                
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => onFileSelect(file)}
                  >
                    {/* 재생 버튼 / 번호 */}
                    <div className="w-10 h-10 flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
                        <Music className="w-4 h-4 text-gray-300 group-hover:text-white" />
                      </div>
                    </div>
                    
                    {/* 곡 정보 */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate group-hover:text-red-400 transition-colors">
                        {file.name.replace(/\.(mp3|wav|ogg|m4a|aac|flac)$/i, '')}
                      </h4>
                      <p className="text-sm text-gray-400 truncate">
                        Unknown Artist
                      </p>
                    </div>
                    
                    {/* 크기 정보 */}
                    <div className="text-sm text-gray-400 min-w-0">
                      {formatFileSize(file.size)}
                    </div>
                    
                    {/* 삭제 버튼 */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteFile(file.id)
                              }}
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 text-gray-200 border-gray-700">
                            <p>삭제</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {audioFiles.length > 0 && (
              <div className="mt-8 pt-4 border-t border-gray-800 text-center">
                <p className="text-sm text-gray-400">
                  총 {audioFiles.length}곡
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}
