/**
 * Parser Module
 *
 * This is the main entry point for all parsing functionality. Instead of
 * spreading parsing logic across multiple files, we've consolidated it for
 * better maintainability.
 *
 * This module handles:
 * - Parsing boolean expressions from strings
 * - Converting expressions between different formats
 * - Formatting expression trees as strings
 */

// Re-export everything from the consolidated parser file
export * from './parser'

// Make parser types available
export * from './types'
