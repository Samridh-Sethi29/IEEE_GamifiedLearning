# Shared creation engine (Phase C)

A small, activity-independent 2D editing engine. Pure logic (no React) is separated from rendering.

| File | Responsibility |
| --- | --- |
| `constants.js` | Limits: schema version, canvas range, max objects (200), **history limit (100)**, step sizes |
| `objectTypes.js` | Object type definitions + prop rules (plain data) |
| `schema.js` | `createProject`, `createObject`, `validateProject`, `normalizeProject` |
| `geometry.js` | Rotation-aware boundary clamping |
| `history.js` | Pure past/present/future snapshots |
| `editorReducer.js` | The reducer, selectors, `exportProject` |
| `actions.js` | Action creators (ids/timestamps are made here, never in the reducer) |
| `keyboard.js` | Key event -> action mapping (pure) |
| `objectArt.jsx`, `Canvas.jsx`, `Palette.jsx`, `PropertiesPanel.jsx`, `EditorWorkspace.jsx`, `useEditor.js`, `engine.css` | Rendering and UI (SVG, no new dependencies) |
| `../storage/serialization.js`, `../storage/documentStorage.js` | JSON text <-> project, minimal local save/load |
| `../pages/EngineLab.jsx` | Demo page at `/world/studio/engine-lab` (not linked from the hub) |

## Document (schema version 1)

```
{ id, schemaVersion, title, type, createdAt, modifiedAt,
  canvas: { width, height },
  objects: [ { id, type, x, y, rotation, width, height, layer, props } ],
  metadata: {} }
```

* `type`: `sandbox | world-builder | invention-lab | story-studio | design-studio`.
* `x`,`y` = object centre. `rotation` in [0, 360). `layer` mirrors array order (0 = back); renumbered on load/edit.
* Object types: `rectangle, circle, triangle` (`fill`), `tree` (`foliage`), `house` (`wall`, `roof`), `gear` (`fill`, `teeth` 6-16).
  Colours are `#rrggbb`. Width/height must be within the type's min/max.
* Validation rejects: unknown fields/types/props, non-finite numbers, duplicate ids or layers, out-of-range sizes,
  centres outside the canvas, canvas outside 200-4000, more than 200 objects, non-JSON metadata.
* Documents contain only JSON values (no components, DOM nodes or functions).

## Undo / redo

* The editor keeps whole-document snapshots (`past[]`, `present`, `future[]`), so undo restores real earlier documents.
* One committed edit = one step. A new edit clears redo. History holds at most **100** steps (oldest dropped).
* **Transactions**: `BEGIN_TRANSACTION` -> live edits (no history) -> `COMMIT_TRANSACTION` = one step; `CANCEL_TRANSACTION`
  restores the pre-drag document. A click with no movement adds nothing. Undo/redo are disabled mid-transaction.
* **Merge groups**: edits with the same `group` (holding an arrow key, dragging a slider) merge into one step until
  `END_GROUP` (key release, pointer up, blur) or any other action.
* `RESET` returns to the session's starting document as one undoable step. `LOAD_PROJECT` starts a fresh session.
* Selection is not part of history; undo/redo clears a selection that no longer exists.

## Actions

`ADD_OBJECT, SELECT, MOVE, MOVE_BY, ROTATE, ROTATE_BY, RESIZE, RESIZE_BY, SET_PROP, DELETE, REORDER (front/back/forward/backward),
BEGIN/COMMIT/CANCEL_TRANSACTION, END_GROUP, UNDO, REDO, RESET, LOAD_PROJECT, DISMISS_NOTICE`.
Operations that cannot happen (nothing selected, at an edge/size limit, workspace full, invalid value) leave the document
untouched and set `state.notice`.

## Persistence

`createDocumentStorage()` saves ONE validated document as JSON under `skillverse_studio_engine_document_v1`
(never `skillverse_save`). Save/load report success or a reason (`storage_unavailable`, `storage_full`, `invalid_project`,
`malformed_json`, `unsupported_version`, ...). Unreadable stored data is never overwritten silently: `save` refuses unless
`replaceUnreadable: true`, which first copies the old text to `<key>__backup`. No gallery, no sync.

## Tests

`npm run test:studio` (Node's built-in test runner; no dependencies added).
