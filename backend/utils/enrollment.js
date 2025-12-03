// Allowed branches in your college
const ALLOWED_BRANCHES = ['CS', 'AI', 'DS', 'EC', 'ME', 'EE'];

// Allowed college codes (only these three)
const ALLOWED_COLLEGE_CODES = ['0157', '0103', '0176'];

// Regex for:
// 4 digits college code
// 2 letters branch
// 2 digits year
// 4 digits roll number
const REGEX = /^[0-9]{4}[A-Za-z]{2}[0-9]{2}[0-9]{4}$/;

function validateEnrollment(enrollment) {
  if (typeof enrollment !== "string") {
    return { valid: false, reason: "not-string" };
  }

  if (!REGEX.test(enrollment)) {
    return { valid: false, reason: "format" };
  }

  const collegeCode = enrollment.slice(0, 4);
  const branch = enrollment.slice(4, 6).toUpperCase();
  const year = enrollment.slice(6, 8);
  const roll = enrollment.slice(8, 12);

  // Validate college code (must be in allowlist)
  if (!ALLOWED_COLLEGE_CODES.includes(collegeCode)) {
    return { valid: false, reason: "collegeCode" };
  }

  // Validate branch
  if (!ALLOWED_BRANCHES.includes(branch)) {
    return { valid: false, reason: "branch" };
  }

  // Validate year in a 4-year range
  const currentYear = new Date().getFullYear() % 100; // "25" for 2025
  const yearNum = parseInt(year, 10);

  if (yearNum < currentYear - 4 || yearNum > currentYear) {
    return { valid: false, reason: "year" };
  }

  return {
    valid: true,
    parsed: { collegeCode, branch, year, roll }
  };
}

module.exports = { validateEnrollment };
