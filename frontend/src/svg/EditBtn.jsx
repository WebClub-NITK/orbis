import * as React from "react";
const SvgComponent = (props) => (
  <svg
    width="1em"
    height="1em"
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="m18.988 2.012 3 3L19.701 7.3l-3-3zM8 16h3l7.287-7.287-3-3L8 13z" />
    <path d="M19 19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .896-2 2v14c0 1.104.897 2 2 2h14a2 2 0 0 0 2-2v-8.668l-2 2V19z" />
  </svg>
);
export { SvgComponent as EditBtn };