// ✅ Exact field coordinates
const FIELD_COORDINATES = {
  Model: { x: 370, y: 640, page: 1 },
  Chassis: { x: 390, y: 615, page: 1 },
  Engine: { x: 390, y: 600, page: 1 },
};


// ===== File name display & reselect feature =====
const fileInput = document.getElementById("excelFile");
const fileNameDisplay = document.getElementById("fileName");

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    fileNameDisplay.textContent = `📄 ${file.name}`;
    fileNameDisplay.classList.add("file-loaded");
  } else {
    fileNameDisplay.textContent = "";
    fileNameDisplay.classList.remove("file-loaded");
  }
});
// dropzone
const dropZone = document.getElementById("dropZone");

// Highlight on drag over
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

// Remove highlight on drag leave
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

// Handle file drop
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  
  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].name.endsWith(".xlsx")) {
    fileInput.files = files; // Assign dropped file to input
    fileNameDisplay.textContent = `${files[0].name}`;
    fileNameDisplay.classList.add("file-loaded");
  } else {
    fileNameDisplay.textContent = "";
    fileNameDisplay.classList.remove("file-loaded");
    alert("Please drop a valid .xlsx file.");
  }
  
});

// When clicking file name, open file chooser again
fileNameDisplay.addEventListener("click", () => {
  fileInput.click();
});
// ✅ Main generate logic
/*
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
    const page = pdf.getPage(FIELD_COORDINATES.Model.page - 1); // get correct page
    const { height } = page.getSize();
    
    const font = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
    const draw = (text, fieldKey, size = 10, padding = 2, bgColor = PDFLib.rgb(1, 1, 1)) => {
      const coords = FIELD_COORDINATES[fieldKey];
      if (!coords) return;
      
      const content = String(text || "");
      const textWidth = font.widthOfTextAtSize(content, size);
      const textHeight = size; // approx. height of the text line
      
      // Draw background rectangle (white box)
      page.drawRectangle({
        x: coords.x - padding,
        y: coords.y - padding,
        width: textWidth + padding * 2,
        height: textHeight + padding * 1.5, // add slight vertical padding
        color: bgColor,
      });
      
      // Draw text on top
      page.drawText(content, {
        x: coords.x,
        y: coords.y,
        size,
        font,
        color: PDFLib.rgb(0, 0, 0),
      });
      
      console.log(`${fieldKey} drawn with background → x:${coords.x}, y:${coords.y}`);
    };
    // ✅ Draw using exact coordinates
    draw(row.Model, "Model");
    draw(row.Chassis || row.Chasis, "Chassis"); // handle Excel typo
    draw(row.Engine, "Engine");
    
    const [copiedPage] = await mergedPdf.copyPages(pdf, [0]);
    mergedPdf.addPage(copiedPage);
  }
  
  const mergedBytes = await mergedPdf.save();
  saveAs(new Blob([mergedBytes], { type: "application/pdf" }), "Merged_Form22.pdf");
  
  status.textContent = "✅ PDF Generated Successfully!";
});
*/
document.getElementById("generateBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("excelFile");
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
  
  const mergedPdf = await PDFLib.PDFDocument.create();
  
  let index = 0;
  for (const row of rows) {
    index++;
    status.textContent = `Processing record ${index} of ${rows.length}...`;
    
    // ✅ Choose form based on "QU" in Model
    const isEV = String(row.Model || "").toUpperCase().includes("QU");
    const templateUrl = isEV ? "form22_ev.pdf" : "form22_petrol.pdf";
    const templateBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
    
    const pdf = await PDFLib.PDFDocument.load(templateBytes);
    const page = pdf.getPage(FIELD_COORDINATES.Model.page - 1);
    const { height } = page.getSize();
    const font = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
    
    // 🧠 Draw function with background + padding
    const draw = (text, fieldKey, size = 10, padding = 2, bgColor = PDFLib.rgb(1, 1, 1)) => {
      const coords = FIELD_COORDINATES[fieldKey];
      if (!coords) return;
      
      const content = String(text || "");
      const textWidth = font.widthOfTextAtSize(content, size);
      const textHeight = size;
      
      // Background box
      page.drawRectangle({
        x: coords.x - padding,
        y: coords.y - padding,
        width: textWidth + padding * 2,
        height: textHeight + padding * 1.5,
        color: bgColor,
      });
      
      // Text on top
      page.drawText(content, {
        x: coords.x,
        y: coords.y,
        size,
        font,
        color: PDFLib.rgb(0, 0, 0),
      });
      
      console.log(`${fieldKey} drawn with background → x:${coords.x}, y:${coords.y}`);
    };
    
    // 📝 Draw fields
    draw(row.Model, "Model");
    draw(row.Chassis || row.Chasis, "Chassis"); // handle typo
    draw(row.Engine, "Engine");
    
    const [copiedPage] = await mergedPdf.copyPages(pdf, [0]);
    mergedPdf.addPage(copiedPage);
  }
  
  const mergedBytes = await mergedPdf.save();
  saveAs(new Blob([mergedBytes], { type: "application/pdf" }), "Merged_Form22.pdf");
  
  status.textContent = "✅ PDF Generated Successfully!";
});