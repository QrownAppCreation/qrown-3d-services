async function handleSTLUpload(designId: string, file: File) {
  if (!file.name.endsWith(".stl") && !file.name.endsWith(".obj")) {
    toast.error("Please upload an STL or OBJ file.");
    return;
  }

  setUploadingDesignId(designId);
  try {
    // Step 1: Get signed upload URL from our API
    const sigRes = await fetch(
      `/api/designs/${designId}/stl?fileName=${encodeURIComponent(file.name)}`,
      { method: "GET", credentials: "include" }
    );
    const sigData = await sigRes.json();
    if (!sigRes.ok) throw new Error(sigData.error ?? "Could not get upload URL");

    // Step 2: Upload directly to Supabase (bypasses Vercel size limit)
    const uploadRes = await fetch(sigData.signedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": "model/stl" },
    });
    if (!uploadRes.ok) throw new Error("Direct upload to Supabase failed");

    // Step 3: Save the path to our database
    const saveRes = await fetch(`/api/designs/${designId}/stl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ path: sigData.path, orderId: order.id }),
    });
    const saveData = await saveRes.json();
    if (!saveRes.ok) throw new Error(saveData.error ?? "Failed to save file path");

    setDesigns((prev) =>
      prev.map((d) =>
        d.id === designId
          ? { ...d, stlUrl: sigData.path, status: "REVIEW" }
          : d
      )
    );
    setOrderStlUrl(sigData.path);
    setStlMeta((prev) => ({
      ...prev,
      [designId]: { fileName: file.name, uploadedAt: new Date().toISOString() },
    }));

    toast.success("STL uploaded successfully. Status updated to REVIEW.");
    router.refresh();
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
  } finally {
    setUploadingDesignId(null);
  }
}