#!/usr/bin/env node
/*
  normalize-status.ts

  Scans the `tours` collection and normalizes the `status` field to one
  of: 'draft', 'open', 'closed'.

  Usage:
    # dry-run (default) - will only print what would change
    npx tsx scripts/normalize-status.ts

    # apply changes (destructive) - will update documents
    npx tsx scripts/normalize-status.ts --apply

  Notes:
    - The script will lowercase and trim existing status values.
    - If normalized value is not one of allowed values, it will be
      set to 'draft' when --apply is used (and logged in dry-run).
    - The script uses the project's firebase config at src/config/firebase.js
      and requires access to Firestore service account (local SA file or env).
*/

async function main(){
  const apply = process.argv.includes("--apply");
  console.log(`normalize-status: dry-run=${!apply}, apply=${apply}`);

  const { firestore } = await import("../src/config/firebase.js");

  const allowed = new Set(["draft","open","closed"]);

  const col = firestore.collection("tours");
  const snap = await col.get();
  console.log(`Found ${snap.size} tour documents`);

  let toChange: Array<{ id: string; from: string; to: string }> = [];

  for(const doc of snap.docs){
    const data = doc.data() as any;
    const curRaw = data?.status;
    const cur = curRaw === undefined || curRaw === null ? "" : String(curRaw);
    const normalized = cur.trim().toLowerCase();

    if(cur === ""){
      // missing -> set to draft
      toChange.push({ id: doc.id, from: String(curRaw), to: "draft" });
    } else if(normalized !== cur){
      if(allowed.has(normalized)){
        toChange.push({ id: doc.id, from: cur, to: normalized });
      } else {
        // unknown normalized value -> set to draft
        toChange.push({ id: doc.id, from: cur, to: "draft" });
      }
    }
  }

  if(toChange.length === 0){
    console.log("No changes required. Exiting.");
    return;
  }

  console.log("Planned changes:");
  toChange.forEach(c=> console.log(`- ${c.id}: "${c.from}" -> "${c.to}"`));

  if(!apply){
    console.log("Dry-run only. Rerun with --apply to perform updates.");
    return;
  }

  console.log("Applying changes...");
  let changed = 0;
  for(const c of toChange){
    await col.doc(c.id).set({ status: c.to }, { merge: true });
    changed++;
    console.log(`Updated ${c.id}`);
  }

  console.log(`Done. Documents processed: ${snap.size}. Updated: ${changed}`);
}

main().catch(err=>{
  console.error("Script failed:", err);
  process.exit(1);
});
