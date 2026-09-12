/**
 * Production input sanitization utility to prevent XSS and malicious payloads
 */

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';

  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove inline event handlers like onerror, onclick, onload, etc.
    .replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    // Remove javascript: pseudoprotocol
    .replace(/javascript\s*:\s*/gi, '')
    // Remove data: URLs that might execute scripts
    .replace(/data\s*:\s*text\/html/gi, '')
    // Replace dangling angle brackets
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
};

export const sanitizeFileName = (fileName) => {
  if (typeof fileName !== 'string') return 'document.pdf';
  // Strip path traversal attempts like ../ or /
  return fileName
    .replace(/^.*[\\\/]/, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100);
};

export const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export default sanitizeInput;
