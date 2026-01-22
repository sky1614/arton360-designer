import { useRef, useState } from "react";

export default function UploadDesign({ onFiles, onSkip }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const pickFiles = () => inputRef.current?.click();

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    onFiles(files);
  };

  return (
    <div className="w-full min-h-[800px] flex items-start justify-center p-10">
      <div className="w-[900px]">
        <h1 className="text-3xl font-bold mb-6 text-center">Upload A Design</h1>

        <div
          className={`mx-auto w-[320px] h-[220px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer select-none ${
            dragOver ? "bg-gray-100" : "bg-white"
          }`}
          onClick={pickFiles}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <div className="text-sm font-semibold mb-2">PNG</div>
          <div className="text-xs text-gray-500 mb-3 text-center px-6">
            Drag & drop your file here
            <br />
            or click to browse
          </div>

          <button
            type="button"
            className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
            onClick={(e) => {
              e.stopPropagation();
              pickFiles();
            }}
          >
            Upload Design
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <div className="text-center mt-6">
          <button
            className="text-sm underline text-gray-600"
            onClick={onSkip}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
