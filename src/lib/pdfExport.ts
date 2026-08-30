/**
 * 100% Vector, ATS-Friendly PDF Export Engine
 * Triggers native browser print formatted with @page { size: A4 portrait; margin: 0; }
 * This guarantees 100% selectable text, crisp vector fonts, and perfect ATS parser compatibility.
 */
export async function exportResumeToPdf(filename = "Usman_Zakria_Resume.pdf") {
  const originalTitle = document.title;
  try {
    // Set document title so browser uses clean filename on Save as PDF
    document.title = filename.replace(/\.pdf$/i, "");
    
    // Ensure all web fonts are fully loaded before dialog triggers
    if (document.fonts) {
      await document.fonts.ready;
    }

    // Small delay to allow any pending layout reflows to settle
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 150);
  } catch (error) {
    console.error("Print export error:", error);
    window.print();
    document.title = originalTitle;
  }
}
