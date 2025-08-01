export const fixed_values = {
  POST_MAX_TEXT_LENGTH: 600,
  COMMENT_MAX_TEXT_LENGTH: 250,
  MAX_POST_PREVIEW_LENGTH: 300,
  MAX_NOTIFICATION_PREVIEW_LENGTH: 50,
  POSTS_PER_PAGE: 10,
  COMMENTS_PER_PAGE: 10,
  ONLINE_THRESHOLD_MINUTES: 1,
};

export const labels = {
  USERNAME: "Username",
  FIRST_NAME: "First Name",
  LAST_NAME: "Last Name",
  EMAIL: "Email",
  PASSWORD: "Password",
  REPEAT_PASSWORD: "Repeat Password",
  DONT_HAVE_ACCOUNT: "Don't have an account?",
  ALREADY_HAVE_ACCOUNT: "Already have an account?",
  USER_UPDATED: "User updated",
  FILTER_KEYWORD_SEARCH: "Keyword Search",
  ADD_NEW_USER: "New User",
  SELECT_ROLE: "Select role",
  POST_DESCRIPTION: "Description",
  SELECT_MIN_RANK: "Select Min Rank",
  SELECT_MAX_RANK: "Select Max Rank",
  RANK_RANGE: "Rank Range",
  COMMENT: "Comment",
  COMMENT_PLACEHOLDER: "Share your thoughts...",
  POST_ABORT: "Reset",
  POST_SUBMIT: "Submit Post",
  COMMENT_SUBMIT: "Submit Comment",
  SHOW_COMMENTS: "Show comments",
  HIDE_COMMENTS: "Hide comments",
  CONFIRM_REMOVE_POST_HEADER: "Delete post",
  CONFIRM_REMOVE_POST_TEXT: "Are you sure you want delete the entire post?",
  CONFIRM_REMOVE_COMMENT_HEADER: "Delete comment",
  CONFIRM_REMOVE_COMMENT_TEXT: "Are you sure you want delete this comment?",
  LOOKING_FOR: "Looking For",
  BAN_FORM: "Ban Form",
  BAN_REASON: "Ban Reason",
  NOTIFICATIONS: "Notifications",
  MARK_AS_READ: "Mark as read",
  MARK_ALL_AS_READ: "Mark all as read",
  INBOX: "Inbox",
  SEND_FEEDBACK: "Send Feedback",
  FEEDBACK_TYPE: "Type of Feedback",
  SELECT_FEEDBACK_TYPE: "Select feedback type",
  DESCRIPTION: "Description",
  FEEDBACK_TEXT:
    "We appreciate your thoughts! You can report bugs, request features, or give general feedback below.",
  THANK_YOU_TITLE: "Thank you for your feedback!",
  THANK_YOU_TEXT:
    "We appreciate your time and input. Our team will review it as soon as possible.",
};

export const buttons = {
  HOME: "Home",
  GO_TO_HOME: "Go to Home",
  SUBMIT_ANOTHER_FEEDBACK: "Submit Another",
  SAVE: "Save",
  CANCEL: "Cancel",
  ADD_USER: "Add User",
  SIGN_IN: "Sign In",
  LOGOUT: "Logout",
  POST_HISTORY: "Post History",
  ADMIN_DASHBOARD: "Admin Dashboard",
  USER_MANAGEMENT: "User management",
  GO_BACK_DASHBOARD: "Back to Dashboard",
  CREATE_POST: "Create a Post",
  POSTS: "Posts",
  SUBMIT_POST: "Post Now",
  EDIT_POST: "Edit post",
  SUBMIT_CHANGES: "Submit changes",
  DELETE_POST: "Delete",
  EDIT_COMMENT: "Edit comment",
  DELETE_COMMENT: "Delete",
  SUBMIT_BAN: "Submit Ban",
  LOAD_NEW_POSTS: "New posts are available – click to load",
  LOAD_NEW_COMMENTS: "New comments are available – click to load",
  MANAGE: "Manage",
  VIEW: "View",
  BACK_TO_DASHBOARD: "Back to Dashboard",
  SEND_FEEDBACK: "Send Feedback",
  SUBMIT_FEEDBACK: "Submit Feedback",
};

export const errorMessage = {
  FIRST_NAME_REQUIRED: "First name is required",
  LAST_NAME_REQUIRED: "Last name is required",
  USERNAME_REQUIRED: "Username is required",
  ROLE_REQUIRED: "Role is required",
  USERNAME_PASSWORD_REQUIRED: "Username and password is required",
  COUNTRY_REQUIRED: "Country is required",
  VALID_EMAIL: "Enter a valid email address 'example@mail.com'",
  PASSWORD_VALIDATION:
    "Password must be at least 8 characters, include 1 uppercase letter, 1 number, and 1 special symbol.",
  PASSWORD_NOT_MATCH: "Passwords do not match",
  PASSWORD_AT_LEAST_8_CHARS: "At least 8 characters required.",
  PASSWORD_AT_LEAST_1_UPPERCASE: "At least 1 uppercase letter required.",
  PASSWORD_AT_LEAST_1_NUMBER: "At least 1 number required.",
  PASSWORD_AT_LEAST_1_SPECIAL_CHAR: "At least 1 special symbol required.",
  USERNAME_EXISTS: "Username already exists.",
  EMAIL_EXISTS: "Email already exists.",
  DESCRIPTION: "Description is required.",
  RANK_SELECTION: "Min and Max Rank are required.",
  POSITIONS_SELECTION: "At least one position is required.",
  BAN_REASON_REQUIRED: "Ban reason is required.",
  UNAUTHORIZED: "Unauthorized access",
  INVALID_ROLE: "Invalid role provided",
  FEEDBACK_TYPE_MISSING: "Please select a feedback type.",
  FEEDBACK_DESCRIPTION_AT_LEAST_10_CHAR:
    "Description should be at least 10 characters.",
};
