export interface PhraseResponseOptions {
  keywords: string[];
  response: string;
}

interface PhraseResponse {
  keywords: Set<string>;
  response: string;
}

const wordRegexp = new RegExp(/\b\w+\b/, "g");

export function matchedWordCount(
  keywords: Set<string>,
  testString: string
): number {
  const words = testString.toLowerCase().matchAll(wordRegexp);
  if (!words) return 0;
  let score = 0;
  for (const word of words) {
    if (keywords.has(word[0].toLowerCase())) {
      score++;
    }
  }
  return score;
}

// resolves a response based on keyword reference count
export class PhraseMap {
  phraseResponses: PhraseResponse[] = [];

  add(phraseResponseOptions: PhraseResponseOptions) {
    this.phraseResponses.push({
      keywords: new Set(phraseResponseOptions.keywords),
      response: phraseResponseOptions.response,
    });
  }

  resolve(testString: string): string | undefined {
    let response: PhraseResponse | undefined;
    let lastConfidence = -1;
    for (const keywordResponse of this.phraseResponses) {
      const confidence = matchedWordCount(keywordResponse.keywords, testString);
      console.log(confidence);
      if (confidence > lastConfidence) {
        response = keywordResponse;
        lastConfidence = confidence;
      }
    }
    return response?.response;
  }
}
