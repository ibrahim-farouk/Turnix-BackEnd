// src/common/utils/regex.js

// Mongo ObjectId
export const objectIdRegex = /^[a-f\d]{24}$/i;

// Egyptian mobile numbers
export const phoneRegex = /^01[0125][0-9]{8}$/;

// Employee ID (EMP-001)
export const employeeIdRegex = /^EMP-\d{3}$/;

// Ticket Number (A101, B115, ...)
export const ticketNumberRegex = /^[A-Z]\d{3}$/;

// Strong password (optional if you want stricter validation)
export const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;