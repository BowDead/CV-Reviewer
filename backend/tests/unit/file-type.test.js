import { describe, expect, test } from "vitest";
import { detectCvKind } from "../../src/utils/file-type.js";

const PDF = Buffer.from("%PDF-1.7 treść pliku");
const DOCX = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
const TEXT = Buffer.from("zwykły tekst");

describe("file type detection", () => {
  // Accepted files
  test("given a valid PDF named cv.pdf when detectCvKind then pdf is returned", () => {
    // Given
    const fileName = "cv.pdf";
    const buffer = PDF;
    const expected = "pdf";

    // When
    const result = detectCvKind(fileName, buffer);

    // Then
    expect(result).toBe(expected);
  });

  test("given a valid PDF named CV.PDF when detectCvKind then pdf is returned", () => {
    // Given
    const fileName = "CV.PDF";
    const buffer = PDF;
    const expected = "pdf";

    // When
    const result = detectCvKind(fileName, buffer);

    // Then
    expect(result).toBe(expected);
  });

  test("given a valid DOCX named cv.docx when detectCvKind then docx is returned", () => {
    // Given
    const fileName = "cv.docx";
    const buffer = DOCX;
    const expected = "docx";

    // When
    const result = detectCvKind(fileName, buffer);

    // Then
    expect(result).toBe(expected);
  });

  // Rejected files
  test("given a text named .pdf when detectCvKind then FILE_NOT_PDF is thrown", () => {
    // Given
    const fileName = "cv.pdf";
    const buffer = TEXT;
    const code = "FILE_NOT_PDF";
    const status = 400;

    // When
    const act = () => detectCvKind(fileName, buffer);

    // Then
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });

  test("given a text named .docx when detectCvKind then FILE_NOT_DOCX is thrown", () => {
    // Given
    const fileName = "cv.docx";
    const buffer = TEXT;
    const code = "FILE_NOT_DOCX";
    const status = 400;

    // When
    const act = () => detectCvKind(fileName, buffer);

    // Then
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });

  test("given a PDF named .docx when detectCvKind then FILE_NOT_DOCX is thrown", () => {
    // Given
    const fileName = "cv.docx";
    const buffer = PDF;
    const code = "FILE_NOT_DOCX";
    const status = 400;

    // When
    const act = () => detectCvKind(fileName, buffer);

    // Then
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });

  test("given an unsupported extension when detectCvKind then FILE_UNSUPPORTED is thrown", () => {
    // Given
    const fileName = "cv.txt";
    const buffer = TEXT;
    const code = "FILE_UNSUPPORTED";
    const status = 415;

    // When
    const act = () => detectCvKind(fileName, buffer);

    // Then
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });

  test("given no extension when detectCvKind then FILE_UNSUPPORTED is thrown", () => {
    // Given
    const fileName = "cv";
    const buffer = PDF;
    const code = "FILE_UNSUPPORTED";
    const status = 415;

    // When
    const act = () => detectCvKind(fileName, buffer);

    // Then
    expect(act).toThrow(expect.objectContaining({ code, status }));
  });
});
