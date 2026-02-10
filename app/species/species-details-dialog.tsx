"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import { EditSpeciesDialog } from "./edit-species-dialog";

type Species = Database["public"]["Tables"]["species"]["Row"];

// Added the sessionId prop to allow edit feature
export function SpeciesDetailsDialog({ species, sessionId }: { species: Species; sessionId: string | null; }) {
  const canEdit = sessionId === species.author;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full">Learn More</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {species.common_name}{" "}
            <span className="font-normal italic">({species.scientific_name})</span>
          </DialogTitle>
        </DialogHeader>

        {/* Edit functionality only appears in learn more and canEdit == true */}
        {canEdit && (
        <div className="flex justify-end">
          <EditSpeciesDialog species={species} />
        </div>
      )}

        <div className="space-y-3 text-sm">
          <div>
            <div className="font-medium">Scientific name</div>
            <div>{species.scientific_name}</div>
          </div>

          <div>
            <div className="font-medium">Common name</div>
            <div>{species.common_name}</div>
          </div>

          <div>
            <div className="font-medium">Total population</div>
            <div>
              {species.total_population != null
                ? species.total_population.toLocaleString()
                : "—"}
            </div>
          </div>

          <div>
            <div className="font-medium">Kingdom</div>
            <div>{species.kingdom ?? "—"}</div>
          </div>

          <div>
            <div className="font-medium">Description</div>
            <div className="whitespace-pre-line">{species.description ?? "—"}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
