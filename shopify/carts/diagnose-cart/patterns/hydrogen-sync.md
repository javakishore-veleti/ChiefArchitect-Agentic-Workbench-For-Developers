# Hydrogen, theme, and session synchronization

First re-query the cart directly. If API state is correct, compare server session, browser cookie, client cart ID, optimistic update, loader/revalidation, and UI event timing. Record the Hydrogen app and deployed revision from resolved context. Theme-specific drawer events vary by theme version; verify against that version's source. Avoid treating cart badge/drawer lag or post-order stale state as mutation failure.

