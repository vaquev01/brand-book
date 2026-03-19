"use client";

import { Field, ArrayEditor, EmptySection, type EditorTabProps } from "./EditorFields";

export function EditorVerbal({ data, onPatch }: EditorTabProps) {
  if (!data.verbalIdentity) {
    return (
      <EmptySection
        label="Identidade Verbal"
        onAdd={() => onPatch({ verbalIdentity: { tagline: "", oneLiner: "", brandVoiceTraits: [], messagingPillars: [], vocabulary: { preferred: [], avoid: [] }, doDont: { do: [], dont: [] }, sampleHeadlines: [], sampleCTAs: [] } })}
      />
    );
  }

  return (
    <>
      <Field label="Tagline" value={data.verbalIdentity.tagline} onChange={(v) => onPatch({ verbalIdentity: { ...data.verbalIdentity!, tagline: v } })} />
      <Field label="One-liner" value={data.verbalIdentity.oneLiner} onChange={(v) => onPatch({ verbalIdentity: { ...data.verbalIdentity!, oneLiner: v } })} multiline rows={2} />
      <ArrayEditor label="Tracos de Voz" items={data.verbalIdentity.brandVoiceTraits} onChange={(v) => onPatch({ verbalIdentity: { ...data.verbalIdentity!, brandVoiceTraits: v } })} addLabel="Traco de voz" />
      <ArrayEditor label="Headlines de Exemplo" items={data.verbalIdentity.sampleHeadlines} onChange={(v) => onPatch({ verbalIdentity: { ...data.verbalIdentity!, sampleHeadlines: v } })} addLabel="Headline" />
      <ArrayEditor label="CTAs de Exemplo" items={data.verbalIdentity.sampleCTAs} onChange={(v) => onPatch({ verbalIdentity: { ...data.verbalIdentity!, sampleCTAs: v } })} addLabel="CTA" />
      <div className="grid gap-4 md:grid-cols-2">
        <ArrayEditor label="Vocabulario Preferido" items={data.verbalIdentity.vocabulary.preferred} onChange={(v) => onPatch({ verbalIdentity: { ...data.verbalIdentity!, vocabulary: { ...data.verbalIdentity!.vocabulary, preferred: v } } })} addLabel="Palavra preferida" />
        <ArrayEditor label="Vocabulario a Evitar" items={data.verbalIdentity.vocabulary.avoid} onChange={(v) => onPatch({ verbalIdentity: { ...data.verbalIdentity!, vocabulary: { ...data.verbalIdentity!.vocabulary, avoid: v } } })} addLabel="Palavra a evitar" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ArrayEditor label="Do (Faca)" items={data.verbalIdentity.doDont.do} onChange={(v) => onPatch({ verbalIdentity: { ...data.verbalIdentity!, doDont: { ...data.verbalIdentity!.doDont, do: v } } })} addLabel="Do" />
        <ArrayEditor label="Don't (Nao faca)" items={data.verbalIdentity.doDont.dont} onChange={(v) => onPatch({ verbalIdentity: { ...data.verbalIdentity!, doDont: { ...data.verbalIdentity!.doDont, dont: v } } })} addLabel="Don't" />
      </div>
    </>
  );
}
