import {normalisePath, validatePath, validateType} from "./link.utils.ts";

describe("utils", () => {
  describe("normalisePath", () => {
    it("removes leading and trailing slashes", () => {
      expect(normalisePath("/qualifier/identifier/")).toBe(
        "qualifier/identifier"
      );
    });

    it("returns the path unchanged when already normalised", () => {
      expect(normalisePath("qualifier/identifier")).toBe(
        "qualifier/identifier"
      );
    });
  });

  describe("validatePath", () => {
    it("should throw an error if the path is invalid", () => {
      expect(() => validatePath("invalid-path")).toThrow();
    });

    it("should throw an error if a qualifier/identifier pair is not provided.", () => {
      // Assert: one qualifier, no identifier
      expect(() => validatePath("qualifier")).toThrow();

      // Assert: two qualifiers, one identifier
      expect(() => validatePath("qualifier/identifier/qualifier")).toThrow();
    });
  });

  describe("validateType", () => {
    it("should throw an error if the type structure is invalid.", () => {
      expect(() => validateType("invalid-type")).toThrow();
    });

    it("should throw an error if the type is empty.", () => {
      expect(() => validateType("")).toThrow();
    });

    it("should throw an error if the main type is not in the correct format.", () => {
      expect(() => validateType("invalid-main-type/valid-subtype")).toThrow();
    });

    it("should not throw an error if the type is valid.", () => {
      expect(() => validateType("application/json")).not.toThrow();
    });
  });
});
