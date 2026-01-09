# Git Workflow Update

**Status**: completed
**Branch**: `docs/update-git-workflow`
**Started**: 2025-01-10 00:20

## Task
Updating git workflow to use branches and merge requests since production is now live on main.

## Files Being Modified
- CLAUDE.md (git workflow section + agent collaboration section)
- .claude/work/ (new folder for agent work files)
- WORK_IN_PROGRESS.md (to be deleted - replaced by folder approach)

## Progress
- [x] Update CLAUDE.md with branch workflow
- [x] Create feature branch
- [x] Change from single file to folder-based work tracking
- [x] Commit and push changes
- [ ] Create merge request (manual - gh CLI not installed)

## Notes/Discoveries
- `main` branch is now production - never push directly
- All work must go through merge requests
- Using folder-based work tracking to avoid merge conflicts between agents
