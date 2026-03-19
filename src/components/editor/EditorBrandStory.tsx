"use client";

import { Field, ArrayEditor, EmptySection, type EditorTabProps } from "./EditorFields";

export function EditorBrandStory({ data, onPatch }: EditorTabProps) {
  if (!data.brandStory) {
    return (
      <EmptySection
        label="Brand Story"
        onAdd={() => onPatch({ brandStory: { manifesto: "", originStory: "", brandPromise: "", brandBeliefs: [] } })}
      />
    );
  }

  return (
    <>
      <Field label="Manifesto" value={data.brandStory.manifesto} onChange={(v) => onPatch({ brandStory: { ...data.brandStory!, manifesto: v } })} multiline rows={4} placeholder="O manifesto da marca..." />
      <Field label="Origin Story" value={data.brandStory.originStory} onChange={(v) => onPatch({ brandStory: { ...data.brandStory!, originStory: v } })} multiline rows={4} placeholder="Como a marca nasceu..." />
      <Field label="Brand Promise" value={data.brandStory.brandPromise} onChange={(v) => onPatch({ brandStory: { ...data.brandStory!, brandPromise: v } })} multiline rows={3} placeholder="A promessa da marca ao publico..." />
      <ArrayEditor label="Brand Beliefs" items={data.brandStory.brandBeliefs ?? []} onChange={(v) => onPatch({ brandStory: { ...data.brandStory!, brandBeliefs: v } })} addLabel="Crenca da marca" />
    </>
  );
}
