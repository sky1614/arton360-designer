import Toolbar from "../components/Toolbar";
import CanvasArea from "../components/CanvasArea";
import PreviewPane from "../components/PreviewPane";

export default function DesignerPage() {
  return (
    <div className="flex h-screen w-full">
      {/* Left: Toolbar */}
      <div className="w-1/5 bg-gray-100 border-r border-gray-300">
        <Toolbar />
      </div>

      {/* Middle: Canvas */}
      <div className="flex-1 bg-white flex items-center justify-center">
        <CanvasArea />
      </div>

      {/* Right: Preview */}
      <div className="w-1/4 bg-gray-50 border-l border-gray-300">
        <PreviewPane />
      </div>
    </div>
  );
}
