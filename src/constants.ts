export const allowedTags = Object.freeze([
  "em",
  "strong",
  "span",
  "sub",
  "sup",
  "u",
  "ins",
  "del",
  "b",
  "i",
  "q",
  "strike",
  "small",
  "br",
]);
export const RESULTS_PER_PAGE = 20;
export const HIGHEST_PRICE = 1000;

export const ProductPlaceholderImg =
  "data:image/jpeg;base64,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";