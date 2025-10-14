document.getElementById("generateBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("excelFile");
  const vehicleType = document.getElementById("vehicleType").value;
  const status = document.getElementById("status");
  
  if (!fileInput.files.length) {
    alert("Please upload an Excel file first.");
    return;
  }
  
  status.textContent = "Reading Excel file...";
  
  const file = fileInput.files[0];
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);
  
  const templateUrl = vehicleType === "ev" ? "form22_ev.pdf" : "form22_petrol.pdf";
  const templateBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
  
  const mergedPdf = await PDFLib.PDFDocument.create();
  
  let index = 0;
  for (const row of rows) {
    index++;
    status.textContent = `Processing record ${index} of ${rows.length}...`;
    
    const pdf = await PDFLib.PDFDocument.load(templateBytes);
    const page = pdf.getPages()[0];
    const { height } = page.getSize();
    
    const font = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
    const draw = (text, x, y, size = 10) => {
      page.drawText(String(text || ""), { x, y, size, font, color: PDFLib.rgb(0, 0, 0) });
    };
    
    // 🧾 Adjust coordinates as per your actual PDF layout
    draw(row.Model, 120, height - 200);
    draw(row.Chassis, 120, height - 230);
    draw(row.Engine, 120, height - 260);
    
    const [copiedPage] = await mergedPdf.copyPages(pdf, [0]);
    mergedPdf.addPage(copiedPage);
  }
  
  const mergedBytes = await mergedPdf.save();
  saveAs(new Blob([mergedBytes], { type: "application/pdf" }), "Merged_Form22.pdf");
  
  status.textContent = "✅ PDF Generated Successfully!";
});