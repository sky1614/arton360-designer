// // import DesignerPage from "./pages/DesignerPage";

// // export default function App() {
// //   return <DesignerPage />;
// // }

// import "./App.css";
// import Toolbar from "./components/Toolbar";
// import CanvasArea from "./components/CanvasArea";
// import DetailsPane from "./components/DetailsPane";


// export default function App() {
//   return (
//     <div className="h-screen w-screen overflow-hidden">
//       {/* 3-column layout; divide adds the vertical rules */}
//       <div className="flex h-full divide-x divide-gray-300">
//         {/* LEFT: Tools (fixed width) */}
//         <aside className="shrink-0 w-64 overflow-y-auto">
//           <Toolbar />
//         </aside>

//         {/* CENTER: Canvas (flexible). min-w-0 prevents right pane from overlapping */}
//         <main className="flex-1 min-w-0 overflow-auto">
//           <CanvasArea />
//         </main>

//         {/* RIGHT: Listing Details (fixed width) */}
//         <aside className="shrink-0 w-[520px] overflow-y-auto">
//           <DetailsPane />
//         </aside>
//       </div>
//     </div>
//   );
// }

import "./App.css";
import TeePublicApp from "./TeePublicApp";

export default function App() {
  return <TeePublicApp />;
}

