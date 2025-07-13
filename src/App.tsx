import { useState } from "react";
import "./App.css";
import MusicPlayer from "./music-player";
import FileList from "./components/file-list";

interface AudioFile {
  id: string
  name: string
  file?: File
  url: string
  duration?: number
  size: number
  path?: string
}

function App() {
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null);

  const handleFileSelect = (file: AudioFile) => {
    setSelectedFile(file);
  };

  const handleBackToList = () => {
    setSelectedFile(null);
  };

  return (
    <main className="min-h-screen">
      {selectedFile ? (
        <MusicPlayer 
          selectedFile={selectedFile} 
          onBackToList={handleBackToList}
        />
      ) : (
        <FileList onFileSelect={handleFileSelect} />
      )}
    </main>
  );
}

export default App;
