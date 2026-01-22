import { useDesignerStore } from "../state/useDesignerStore";
import { Button } from "@/components/ui/button";

export default function DesignNav() {
    const { activeDesignIndex, tshirtDesigns, nextDesign, prevDesign } =
        useDesignerStore();

    return (
        <div className="flex items-center justify-between gap-3 my-6">
            <Button variant="outline" onClick={prevDesign} disabled={activeDesignIndex === 0}>
                Prev
            </Button>

            <div className="text-sm font-medium">
                Design {activeDesignIndex + 1} / {tshirtDesigns.length}
            </div>

            <Button variant="outline" onClick={nextDesign} disabled={activeDesignIndex >= tshirtDesigns.length - 1}>
                Next
            </Button>
        </div>
    );
}
