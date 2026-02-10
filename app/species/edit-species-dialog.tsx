"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { useRouter } from "next/navigation";
import { useState, type BaseSyntheticEvent} from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Format of edit species is based on structure of profile edit
// Form validation schema for editing a species entry
const editSpeciesSchema = z.object({
  scientific_name: z.string().min(1).transform((v) => v.trim()),
  common_name: z
    .string()
    .nullable()
    .transform((v) => (!v || v.trim() === "" ? null : v.trim())),
  kingdom: z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]),
  total_population: z
    .union([z.coerce.number().int().nonnegative(), z.literal("")])
    .transform((v) => (v === "" ? null : v))
    .nullable(),
  description: z
    .string()
    .nullable()
    .transform((v) => (!v || v.trim() === "" ? null : v.trim())),
});

type Species = Database["public"]["Tables"]["species"]["Row"];

export function EditSpeciesDialog({ species }: { species: Species }) {

  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [open, setOpen] = useState(false);

  type EditSpeciesValues = z.infer<typeof editSpeciesSchema>;

  const form = useForm<EditSpeciesValues>({
    resolver: zodResolver(editSpeciesSchema),
    defaultValues: {
      scientific_name: species.scientific_name,
      common_name: species.common_name,
      kingdom: species.kingdom,
      total_population: species.total_population ?? null,
      description: species.description,
    },
  });

  const onSubmit = async (values: EditSpeciesValues) => {
    const { error } = await supabase
      .from("species")
      .update({
        scientific_name: values.scientific_name,
        common_name: values.common_name,
        kingdom: values.kingdom,
        total_population: values.total_population,
        description: values.description,
      })
      .eq("id", species.id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Saved", description: "Species updated successfully." });
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Edit</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit species</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(e)} className="space-y-4">
            <FormField
              control={form.control}
              name="scientific_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scientific name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="common_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common name</FormLabel>
                  <FormControl>
                    <Input value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kingdom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kingdom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total_population"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total population</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


