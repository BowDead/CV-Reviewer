import { describe, expect, test } from "vitest";
import { detectCvKind } from "../../src/utils/file-type.js";

const PDF = Buffer.from("%PDF-1.7 treść pliku");
const DOCX = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
const TEXT = Buffer.from("zwykły tekst");

describe("file type detection", () => {
  // Accepted files
  test("given a valid PDF named cv.pdf when detectCvKind then pdf is returned", () => {
    // Arrange
    const fileName = "cv.pdf";
    const buffer = PDF;
    const expected = "pdf";

    // Act
    const result = detectCvKind(fileName, buffer);

    // Assert
    expect(result).toBe(expected);
  });

  test("given a valid PDF named CV.PDF when detectCvKind then pdf is returned", () => {
    // Arrange
    const fileName = "CV.PDF";
    const buffer = PDF;
    const expected = "pdf";

    // Act
    const result = detectCvKind(fileName, buffer);

    // Assert
    expect(result).toBe(expected);
  });

  test("given a valid DOCX named cv.docx when detectCvKind then docx is returned", () => {
    // Arrange
    const fileName = "cv.docx";
    const buffer = DOCX;
    const expected = "docx";

    // Act
    const result = detectCvKind(fileName, buffer);

    // Assert
    expect(result).toBe(expected);
  });

  // Rejected files
  test("given a text named .pdf when detectCvKind then FILE_NOT_PDF is thrown", () => {
    // Arrange
    const fileName = "cv.pdf";
    const buffer = TEXT;
    const code = "FILE_NOT_PDF";
    const status = 400;

    // Act
    const act = () => detectCvKind(fileName, buffer);

    // Assert
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });

  test("given a text named .docx when detectCvKind then FILE_NOT_DOCX is thrown", () => {
    // Arrange
    const fileName = "cv.docx";
    const buffer = TEXT;
    const code = "FILE_NOT_DOCX";
    const status = 400;

    // Act
    const act = () => detectCvKind(fileName, buffer);

    // Assert
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });

  test("given a PDF named .docx when detectCvKind then FILE_NOT_DOCX is thrown", () => {
    // Arrange
    const fileName = "cv.docx";
    const buffer = PDF;
    const code = "FILE_NOT_DOCX";
    const status = 400;

    // Act
    const act = () => detectCvKind(fileName, buffer);

    // Assert
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });

  test("given an unsupported extension when detectCvKind then FILE_UNSUPPORTED is thrown", () => {
    // Arrange
    const fileName = "cv.txt";
    const buffer = TEXT;
    const code = "FILE_UNSUPPORTED";
    const status = 415;

    // Act
    const act = () => detectCvKind(fileName, buffer);

    // Assert
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });

  test("given no extension when detectCvKind then FILE_UNSUPPORTED is thrown", () => {
    // Arrange
    const fileName = "cv";
    const buffer = PDF;
    const code = "FILE_UNSUPPORTED";
    const status = 415;

    // Act
    const act = () => detectCvKind(fileName, buffer);

    // Assert
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });
});
