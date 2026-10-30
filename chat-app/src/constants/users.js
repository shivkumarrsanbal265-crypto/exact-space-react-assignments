// Official user list required by the Exactspace assignment
export const USER_LIST = ["Alan", "Bob", "Carol", "Dean", "Elin"];

// Visual metadata for users: avatar color and role for enhanced UI/UX
export const USER_METADATA = {
  Alan: {
    initials: "AL",
    color: "#3b82f6", // Blue
    role: "Frontend Engineer",
    status: "Active now",
  },
  Bob: {
    initials: "BB",
    color: "#10b981", // Emerald
    role: "Full Stack Developer",
    status: "Active now",
  },
  Carol: {
    initials: "CR",
    color: "#f59e0b", // Amber
    role: "UI/UX Designer",
    status: "In a meeting",
  },
  Dean: {
    initials: "DN",
    color: "#8b5cf6", // Purple
    role: "Backend Architect",
    status: "Active now",
  },
  Elin: {
    initials: "EE",
    color: "#f43f5e", // Rose
    role: "Lead Engineer",
    status: "Active now",
  },
};

/**
 * Returns a randomly assigned username from USER_LIST for each new message.
 */
export function getRandomUser() {
  const index = Math.floor(Math.random() * USER_LIST.length);
  return USER_LIST[index];
}

/**
 * Returns profile info for a username with fallback if not found
 */
export function getUserProfile(name) {
  if (USER_METADATA[name]) {
    return USER_METADATA[name];
  }
  const initials = name ? name.slice(0, 2).toUpperCase() : "U";
  return {
    initials,
    color: "#64748b",
    role: "Team Member",
    status: "Offline",
  };
}

