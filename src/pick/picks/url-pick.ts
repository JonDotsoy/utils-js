import { Pick } from "./pick.js";

/**
 * Specialized class for working with URLs.
 * Extends Pick<URL> without additional methods.
 */

export class URLPick<T extends URL | string> extends Pick<T> { }
