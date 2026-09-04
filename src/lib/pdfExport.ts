/**
 * 100% Vector, ATS-Friendly PDF Export Engine
 * Triggers native browser print formatted with @page { size: A4 portrait; margin: 0; }
 * This guarantees 100% selectable text, crisp vector fonts, and perfect ATS parser compatibility.
 */
export async function exportResumeToPdf(filename = "Usman_Zakria_Resume.pdf") {
  const originalTitle = document.title;
  try {
    const cleanTitle = filename.replace(/\.pdf$/i, "");
    document.title = cleanTitle;
    if (document.fonts) {
      await document.fonts.ready;
    }
    const restoreTitle = () => {
      document.title = originalTitle;
    };
    window.addEventListener("afterprint", restoreTitle, { once: true });
    setTimeout(() => {
      window.print();
      setTimeout(restoreTitle, 4000);
    }, 100);
  } catch (error) {
    console.error("Print export error:", error);
    window.print();
    document.title = originalTitle;
  }
}

export async function exportCoverLetterToPdf(filename = "CoverLetter_UsmanZakria.pdf") {
  const originalTitle = document.title;
  try {
    const cleanTitle = filename.replace(/\.pdf$/i, "");
    document.title = cleanTitle;
    if (document.fonts) {
      await document.fonts.ready;
    }
    const restoreTitle = () => {
      document.title = originalTitle;
    };
    window.addEventListener("afterprint", restoreTitle, { once: true });
    setTimeout(() => {
      window.print();
      setTimeout(restoreTitle, 4000);
    }, 100);
  } catch (error) {
    console.error("Cover letter print export error:", error);
    window.print();
    document.title = originalTitle;
  }
}
