const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const extractTextFromFile = async (file) => {
  if (!file) throw new Error("No file uploaded");

  if (file.mimetype === "application/pdf") {
    // pdf-parse options for cleaner text
    const options = {
      pagerender: function(pageData) {
        return pageData.getTextContent().then(function(textContent) {
          return textContent.items.map(item => item.str).join(' ');
        });
      }
    };
    const data = await pdfParse(file.buffer);
    
    // Clean text for AI to detect spelling mistakes better
    return data.text.replace(/\s+/g, ' ').trim();
  }

  if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value.trim();
  }

  throw new Error("Unsupported file type. Upload PDF or DOCX.");
};

module.exports = { extractTextFromFile };