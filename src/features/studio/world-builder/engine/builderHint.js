// "What should I do next?" nudge for the World Builder status bar.
// Pure JavaScript: zero React, zero DOM. Reads the document only; never changes it.
// It points at the next sensible action. It does NOT judge connectivity or pass/fail (the mission
// dashboard and Test Village own that), so it can never contradict them.

const count = (objects, type) => objects.filter((o) => o.type === type).length;

/**
 * @param {{ objects?: Array<{type: string}> }} doc
 * @param {{ type: string } | null} selected
 * @returns {{ id: string, text: string }}
 */
export function getBuilderHint(doc, selected = null) {
  const objects = Array.isArray(doc?.objects) ? doc.objects : [];
  const wells = count(objects, "well");
  const pipes = count(objects, "pipe");
  const houses = count(objects, "house");
  const farms = count(objects, "farm");

  if (wells === 0) {
    return { id: "add-well", text: "Start with a Well. It is where your village's water comes from." };
  }
  if (pipes === 0) {
    return { id: "add-pipes", text: "Now add Pipes. Line their ends up with the cyan rings." };
  }
  if (houses === 0 && farms === 0) {
    return { id: "add-demand", text: "Add Houses and a Farm. These are the places that need water." };
  }
  if (farms === 0 || houses < 4) {
    return { id: "add-more-demand", text: "The mission needs a Farm and at least 4 Houses. Keep building!" };
  }
  if (selected) {
    return { id: "selected", text: "Drag it, or fine-tune it with the Object controls." };
  }
  return { id: "ready", text: "Looking good! Press Test Village to see if water reaches everyone." };
}
