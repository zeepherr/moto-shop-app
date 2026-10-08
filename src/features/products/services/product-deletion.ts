export const deleteProductThenCleanImage = async (
  deleteRecord: () => Promise<unknown>,
  cleanupImage: () => Promise<unknown>,
) => {
  await deleteRecord();
  try {
    await cleanupImage();
  } catch {
    // A database deletion is final; a failed object cleanup leaves a safe orphan.
  }
};
