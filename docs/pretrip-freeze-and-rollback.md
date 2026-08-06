# Pre-Trip Freeze and Rollback Plan

## Scope guard

This document governs the Mountain Guide pre-trip freeze for the August 2026 trip. Everything committed to this repository is publicly fetchable. Never add private phone numbers, private email addresses, private addresses, personal emergency-contact literals, or other private contact data here.

If a change affects only documentation, no app version bump is required. If any served application file must change, stop: that work becomes a separate hotfix with a version bump and physical iPhone re-verification before merge.

## 1. Field candidate

- **Field candidate:** Version 15.3.9, unless superseded by a safety-critical hotfix.
- **Release tag placeholder:** `v15.3.9`. Confirm or create this tag before the feature freeze; this placeholder does not assert that the tag already exists.
- **Merge commit:** `151263e78e42f43ac4b3266a6f8d711b27d1fcbe`.

## 2. Calendar

| Milestone | Date |
| --- | --- |
| Current date | August 5, 2026 |
| Feature freeze | August 13, 2026 |
| Night-before verification | August 18, 2026 |
| Trip start | August 19, 2026 |
| Freeze lifts | August 26, 2026 |

## 3. Allowed changes after freeze

After August 13, changes are allowed only for a verified instance of one of these defects:

- wrong emergency number;
- wrong route or jurisdiction;
- broken offline launch;
- unreadable iPhone field screen;
- stale weather shown as current;
- safety-critical wording error.

## 4. August 13–18 protocol

From August 13 through August 18:

- every allowed fix uses a dedicated hotfix branch created from current `main`;
- every served-file change requires a version bump;
- every hotfix requires physical iPhone re-verification before merge;
- no direct commits are made to `main`;
- the pull request must identify the verified defect, the smallest safe correction, and the rollback target.

## 5. Disallowed changes after freeze

Do not introduce:

- new features;
- CSS refactors;
- service-worker strategy changes;
- manifest or asset-path changes;
- storage schema changes;
- DNS or domain changes;
- redesigns;
- dependency or tooling updates;
- AI rebuilds.

## 6. Device freeze

During the final week before the trip:

- do not install iOS updates;
- do not clear Safari website data;
- do not run storage-cleanup apps;
- do not delete or reinstall the Mountain Guide PWA unless a reproducible defect requires it and the recovery procedure has been verified first.

## 7. Night-before checklist — August 18

- [ ] Open the full guide online.
- [ ] Open Climb Mode online.
- [ ] Confirm both display Version 15.3.9, or the explicitly approved safety-hotfix version.
- [ ] Turn on Airplane Mode.
- [ ] Force-quit the installed app.
- [ ] Relaunch and verify the full guide offline.
- [ ] Relaunch and verify Climb Mode offline.
- [ ] Verify the emergency panel opens and its public jurisdiction information is readable.
- [ ] Verify the backup phone is present, charged, and usable. Do not record its private number in this repository.
- [ ] Pack the paper backup.
- [ ] Charge all power banks.

If any required item fails, restore connectivity, capture the exact failure, and apply the freeze rules before deciding whether a safety-critical hotfix is warranted.

## 8. Trailhead or camp checklist

- [ ] Launch in Airplane Mode.
- [ ] Confirm Climb Mode opens.
- [ ] Confirm the emergency panel opens.
- [ ] Confirm the selected objective and turnaround information are visible.
- [ ] Check the saved weather timestamp and treat saved data as potentially stale.
- [ ] Physically confirm the paper backup is present.

## 9. Rollback procedure

### Identify the last known-good release

1. Open the repository on GitHub and go to **Releases** or **Tags**.
2. Identify the most recent release that completed the full local, live-site, offline, and physical-iPhone checks. The expected field-candidate tag is `v15.3.9` once that placeholder has been confirmed or created.
3. Open the tag and verify that it points to the intended release commit or its merge commit. For Version 15.3.9, the expected merge commit is `151263e78e42f43ac4b3266a6f8d711b27d1fcbe`.
4. Record the known-good tag and commit in the rollback pull request. Do not rely on a version label alone.

### Revert a bad merge from a phone browser

1. In the GitHub phone browser, open the repository, select **Pull requests**, then open the merged pull request that introduced the defect.
2. Use GitHub’s **Revert** action if it is available. GitHub should create a new pull request that reverses the merge without rewriting history.
3. Confirm the revert pull request targets `main` and that **Files changed** reverses only the bad merge.
4. Confirm there are no merge conflicts and all available checks pass.
5. Merge the revert pull request. Do not force-push, rewrite `main`, or delete the bad branch as part of the emergency response.
6. If GitHub does not offer the Revert action or reports conflicts, stop and use GitHub Desktop or an authorized workstation to prepare a normal revert commit and pull request. Do not improvise history edits from the phone.

### Confirm GitHub Pages deployment

1. Open the repository’s **Actions** page.
2. Open the Pages deployment associated with the revert merge commit.
3. Wait for the build and deployment job to complete successfully. A merged revert is not considered deployed until this job succeeds.
4. Record the deployed commit shown by the successful workflow.

### Verify the live rollback

1. Open the live Mountain Guide website while online.
2. Confirm the displayed version matches the known-good release.
3. Open both the full guide and Climb Mode.
4. Verify the release module and visible version agree; any mixed-version result means propagation is incomplete.
5. Repeat the safety-critical behavior that triggered the rollback and confirm the known-good behavior is restored.

### Verify propagation to the installed iPhone PWA

1. Keep the iPhone online and open the installed Mountain Guide.
2. If an update prompt appears, accept it once and allow the app to reload.
3. Close and relaunch the installed app; verify the full guide and Climb Mode both show the known-good version.
4. Turn on Airplane Mode, force-quit, and relaunch both views.
5. Confirm offline launch, emergency information, objective/turnaround information, and saved-weather timestamps remain available.
6. Do not clear Safari data or reinstall the PWA merely to accelerate propagation. Use those steps only for a separately verified defect with an approved recovery plan.

### Preserve recovery references

- Do not delete the known-good branch or tag before the trip.
- Do not move or overwrite an existing release tag.
- Do not delete the branch containing the reverted change until the freeze lifts and the rollback is fully documented.
- Preserve the paper backup and the last known-good installed PWA until the trip is complete.

## 10. Human safety reminder

The Mountain Guide is decision support, not authorization to proceed. Weather is evidence, not permission. Actual sky, wind, terrain, access, and group condition govern decisions. The hard turnaround remains a human commitment even when the app is available and functioning normally.
