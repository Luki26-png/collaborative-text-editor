import * as Y from "yjs";

const doc = new Y.Doc({ gc: false });
doc.getMap("root").set("a", 1);
doc.getMap("root").set("b", 2);

// create snapshot
const snapshot = Y.snapshot(doc);
console.log("state at snapshot", doc.toJSON());
console.log(snapshot);

// encode snapshot
const encoded = Y.encodeSnapshot(snapshot);
console.log("encoded snapshot", encoded);

// decode snapshot
const decoded = Y.decodeSnapshot(encoded);
console.log("decoded", decoded);

// make some changes
doc.getMap("root").delete("b");
doc.getMap("root").set("c", 3);
console.log("state after changes", doc.toJSON());

// restore snapshot
const docRestored = Y.createDocFromSnapshot(doc, snapshot);
docRestored.getMap("root"); // need to touch top-level type for toJSON to work
console.log("state restored at snapshot", docRestored.toJSON());

/////////////////////////////////////////////////////////
export function revertChangesSinceSnapshot(doc: Doc, snapshot: Uint8Array) {
    const snap = Y.decodeSnapshot(snapshot);
    doc.gc = false;
    const tempdoc = Y.createDocFromSnapshot(doc, snap);
  
    const currentStateVector = Y.encodeStateVector(doc);
    const snapshotStateVector = Y.encodeStateVector(tempdoc);
  
    const changesSinceSnapshotUpdate = Y.encodeStateAsUpdate(doc, snapshotStateVector);
  
    const um = new Y.UndoManager(
      [...tempdoc.share.values()]
    );
  
    Y.applyUpdate(tempdoc, changesSinceSnapshotUpdate);
    um.undo();
  
    const revertChangesSinceSnapshotUpdate = Y.encodeStateAsUpdate(tempdoc, currentStateVector);
    Y.applyUpdate(doc, revertChangesSinceSnapshotUpdate, {
      user: {
        id: 'revert'
      }
    });
    doc.gc = true;
  }