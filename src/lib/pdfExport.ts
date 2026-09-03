/**
 * 100% Vector, ATS-Friendly PDF Export Engine
 * Triggers native browser print formatted with @page { size: A4 portrait; margin: 0; }
 * This guarantees 100% selectable text, crisp vector fonts, and perfect ATS parser compatibility.
 */
export async function exportResumeToPdf(filename = "Usman_Zakria_Resume.pdf") {
  const originalTitle = document.title;
  try {
    document.title = filename.replace(/\.pdf$/i, "");
    if (document.fonts) {
      await document.fonts.ready;
    }
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

export async function exportCoverLetterToPdf(filename = "CoverLetter_UsmanZakria.pdf") {
  const originalTitle = document.title;
  try {
    document.title = filename.replace(/\.pdf$/i, "");
    if (document.fonts) {
      await document.fonts.ready;
    }
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 150);
  } catch (error) {
    console.error("Cover letter print export error:", error);
    window.print();
    document.title = originalTitle;
  }
}
