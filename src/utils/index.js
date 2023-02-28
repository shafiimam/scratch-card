export const getFontStyle = (style) => {
  switch (style) {
    case "regular":
      return {
        fontWeight: "500",
      };
    case "bold":
      return {
        fontWeight: "800",
      };
    case "italic":
      return {
        fontStyle: "italic",
      };
    case "light-italic":
      return {
        fontWeight: 100,
        fontStyle: "italic",
      };
    case "light":
      return {
        fontWeight: 100,
      };
    default:
      return;
  }
};
