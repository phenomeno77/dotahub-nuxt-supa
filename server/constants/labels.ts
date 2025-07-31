export const ErrorMessages = {
  INVALID_NAME: "Invalid name. Only letters and hyphens (-) are allowed.",
  INVALID_USERNAME: "Invalid username. Only letters and numbers are allowed.",
  USERNAME_EXISTS: "Username already exists",
  EMAIL_EXISTS: "Email already exists",
  UNAUTHORIZED: "Unauthorized access",
  NO_PERMISSION: "No permission to access to this area",
  NOT_FOUND: "Resource not found",
  INTERNAL_SERVER_ERROR: "Something went wrong, please try again later",
  INVALID_USERAME_OR_PASSWORD: "Username or Password is invalid",
  USER_NOT_FOUND: "User not found",
  USERNAME_PASSWORD_REQUIRED: "Username and password required",
  PASSWORD_REQUIRED: "Password is required",
  INVALID_ROLE: "Invalid role provided",
  MIN_RANK_MAX_RANK_REQUIRED: "Both minimum Rank and maximum Rank are required",
  INVALID_RANK: "Invalid rank value provided",
  MIN_RANK_LESS_THAN_MAX_RANK:
    "Minimum Rank cannot be higher than maximum Rank",
  NO_POSITION_SELECTED: "At least one position must be selected",
  PARTY_SIZE_ERROR: "Party size must be between 1 and 5",
  POST_NOT_FOUND: "Post not found",
  BANNED_USER: "This account has been banned. Time left: ",
  LOGIN_REQUIRED: "Login required",
  POST_DESCRIPTION_LONG: "Too many characters for post!",
  COMMENT_CONTENT_LONG: "Too many characters for comment!",
  FEEDBACK_DESCRIPTION_AT_LEAST_10_CHAR:
    "Description should be at least 10 characters",
  INVALID_FEEDBACK_TYPE: "Invalid feedback type",
};

export const fixed_values = {
  POST_MAX_TEXT_LENGTH: 600,
  COMMENT_MAX_TEXT_LENGTH: 250,
  FEEDBACK_MESSAGE_MIN_LENGTH: 10,
};
