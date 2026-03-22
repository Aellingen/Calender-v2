# Sprint 6: Life Map Overlay

## Context Files to Read First
- `context/components/life-map-overlay.md`

## Goal
Life Map slides over showing pillars with nested goals and habits.

## Tasks
1. **LifeMapOverlay**: Slide-in panel (right, 60–70% width). Cmd+L trigger. Backdrop close.
2. **PillarCard**: Color bar, icon, name, description. Stats row. Expand/collapse.
3. **Nested goals**: Small progress ring + name. Click → GoalDetailModal.
4. **Nested habits**: Streak badge + name. Click → HabitDetailPopover.
5. **Pillar reordering**: DnD for pillar cards. Saves sort_order.
6. **Edit mode**: Toggle. Rename, color/icon picker, archive button.
7. **Empty states**: Per-pillar empty state with "Create goal" CTA.

## Acceptance Criteria
- [ ] Cmd+L opens overlay
- [ ] All pillars shown with nested goals and habits
- [ ] Per-pillar stats are accurate
- [ ] Can reorder pillars via drag
- [ ] Edit mode allows rename, color change, archive
- [ ] Click goal → GoalDetailModal opens
- [ ] Full-screen on mobile widths
