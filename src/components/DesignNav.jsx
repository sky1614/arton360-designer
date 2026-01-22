// import { useDesignerStore } from "../state/useDesignerStore";
// import { Button } from "@/components/ui/button";

// export default function DesignNav() {
//     const { activeDesignIndex, tshirtDesigns, nextDesign, prevDesign } =
//         useDesignerStore();

//     return (
//         <div className="flex items-center justify-between gap-3 my-6">
//             <Button variant="outline" onClick={prevDesign} disabled={activeDesignIndex === 0}>
//                 Prev
//             </Button>

//             <div className="text-sm font-medium">
//                 Design {activeDesignIndex + 1} / {tshirtDesigns.length}
//             </div>

//             <Button variant="outline" onClick={nextDesign} disabled={activeDesignIndex >= tshirtDesigns.length - 1}>
//                 Next
//             </Button>
//         </div>
//     );
// }

import { useDesignerStore } from "../state/useDesignerStore";

export default function DesignNav() {
  const { tshirtDesigns, activeDesignIndex, nextDesign, prevDesign } =
    useDesignerStore();

  const total = tshirtDesigns?.length || 0;
  const i = activeDesignIndex || 0;

  if (total <= 0) return null;

  return (
    <div className="flex items-center justify-between my-6">
      <button
        className="px-4 py-2 rounded bg-white shadow disabled:opacity-40"
        onClick={prevDesign}
        disabled={i <= 0}
      >
        Prev
      </button>

      <div className="text-sm font-semibold">
        Design {i + 1} / {total}
      </div>

      <button
        className="px-4 py-2 rounded bg-white shadow disabled:opacity-40"
        onClick={nextDesign}
        disabled={i >= total - 1}
      >
        Next
      </button>
    </div>
  );
}
