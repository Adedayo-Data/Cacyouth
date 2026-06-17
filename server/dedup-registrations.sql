-- ============================================================
-- Duplicate Registration Cleanup
-- Run this in Railway: PostgreSQL service → Data tab → SQL
--
-- Step 1: PREVIEW — see what would be deleted (safe, read-only)
-- Step 2: DELETE  — run after confirming the preview looks right
-- ============================================================


-- ── STEP 1: Preview duplicates ────────────────────────────────
-- Shows which rows share a tx_ref and which one will be KEPT (rn=1).
-- Kept row = the one with payment_status='success', or the newest if none are paid.

SELECT
  tx_ref,
  id,
  name,
  payment_status,
  registered_at,
  ROW_NUMBER() OVER (
    PARTITION BY tx_ref
    ORDER BY
      CASE WHEN payment_status = 'success' THEN 0 ELSE 1 END,
      registered_at DESC
  ) AS rn,
  CASE
    WHEN ROW_NUMBER() OVER (
      PARTITION BY tx_ref
      ORDER BY
        CASE WHEN payment_status = 'success' THEN 0 ELSE 1 END,
        registered_at DESC
    ) = 1 THEN 'KEEP'
    ELSE 'DELETE'
  END AS action
FROM registrations
WHERE tx_ref IS NOT NULL
  AND tx_ref IN (
    SELECT tx_ref
    FROM registrations
    WHERE tx_ref IS NOT NULL
    GROUP BY tx_ref
    HAVING COUNT(*) > 1
  )
ORDER BY tx_ref, rn;


-- ── STEP 2: Delete the duplicate rows ─────────────────────────
-- Only run this after reviewing the preview above.
-- Keeps: payment_status='success' row, or the newest pending row.
-- Deletes: all other rows with the same tx_ref.

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY tx_ref
      ORDER BY
        CASE WHEN payment_status = 'success' THEN 0 ELSE 1 END,
        registered_at DESC
    ) AS rn
  FROM registrations
  WHERE tx_ref IS NOT NULL
)
DELETE FROM registrations
WHERE id IN (
  SELECT id FROM ranked WHERE rn > 1
)
RETURNING id, name, payment_status, tx_ref;
