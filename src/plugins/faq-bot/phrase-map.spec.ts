import { PhraseMap, matchedWordCount } from "./phrase-map";
describe("keywords", () => {
  test("matched word count", () => {
    expect(
      matchedWordCount(
        new Set(["foo", "bar", "buzz", "bazz"]),
        "foo bar buzz bazz"
      )
    ).toBe(4);
    expect(
      matchedWordCount(
        new Set(["foo", "bar", "buzz", "bazz"]),
        "foo? bar? buzz? bazz?"
      )
    ).toBe(4);
    expect(
      matchedWordCount(new Set(["buzz", "bazz"]), "foo? bar? buzz? bazz?")
    ).toBe(2);
  });

  test("matches phrases", () => {
    const keywordManager = new PhraseMap();
    keywordManager.add({
      keywords: ["foo", "bar", "buzz", "bazz"],
      response: "hi",
    });
    expect(keywordManager.resolve("foo bar?")).toBe("hi");
  });
});
